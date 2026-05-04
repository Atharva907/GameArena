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

export async function connectPostgres() {
  await prisma.$connect();
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
