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
