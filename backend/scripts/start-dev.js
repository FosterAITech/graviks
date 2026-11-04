import { execSync, spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const PORT = process.env.PORT || "5000";
const PORT_WAIT_TIMEOUT_MS = 5000;
const PORT_POLL_INTERVAL_MS = 250;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const backendRoot = path.resolve(__dirname, "..");
const isWindows = process.platform === "win32";
const nodemonScript = path.join(
  backendRoot,
  "node_modules",
  "nodemon",
  "bin",
  "nodemon.js"
);

const findPortOwner = () => {
  try {
    const command = isWindows
      ? `netstat -ano | findstr :${PORT}`
      : `lsof -i :${PORT} -t`;
    const output = execSync(command, { encoding: "utf8" }).trim();
    if (!output) return null;

    if (isWindows) {
      const line = output.split(/\r?\n/).find((item) => item.includes(`:${PORT}`));
      if (!line) return null;

      const parts = line.trim().split(/\s+/);
      const pid = parts[parts.length - 1];
      return /^\d+$/.test(pid) ? pid : null;
    }

    const pid = output.split(/\r?\n/)[0].trim();
    return /^\d+$/.test(pid) ? pid : null;
  } catch {
    return null;
  }
};

const killPort = (pid) => {
  try {
    if (isWindows) {
      execSync(`taskkill /F /T /PID ${pid}`, { stdio: "ignore" });
    } else {
      process.kill(Number(pid), "SIGKILL");
    }

    console.log(`Freed port ${PORT} by killing PID ${pid}`);
  } catch (error) {
    console.warn(`Failed to free port ${PORT}: ${error.message}`);
  }
};

const waitForPortToClear = async () => {
  const startedAt = Date.now();

  while (findPortOwner()) {
    if (Date.now() - startedAt > PORT_WAIT_TIMEOUT_MS) {
      throw new Error(`Port ${PORT} is still in use after waiting ${PORT_WAIT_TIMEOUT_MS}ms`);
    }

    await new Promise((resolve) => setTimeout(resolve, PORT_POLL_INTERVAL_MS));
  }
};

const startNodemon = () => {
  console.log(`Starting backend on port ${PORT}...`);
  const child = spawn(process.execPath, [nodemonScript, "server.js"], {
    cwd: backendRoot,
    stdio: "inherit",
  });

  child.on("close", (code) => {
    process.exit(code ?? 0);
  });
};

const bootstrap = async () => {
  const existingPid = findPortOwner();
  if (existingPid) {
    console.log(`Port ${PORT} is already in use by PID ${existingPid}.`);
    killPort(existingPid);
    await waitForPortToClear();
  }

  startNodemon();
};

bootstrap().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
