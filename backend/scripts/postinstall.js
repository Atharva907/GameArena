import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import dotenv from "dotenv";

const projectRoot = process.cwd();
const rootEnvLocal = path.resolve(projectRoot, "..", ".env.local");
const backendEnvLocal = path.resolve(projectRoot, ".env.local");
const backendEnv = path.resolve(projectRoot, ".env");

for (const file of [rootEnvLocal, backendEnvLocal, backendEnv]) {
  if (fs.existsSync(file)) {
    dotenv.config({ path: file, override: file === backendEnv });
  }
}

if (!String(process.env.DATABASE_URL || "").trim()) {
  process.env.DATABASE_URL =
    "postgresql://localhost:5432/gamearena?schema=public";
  console.log(
    "DATABASE_URL not found. Using a local fallback for Prisma client generation.",
  );
}

const legacyWorkspaceLink = path.join(projectRoot, "node_modules", "gamearena");
try {
  if (fs.existsSync(legacyWorkspaceLink)) {
    fs.rmSync(legacyWorkspaceLink, { recursive: true, force: true });
    console.log("Removed legacy backend/node_modules/gamearena junction.");
  }
} catch (error) {
  console.warn(`Failed to remove legacy junction: ${error.message}`);
}

const prismaBin = path.join(
  projectRoot,
  "node_modules",
  ".bin",
  process.platform === "win32" ? "prisma.cmd" : "prisma",
);

execSync(`"${prismaBin}" generate --schema prisma/schema.prisma`, {
  cwd: projectRoot,
  stdio: "inherit",
});
