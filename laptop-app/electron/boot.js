/**
 * Entry point for the server child process, copied into the Next standalone
 * bundle at build time (see scripts/build-desktop.mjs).
 *
 * The web app runs `prisma migrate deploy` from an npm script before the server
 * starts. There is no npm script in a packaged desktop app, so the same job is
 * done here — in-process, right before handing over to Next — which also means
 * a user opening the app after an update gets their database migrated without
 * being asked to do anything.
 *
 * This file lives inside the bundle rather than being required from the
 * Electron app directory so that `better-sqlite3` resolves to the bundle's own
 * copy. There is exactly one build of that native module in the package, and
 * this keeps everything pointed at it.
 */
const path = require("path");
const { applyMigrations } = require("./migrate.js");

// Electron kills this process on a clean quit, but a crash or a SIGKILL of the
// main process would leave an orphaned server holding the port and the database
// open, with no window to close. Losing the IPC channel means the parent is
// gone whichever way it went.
process.on("disconnect", () => process.exit(0));

const dbPath = String(process.env.DATABASE_URL || "").replace(/^file:/, "");
if (!dbPath) {
  console.error("[desktop] DATABASE_URL was not set; refusing to start.");
  process.exit(1);
}

const migrationsDir =
  process.env.DESKTOP_MIGRATIONS_DIR || path.join(__dirname, "..", "prisma", "migrations");

const applied = applyMigrations({
  dbPath,
  migrationsDir,
  log: (msg) => console.log(`[desktop] ${msg}`),
});

console.log(
  applied.length > 0
    ? `[desktop] database ready at ${dbPath} (${applied.length} migration(s) applied)`
    : `[desktop] database ready at ${dbPath}`
);

// Next's standalone server reads PORT and HOSTNAME from the environment and
// resolves its own assets relative to its directory, so requiring it is all
// that is left to do.
require("../server.js");
