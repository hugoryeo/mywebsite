/**
 * Electron main process.
 *
 * The app is a Next.js server app — Server Actions, server-side Prisma — so
 * there is no static bundle to point a window at. Instead this process starts
 * the Next production server on localhost as a child process and loads it in a
 * BrowserWindow. The window is a browser; the desktop-specific work all happens
 * here: choosing where the database lives, starting and stopping the server,
 * and keeping navigation inside the app.
 */
const { app, BrowserWindow, dialog, shell } = require("electron");
const path = require("path");
const fs = require("fs");
const net = require("net");
const http = require("http");
const { fork } = require("child_process");

// Without this, `app.getName()` falls back to the package.json name
// ("laptop-app") when run unpackaged and to the electron-builder productName
// when packaged — which would put the database in two different places
// depending on how the app was started. Naming it here makes `npm run desktop`
// and the installed app share one database, which is what anyone would expect.
app.setName("Laptop Sales Tracker");

const HOST = "127.0.0.1";

// A fixed port rather than an ephemeral one: the eBay OAuth redirect URI is
// registered with eBay ahead of time, so the callback URL has to be the same
// on every launch. If something else already holds it we walk upwards, which
// breaks the eBay redirect but still gets the app open.
const PREFERRED_PORT = 41827;
const PORT_ATTEMPTS = 20;

// How long the server gets to answer before we give up and show the log.
const SERVER_START_TIMEOUT_MS = 90_000;

/** Where the built Next server and its bundled node_modules live. */
function resolveServerDir() {
  return app.isPackaged
    ? path.join(process.resourcesPath, "next")
    : path.join(__dirname, "..", ".next", "standalone");
}

/**
 * The database deliberately does not live next to the app bundle: on macOS that
 * is inside the read-only .app, and on Windows it would be wiped by the next
 * installer run. `userData` is the OS-blessed place for it and survives
 * upgrades.
 */
function resolveDatabasePath() {
  return path.join(app.getPath("userData"), "laptops.db");
}

function isPortFree(port) {
  return new Promise((resolve) => {
    const probe = net.createServer();
    probe.once("error", () => resolve(false));
    probe.once("listening", () => probe.close(() => resolve(true)));
    probe.listen(port, HOST);
  });
}

async function findPort() {
  for (let i = 0; i < PORT_ATTEMPTS; i++) {
    if (await isPortFree(PREFERRED_PORT + i)) return PREFERRED_PORT + i;
  }
  throw new Error(
    `No free port in ${PREFERRED_PORT}-${PREFERRED_PORT + PORT_ATTEMPTS - 1}.`
  );
}

/** Resolves once the server answers on `url`, rejects if it never does. */
function waitForServer(url, isDead) {
  const deadline = Date.now() + SERVER_START_TIMEOUT_MS;
  return new Promise((resolve, reject) => {
    const attempt = () => {
      if (isDead()) {
        reject(new Error("The server exited before it finished starting."));
        return;
      }
      if (Date.now() > deadline) {
        reject(new Error(`The server did not respond within ${SERVER_START_TIMEOUT_MS / 1000}s.`));
        return;
      }
      const req = http.get(url, (res) => {
        res.resume();
        // Any HTTP status means something is listening and routing; a 404 or a
        // 500 is the app's problem to show, not a reason to keep waiting.
        resolve();
      });
      req.on("error", () => setTimeout(attempt, 250));
      req.setTimeout(2000, () => req.destroy());
    };
    attempt();
  });
}

/** Server state, so `will-quit` can shut the child down and errors can show the log. */
const server = { child: null, exited: false, log: [] };

function recordLog(chunk) {
  const text = chunk.toString();
  process.stdout.write(text);
  server.log.push(text);
  // Only the tail is ever shown, and an app left running for days shouldn't
  // accumulate its whole request log in memory.
  if (server.log.length > 200) server.log.splice(0, server.log.length - 200);
}

