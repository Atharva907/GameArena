import app from "./app.js";
import { env } from "./config/env.js";
import { disconnectPostgres } from "./lib/postgres.js";

const server = app.listen(env.port, () => {
  console.log(`GameArena backend running on http://localhost:${env.port}`);
});

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
