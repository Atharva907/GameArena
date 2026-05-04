import app from "./app.js";
import { spawn } from "node:child_process";
import { env } from "./config/env.js";
import { disconnectPostgres } from "./lib/postgres.js";

const server = app.listen(env.port, () => {
  console.log(`GameArena backend running on http://localhost:${env.port}`);
  runStartupMigrations();
});

function runStartupMigrations() {
  if (process.env.RUN_MIGRATIONS_ON_START !== "true") return;

  const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
  const migration = spawn(npmCommand, ["run", "db:migrate:deploy"], {
    cwd: process.cwd(),
    env: process.env,
    stdio: "inherit",
  });

  migration.on("exit", (code) => {
    if (code === 0) {
      console.log("Startup database migrations completed.");
      return;
    }

    console.error(`Startup database migrations failed with exit code ${code}.`);
  });

  migration.on("error", (error) => {
    console.error(`Startup database migrations could not be started: ${error.message}`);
  });
}

async function shutdown(signal) {
  console.log(`${signal} received. Shutting down backend...`);
  try {
    await disconnectPostgres();
  } catch (error) {
    console.warn(`PostgreSQL disconnect skipped: ${error.message}`);
  }

  server.close(() => {
    process.exit(0);
  });
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
