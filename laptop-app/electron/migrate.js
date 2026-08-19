/**
 * Applies `prisma/migrations` to a SQLite file without the Prisma CLI.
 *
 * The web app runs `prisma migrate deploy` before `next dev`/`next start`, but
 * the packaged desktop app has no CLI and no schema engine to run — shipping
 * them would roughly double the bundle for something that, on SQLite, is just
 * "run these .sql files in order once".
 *
 * The bookkeeping table is Prisma's own `_prisma_migrations`, with Prisma's
 * column layout and checksums, so a database this file has migrated is
 * indistinguishable from one `prisma migrate deploy` produced — `prisma
 * migrate status` and `prisma migrate dev` keep working against it.
 */
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const Database = require("better-sqlite3");

const CREATE_BOOKKEEPING = `
CREATE TABLE IF NOT EXISTS "_prisma_migrations" (
    "id"                    TEXT PRIMARY KEY NOT NULL,
    "checksum"              TEXT NOT NULL,
    "finished_at"           DATETIME,
    "migration_name"        TEXT NOT NULL,
    "logs"                  TEXT,
    "rolled_back_at"        DATETIME,
    "started_at"            DATETIME NOT NULL DEFAULT current_timestamp,
    "applied_steps_count"   INTEGER UNSIGNED NOT NULL DEFAULT 0
)`;

/** Prisma checksums the raw bytes of migration.sql with SHA-256. */
function checksum(sql) {
  return crypto.createHash("sha256").update(sql).digest("hex");
}

function listMigrations(migrationsDir) {
  if (!fs.existsSync(migrationsDir)) return [];
  return fs
    .readdirSync(migrationsDir, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
    // Directory names are timestamp-prefixed, so lexical order is chronological.
    .sort()
    .map((name) => ({ name, file: path.join(migrationsDir, name, "migration.sql") }))
    .filter((m) => fs.existsSync(m.file));
}

/**
 * @param {{ dbPath: string, migrationsDir: string, log?: (msg: string) => void }} opts
 * @returns {string[]} the migrations applied by this call
 */
function applyMigrations({ dbPath, migrationsDir, log = () => {} }) {
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });

  const db = new Database(dbPath);
  const applied = [];
  try {
    db.pragma("journal_mode = WAL");
    db.exec(CREATE_BOOKKEEPING);

    // A migration that failed halfway leaves a row with no finished_at. Prisma
    // refuses to continue past one of those rather than guessing how much of it
    // landed, and so do we — silently re-running it could double-apply the part
    // that succeeded.
    const failed = db
      .prepare(
        `SELECT migration_name FROM "_prisma_migrations"
         WHERE finished_at IS NULL AND rolled_back_at IS NULL`
      )
      .all();
    if (failed.length > 0) {
      throw new Error(
        `Migration "${failed[0].migration_name}" was started but never finished. ` +
          `The database is in an unknown state; resolve it with ` +
          `\`npx prisma migrate resolve\` before starting the app again.`
      );
    }

    const done = new Set(
      db
        .prepare(`SELECT migration_name FROM "_prisma_migrations" WHERE rolled_back_at IS NULL`)
        .all()
        .map((r) => r.migration_name)
    );

    for (const migration of listMigrations(migrationsDir)) {
      if (done.has(migration.name)) continue;

      const sql = fs.readFileSync(migration.file, "utf8");
      log(`applying migration ${migration.name}`);

      // One transaction per migration: either the whole file lands and gets
      // recorded, or neither does. `PRAGMA defer_foreign_keys` in Prisma's
      // table-rewrite migrations is the in-transaction form of foreign_keys=OFF,
      // so those still behave correctly in here.
      db.transaction(() => {
        db.exec(sql);
        db.prepare(
          `INSERT INTO "_prisma_migrations"
             (id, checksum, finished_at, migration_name, logs, rolled_back_at,
              started_at, applied_steps_count)
           VALUES (?, ?, current_timestamp, ?, NULL, NULL, current_timestamp, 1)`
           // applied_steps_count is 1 to match what Prisma 7 writes: it applies
           // each migration file as a single step rather than per-statement.
        ).run(crypto.randomUUID(), checksum(sql), migration.name);
      })();

      applied.push(migration.name);
    }
  } finally {
    db.close();
  }

  return applied;
}

module.exports = { applyMigrations };
