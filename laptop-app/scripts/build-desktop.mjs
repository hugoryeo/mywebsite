/**
 * Builds the desktop app's server bundle.
 *
 * `next build` leaves `.next/standalone` almost, but not quite, runnable: it
 * deliberately omits static assets, and it has no idea about the desktop
 * bootstrap or the migration files. This script finishes the job, and then
 * swaps in a copy of better-sqlite3 compiled for Electron.
 *
 * That last part is the fiddly bit. The packaged app runs the server through
 * Electron-as-Node, whose native module ABI is Electron's, not the system
 * Node's — so the binary that works in `npm run dev` will not load in the
 * packaged app, and vice versa. Rather than leave the working tree switched
 * over to Electron's ABI (which silently breaks `npm run dev` until the next
 * `npm install`), the rebuild happens after the bundle is assembled, the
 * resulting binary is copied into the bundle, and the working tree is put back
 * the way it was.
 *
 * Native code cannot be cross-compiled here, so a macOS package has to be built
 * on macOS and a Windows package on Windows.
 */
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const appDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const standalone = path.join(appDir, ".next", "standalone");
const BINDING = path.join("node_modules", "better-sqlite3", "build", "Release", "better_sqlite3.node");

function run(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: appDir,
      stdio: "inherit",
      // npm and npx are batch files on Windows, which spawn cannot run directly.
      shell: process.platform === "win32",
    });
    child.on("error", reject);
    child.on("exit", (code) =>
      code === 0 ? resolve() : reject(new Error(`${command} ${args.join(" ")} exited with ${code}`))
    );
  });
}

function copyDir(from, to) {
  fs.mkdirSync(path.dirname(to), { recursive: true });
  fs.cpSync(from, to, { recursive: true });
}

function step(message) {
  console.log(`\n> ${message}`);
}

async function assemble() {
  step("Building the Next.js server");
  await run("npx", ["next", "build"]);

  step("Assembling the standalone bundle");

  // `next build` writes these two outside the standalone directory on purpose —
  // in a normal deployment they are served by a CDN. Here nothing else is
  // serving them, so they go in alongside the server.
  copyDir(path.join(appDir, ".next", "static"), path.join(standalone, ".next", "static"));
  if (fs.existsSync(path.join(appDir, "public"))) {
    copyDir(path.join(appDir, "public"), path.join(standalone, "public"));
  }

  // The bootstrap and the migrations it applies live inside the bundle so that
  // `require("better-sqlite3")` from the bootstrap resolves to the bundle's own
  // copy — the one this script is about to rebuild.
  fs.mkdirSync(path.join(standalone, "desktop"), { recursive: true });
  for (const file of ["boot.js", "migrate.js"]) {
    fs.copyFileSync(path.join(appDir, "electron", file), path.join(standalone, "desktop", file));
  }
  copyDir(path.join(appDir, "prisma", "migrations"), path.join(standalone, "prisma", "migrations"));

  // sharp is traced in because Next's image optimizer imports it, but this app
  // has no next/image anywhere — it is ~45MB of platform-specific binaries that
  // nothing will ever call.
  for (const dead of ["sharp", "@img"]) {
    fs.rmSync(path.join(standalone, "node_modules", dead), { recursive: true, force: true });
  }

  // `next build` copies the developer's .env files into the standalone output,
  // which is right for a server deployment and wrong for something handed to
  // other people: it would ship whatever secrets are in there, and its stale
  // DATABASE_URL would point at the build machine's dev.db. Everything the
  // desktop app needs comes from Electron's environment or the Settings page.
  for (const entry of fs.readdirSync(standalone)) {
    if (entry.startsWith(".env")) fs.rmSync(path.join(standalone, entry), { force: true });
  }
}

async function swapInElectronAbi() {
  const electronVersion = require("electron/package.json").version;
  step(`Rebuilding better-sqlite3 for Electron ${electronVersion}`);

  const { rebuild } = await import("@electron/rebuild");
  await rebuild({ buildPath: appDir, electronVersion, force: true, onlyModules: ["better-sqlite3"] });

  const target = path.join(standalone, BINDING);
  if (!fs.existsSync(target)) {
    throw new Error(
      `Expected the traced bundle to contain ${BINDING}. The build cannot ` +
        `continue: without it the packaged app would start and then fail on ` +
        `its first database call.`
    );
  }
  fs.copyFileSync(path.join(appDir, BINDING), target);
  console.log("  copied the Electron-ABI binding into the bundle");
}

async function restoreNodeAbi() {
  step("Restoring the Node-ABI build of better-sqlite3 for `npm run dev`");
  await run("npm", ["rebuild", "better-sqlite3"]);
}

async function main() {
  await assemble();
  try {
    await swapInElectronAbi();
  } finally {
    // Even if the rebuild blew up partway, the working tree must not be left
    // holding a half-built or Electron-ABI module.
    await restoreNodeAbi();
  }
  step(`Desktop server bundle ready at ${path.relative(process.cwd(), standalone)}`);
}

main().catch((err) => {
  console.error(`\n${err.stack || err.message}`);
  process.exit(1);
});
