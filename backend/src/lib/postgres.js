import { PrismaClient } from "@prisma/client";
import { env } from "../config/env.js";

const globalForPrisma = globalThis;

const createClient = () =>
  new PrismaClient({
    log: env.nodeEnv === "development" ? ["warn", "error"] : ["error"],
  });

const prismaClient =
  globalForPrisma.gamearenaPrismaClient || createClient();

if (env.nodeEnv !== "production") {
  globalForPrisma.gamearenaPrismaClient = prismaClient;
}

export const prisma = prismaClient;

function validateDatabaseUrl() {
  const databaseUrl = String(env.databaseUrl || "").trim();

  if (!databaseUrl) {
    const error = new Error("Backend database is not configured. Set DATABASE_URL in Render.");
    error.statusCode = 503;
    throw error;
  }

  if (!/^postgres(?:ql)?:\/\//i.test(databaseUrl)) {
    const error = new Error(
      "Backend database URL is invalid. DATABASE_URL must start with postgresql:// or postgres://.",
    );
    error.statusCode = 503;
    throw error;
  }
}

function withTimeout(promise, timeoutMs, label) {
  let timeout;
  const timeoutPromise = new Promise((_, reject) => {
    timeout = setTimeout(() => {
      reject(new Error(`${label} timed out after ${timeoutMs}ms.`));
    }, timeoutMs);
  });

  return Promise.race([promise, timeoutPromise]).finally(() => {
    clearTimeout(timeout);
  });
}

export async function connectPostgres() {
  validateDatabaseUrl();
  await withTimeout(prisma.$connect(), 5000, "PostgreSQL connection");
  return prisma;
}

export async function disconnectPostgres() {
  await prisma.$disconnect();
}

export function getPostgresConnectionState() {
  return {
    provider: "postgresql",
    configured: Boolean(env.databaseUrl),
  };
}
