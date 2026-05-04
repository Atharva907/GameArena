import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import dotenv from "dotenv";

const projectRoot = process.cwd();
const envLocalPath = path.join(projectRoot, ".env.local");
const envPath = path.join(projectRoot, ".env");

if (fs.existsSync(envLocalPath)) {
  dotenv.config({ path: envLocalPath });
} else if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

const isProduction =
  process.env.NODE_ENV === "production" || process.argv.includes("--production");

const placeholderPatterns = [
  /^replace-with-/i,
  /^your-/i,
  /<username>/i,
  /<password>/i,
  /<cluster>/i,
  /example\.com/i,
];

const required = [
  {
    key: "SECRET_KEY",
    reason: "JWT signing and protected route authentication.",
  },
  {
    key: "NEXT_PUBLIC_BASE_URL",
    reason: "Email links, redirects, and canonical app URL.",
  },
];

const databaseProvider = String(process.env.DATABASE_PROVIDER || "postgresql")
  .trim()
  .toLowerCase();
const allowedDatabaseProviders = new Set(["postgres", "postgresql"]);
const imagekitRequired = [
  "IMAGEKIT_PRIVATE_KEY",
];
const mailRequired = ["NODEMAILER_EMAIL", "NODEMAILER_PASSWORD"];

const problems = [];
const warnings = [];

function hasValue(key) {
  return Boolean(String(process.env[key] || "").trim());
}

function isPlaceholder(value) {
  return placeholderPatterns.some((pattern) => pattern.test(value));
}

function checkKey(key, severity = "error", reason = "") {
  const value = String(process.env[key] || "").trim();

  if (!value) {
    const target = severity === "error" ? problems : warnings;
    target.push(`${key} is missing${reason ? `: ${reason}` : "."}`);
    return;
  }

  if (isPlaceholder(value)) {
    const target = severity === "error" ? problems : warnings;
    target.push(`${key} still looks like a placeholder value.`);
  }
}

for (const item of required) {
  checkKey(item.key, "error", item.reason);
}

if (!allowedDatabaseProviders.has(databaseProvider)) {
  problems.push("DATABASE_PROVIDER must be postgres or postgresql.");
}

checkKey("DATABASE_URL", "error", "PostgreSQL connection string.");

if (hasValue("DATABASE_URL") && isPlaceholder(process.env.DATABASE_URL)) {
  problems.push("DATABASE_URL still looks like a placeholder value.");
}

for (const key of imagekitRequired) {
  checkKey(key, isProduction ? "error" : "warning");
}

for (const key of mailRequired) {
  checkKey(key, isProduction ? "error" : "warning");
}

if (hasValue("NODEMAILER_HOST") && hasValue("NODEMAILER_SERVICE")) {
  warnings.push(
    "Both NODEMAILER_HOST and NODEMAILER_SERVICE are set. Nodemailer can use either, but host/port is clearer for production.",
  );
}

if (hasValue("SECRET_KEY") && process.env.SECRET_KEY.length < 32) {
  problems.push("SECRET_KEY should be at least 32 characters long.");
}

if (hasValue("JWT_SECRET") && process.env.JWT_SECRET !== process.env.SECRET_KEY) {
  warnings.push(
    "JWT_SECRET is set but most routes use SECRET_KEY. Keep them equal or remove JWT_SECRET to avoid confusion.",
  );
}

if (warnings.length) {
  console.warn("Environment warnings:");
  for (const warning of warnings) {
    console.warn(`- ${warning}`);
  }
}

if (problems.length) {
  console.error("Environment validation failed:");
  for (const problem of problems) {
    console.error(`- ${problem}`);
  }
  process.exit(1);
}

console.log(
  `Environment validation passed (${isProduction ? "production" : "development"} mode).`,
);
