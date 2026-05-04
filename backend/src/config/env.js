import dotenv from "dotenv";

dotenv.config({ path: process.env.ENV_FILE || "../.env.local" });
dotenv.config({ path: ".env.local", override: true });
dotenv.config();

const parseOrigins = (value) =>
  String(value || "http://localhost:3000")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

const databaseProvider = String(process.env.DATABASE_PROVIDER || "postgresql")
  .trim()
  .toLowerCase();
const usePostgresDatabase =
  databaseProvider === "postgres" || databaseProvider === "postgresql";

export const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.BACKEND_PORT || process.env.PORT || 4000),
  frontendOrigins: parseOrigins(process.env.FRONTEND_ORIGIN),
  secretKey: process.env.SECRET_KEY,
  databaseProvider,
  usePostgresDatabase,
  databaseUrl: process.env.DATABASE_URL,
  mail: {
    host: process.env.NODEMAILER_HOST,
    port: Number(process.env.NODEMAILER_PORT || 587),
    secure: String(process.env.NODEMAILER_SECURE).toLowerCase() === "true",
    service: process.env.NODEMAILER_SERVICE,
    email: process.env.NODEMAILER_EMAIL,
    password: process.env.NODEMAILER_PASSWORD,
  },
  imagekit: {
    publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
    urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT,
  },
};

export const isProduction = env.nodeEnv === "production";
