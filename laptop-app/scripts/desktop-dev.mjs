/**
 * Runs the desktop app against `next dev` instead of a built bundle, so the
 * window picks up code changes on save.
 *
 * The dev server runs under the system Node here, not Electron-as-Node, so this
 * path needs no native-module rebuild — which is also why it is the one to use
 * while working on the app, and `npm run desktop` the one to use when checking
 * how the real thing behaves.
 */
import { spawn } from "node:child_process";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";

const appDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PORT = Number(process.env.PORT) || 3000;
const URL_ = `http://127.0.0.1:${PORT}`;
const shell = process.platform === "win32";

const children = [];
function shutdown(code) {
  for (const child of children) child.kill();
  process.exit(code);
}
process.on("SIGINT", () => shutdown(0));
process.on("SIGTERM", () => shutdown(0));

function waitForServer(deadline = Date.now() + 120_000) {
  return new Promise((resolve, reject) => {
    const attempt = () => {
      if (Date.now() > deadline) return reject(new Error("next dev never came up"));
      const req = http.get(URL_, (res) => {
        res.resume();
        resolve();
      });
      req.on("error", () => setTimeout(attempt, 300));
      req.setTimeout(2000, () => req.destroy());
    };
    attempt();
  });
}

const next = spawn("npm", ["run", "dev", "--", "--port", String(PORT)], {
  cwd: appDir,
  stdio: "inherit",
  shell,
});
children.push(next);
next.on("exit", (code) => shutdown(code ?? 1));

await waitForServer();

// Required from plain Node, the electron package resolves to the path of its
// binary rather than to the Electron API.
const { default: electronPath } = await import("electron");
const app = spawn(electronPath, [path.join(appDir, "electron", "main.js")], {
  cwd: appDir,
  stdio: "inherit",
  env: { ...process.env, DESKTOP_DEV_URL: URL_ },
});
children.push(app);
// Closing the window ends the session; the dev server has no reason to outlive it.
app.on("exit", (code) => shutdown(code ?? 0));