function startServer(port, dbPath) {
  const serverDir = resolveServerDir();
  const entry = path.join(serverDir, "desktop", "boot.js");

  if (!fs.existsSync(entry)) {
    throw new Error(
      `No built server found at ${entry}.\n\n` +
        `Run \`npm run desktop:build\` in laptop-app first.`
    );
  }

  server.child = fork(entry, [], {
    cwd: serverDir,
    // fork() reuses process.execPath, which in a packaged app is the Electron
    // binary. ELECTRON_RUN_AS_NODE makes it behave as plain Node — that is why
    // better-sqlite3 has to be built against Electron's ABI, not the system
    // Node's.
    env: {
      ...process.env,
      ELECTRON_RUN_AS_NODE: "1",
      NODE_ENV: "production",
      HOSTNAME: HOST,
      PORT: String(port),
      DATABASE_URL: `file:${dbPath}`,
      DESKTOP_MIGRATIONS_DIR: path.join(serverDir, "prisma", "migrations"),
    },
    stdio: ["ignore", "pipe", "pipe", "ipc"],
  });

  server.child.stdout.on("data", recordLog);
  server.child.stderr.on("data", recordLog);
  server.child.on("exit", (code) => {
    server.exited = true;
    recordLog(`\n[desktop] server process exited with code ${code}\n`);
  });
}

function stopServer() {
  if (!server.child || server.exited) return;
  server.child.kill();
}

function createWindow(url) {
  const win = new BrowserWindow({
    width: 1360,
    height: 900,
    minWidth: 720,
    minHeight: 560,
    // Matches --background in globals.css, so resizing doesn't flash white.
    backgroundColor: "#06080b",
    show: false,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  win.once("ready-to-show", () => win.show());
  win.loadURL(url);

  const isInternal = (target) => {
    try {
      return new URL(target).origin === new URL(url).origin;
    } catch {
      return false;
    }
  };

  // eBay's OAuth consent page and any other outbound link belong in the real
  // browser, where the user can see the address bar they are trusting.
  win.webContents.setWindowOpenHandler(({ url: target }) => {
    if (/^https?:/.test(target)) shell.openExternal(target);
    return { action: "deny" };
  });
  win.webContents.on("will-navigate", (event, target) => {
    if (!isInternal(target)) {
      event.preventDefault();
      if (/^https?:/.test(target)) shell.openExternal(target);
    }
  });

  return win;
}

function showStartupFailure(err) {
  dialog.showErrorBox(
    "Laptop Sales Tracker could not start",
    `${err.message}\n\n--- server log ---\n${server.log.join("").slice(-4000)}`
  );
  app.exit(1);
}

/** The URL the window loads, started on demand and reused across windows. */
let appUrlPromise = null;

function appUrl() {
  if (appUrlPromise) return appUrlPromise;
  appUrlPromise = (async () => {
    // Set by scripts/desktop-dev.mjs, which runs `next dev` itself; there is
    // nothing for this process to start.
    if (process.env.DESKTOP_DEV_URL) return process.env.DESKTOP_DEV_URL;

    const port = await findPort();
    startServer(port, resolveDatabasePath());
    const url = `http://${HOST}:${port}`;
    await waitForServer(url, () => server.exited);
    return url;
  })();
  return appUrlPromise;
}

async function openWindow() {
  return createWindow(await appUrl());
}

// Two copies of the app would fight over the port and the SQLite file, so a
// second launch focuses the first instead of starting its own server.
if (!app.requestSingleInstanceLock()) {
  app.quit();
} else {
  app.on("second-instance", () => {
    const [win] = BrowserWindow.getAllWindows();
    if (!win) return;
    if (win.isMinimized()) win.restore();
    win.focus();
  });

  app.whenReady().then(() => {
    openWindow().catch(showStartupFailure);

    // macOS keeps the app running with no windows; the dock icon reopens one
    // against the server that is already up.
    app.on("activate", () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        openWindow().catch(showStartupFailure);
      }
    });
  });

  app.on("window-all-closed", () => {
    if (process.platform !== "darwin") app.quit();
  });

  app.on("will-quit", stopServer);
  // A crash in the main process still has to take the server child with it,
  // otherwise it keeps the port and the database file held open.
  process.on("exit", stopServer);
}
