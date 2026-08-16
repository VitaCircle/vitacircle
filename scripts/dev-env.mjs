#!/usr/bin/env node
import { spawn, spawnSync } from "node:child_process";
import { copyFileSync, existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { createInterface } from "node:readline";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const command = process.argv[2] || "start";
const yes = process.argv.includes("--yes") || process.argv.includes("-y");

const urls = {
  web: "http://localhost:3000",
  api: "http://localhost:4000",
  apiHealth: "http://localhost:4000/health",
  ai: "http://localhost:8000",
  aiDocs: "http://localhost:8000/docs",
  admin: "http://localhost:3000/app/admin",
  minio: "http://localhost:9001",
};

function log(msg) {
  console.log(msg);
}

function fail(msg, code = 1) {
  console.error(`\nERROR: ${msg}\n`);
  process.exit(code);
}

function compose(...args) {
  const result = spawnSync("docker", ["compose", ...args], {
    cwd: root,
    stdio: "inherit",
    shell: process.platform === "win32",
  });
  if (result.error) fail(`Docker Compose failed to start: ${result.error.message}`);
  return result.status ?? 1;
}

function ensureDocker() {
  const info = spawnSync("docker", ["info"], { stdio: "pipe", shell: process.platform === "win32" });
  if (info.status !== 0) {
    fail("Docker is not running. Start Docker Desktop, then retry.");
  }
}

function ensureEnv() {
  const envPath = resolve(root, ".env");
  const example = resolve(root, ".env.example");
  if (!existsSync(envPath)) {
    if (!existsSync(example)) fail("Missing .env.example");
    copyFileSync(example, envPath);
    log("Created .env from .env.example");
  }
  const webEnv = resolve(root, "apps/web/.env.local");
  const webExample = resolve(root, "apps/web/.env.example");
  if (!existsSync(webEnv) && existsSync(webExample)) {
    copyFileSync(webExample, webEnv);
  }
  return loadDotenv(envPath);
}

function loadDotenv(filePath) {
  const out = {};
  if (!existsSync(filePath)) return out;
  for (const line of readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq < 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    out[key] = value;
    if (process.env[key] === undefined) process.env[key] = value;
  }
  return out;
}

async function waitFor(name, url, timeoutMs = 120000) {
  const start = Date.now();
  log(`Waiting for ${name} (${url})...`);
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url, { redirect: "manual" });
      if (res.status >= 200 && res.status < 500) {
        log(`  ${name} is up (${res.status})`);
        return;
      }
    } catch {
      // still starting
    }
    await new Promise((r) => setTimeout(r, 2000));
  }
  log(`\n--- last logs: ${name} ---`);
  compose("logs", "--tail", "80", name);
  fail(`${name} did not become healthy within ${Math.round(timeoutMs / 1000)}s`);
}

function printBanner(env) {
  const email = env.BOOTSTRAP_ADMIN_EMAIL || process.env.BOOTSTRAP_ADMIN_EMAIL || "admin@vitacircle.local";
  console.log(`
========================================
 Environment Started Successfully
========================================

Application:     ${urls.web}
API:             ${urls.api}
API health:      ${urls.apiHealth}
AI:              ${urls.ai}
AI docs:         ${urls.aiDocs}
Admin (app):     ${urls.admin}
MinIO console:   ${urls.minio}

Database:        MongoDB  localhost:27017
Cache:           Redis    localhost:6379

Dev admin:       ${email}  (password from .env)

All services are healthy.
========================================
`);
}

function seed(indexesOnly = false) {
  const args = ["compose", "exec", "-T", "api", "node", "dist/scripts/seed.js"];
  if (indexesOnly) args.push("--indexes-only");
  const result = spawnSync("docker", args, {
    cwd: root,
    stdio: "inherit",
    shell: process.platform === "win32",
  });
  if (result.status !== 0) fail(indexesOnly ? "migrate failed" : "seed failed");
}

async function confirmReset() {
  if (yes) return true;
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  const answer = await new Promise((resolveAnswer) => {
    rl.question("This DELETES Mongo/Redis/MinIO/storage volumes. Type 'reset' to continue: ", resolveAnswer);
  });
  rl.close();
  return String(answer).trim() === "reset";
}

async function start({ build = false } = {}) {
  ensureDocker();
  const env = ensureEnv();
  const upArgs = ["up", "-d"];
  if (build) upArgs.push("--build");
  log("Starting Docker services...");
  if (compose(...upArgs) !== 0) fail("docker compose up failed");
  await waitFor("api", urls.apiHealth);
  await waitFor("ai", `${urls.ai}/health`);
  await waitFor("web", urls.web);
  seed(false);
  printBanner(env);
}

async function health() {
  const checks = [
    ["web", urls.web],
    ["api", urls.apiHealth],
    ["ai", `${urls.ai}/health`],
    ["ai-docs", urls.aiDocs],
    ["minio", urls.minio],
  ];
  let ok = true;
  for (const [name, url] of checks) {
    try {
      const res = await fetch(url, { redirect: "manual" });
      const status = res.status >= 200 && res.status < 500;
      log(`${status ? "ok  " : "FAIL"}  ${name.padEnd(10)} ${url}  (${res.status})`);
      if (!status) ok = false;
    } catch (err) {
      log(`FAIL  ${name.padEnd(10)} ${url}  (${err instanceof Error ? err.message : "unreachable"})`);
      ok = false;
    }
  }
  if (!ok) process.exit(1);
}

async function main() {
  switch (command) {
    case "start":
      await start({ build: true });
      break;
    case "stop":
      ensureDocker();
      if (compose("stop") !== 0) fail("stop failed");
      log("Stopped. Volumes were kept.");
      break;
    case "restart":
      ensureDocker();
      compose("stop");
      await start({ build: false });
      break;
    case "logs": {
      ensureDocker();
      const child = spawn("docker", ["compose", "logs", "-f", ...process.argv.slice(3)], {
        cwd: root,
        stdio: "inherit",
        shell: process.platform === "win32",
      });
      child.on("exit", (code) => process.exit(code ?? 0));
      return;
    }
    case "migrate":
      ensureDocker();
      seed(true);
      break;
    case "seed":
      ensureDocker();
      seed(false);
      break;
    case "health":
      await health();
      break;
    case "rebuild":
      ensureDocker();
      ensureEnv();
      if (compose("up", "-d", "--build", "--force-recreate") !== 0) fail("rebuild failed");
      await waitFor("api", urls.apiHealth);
      await waitFor("web", urls.web);
      seed(false);
      printBanner(ensureEnv());
      break;
    case "reset":
      ensureDocker();
      if (!(await confirmReset())) {
        log("Aborted.");
        break;
      }
      if (compose("down", "-v") !== 0) fail("reset down failed");
      await start({ build: true });
      break;
    default:
      fail(`Unknown command '${command}'. Use start|stop|restart|logs|migrate|seed|health|rebuild|reset`);
  }
}

main().catch((err) => fail(err instanceof Error ? err.message : String(err)));
