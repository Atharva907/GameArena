import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import dotenv from "dotenv";

const projectRoot = process.cwd();
const rootEnvLocal = path.resolve(projectRoot, "..", ".env.local");
const backendEnv = path.resolve(projectRoot, ".env");

if (fs.existsSync(rootEnvLocal)) {
  dotenv.config({ path: rootEnvLocal });
}

if (fs.existsSync(backendEnv)) {
  dotenv.config({ path: backendEnv, override: true });
}

const required = ["SECRET_KEY", "FRONTEND_ORIGIN"];
const problems = [];

const hasValue = (key) => Boolean(String(process.env[key] || "").trim());
const isPlaceholder = (value) =>
  /^replace-with-|^your-|<username>|<password>|<cluster>/i.test(value);
const databaseProvider = String(process.env.DATABASE_PROVIDER || "postgresql")
  .trim()
  .toLowerCase();
const allowedDatabaseProviders = new Set(["postgres", "postgresql"]);

for (const key of required) {
  const value = String(process.env[key] || "").trim();

  if (!value) {
    problems.push(`${key} is missing.`);
  } else if (isPlaceholder(value)) {
    problems.push(`${key} still looks like a placeholder.`);
  }
}

if (!allowedDatabaseProviders.has(databaseProvider)) {
  problems.push("DATABASE_PROVIDER must be postgres or postgresql.");
}

if (!hasValue("DATABASE_URL")) {
  problems.push("DATABASE_URL is required.");
} else if (isPlaceholder(process.env.DATABASE_URL)) {
  problems.push("DATABASE_URL still looks like a placeholder.");
}

if (hasValue("SECRET_KEY") && process.env.SECRET_KEY.length < 32) {
  problems.push("SECRET_KEY must be at least 32 characters.");
}

if (problems.length) {
  console.error("Backend environment validation failed:");
  for (const problem of problems) {
    console.error(`- ${problem}`);
  }
  process.exit(1);
}

console.log("Backend environment validation passed.");
