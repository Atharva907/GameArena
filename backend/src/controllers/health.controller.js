import { env } from "../config/env.js";
import {
  connectPostgres,
  getPostgresConnectionState,
} from "../lib/postgres.js";
import { isImageKitConfigured } from "../lib/imagekit.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const healthCheck = asyncHandler(async (req, res) => {
  const startedAt = Date.now();
  const checks = {
    app: "ok",
    database: "unknown",
    mail: env.mail.email ? "configured" : "missing",
    imagekit: isImageKitConfigured() ? "configured" : "missing",
  };

  try {
    await connectPostgres();
    checks.database = "ok";
  } catch (error) {
    checks.database = "error";
    res.status(503).json({
      status: "degraded",
      checks,
      database: {
        ...getPostgresConnectionState(),
        connected: false,
      },
      responseTimeMs: Date.now() - startedAt,
      message: error.message,
    });
    return;
  }

  res.json({
    status: "ok",
    checks,
    database: {
      ...getPostgresConnectionState(),
      connected: true,
    },
    responseTimeMs: Date.now() - startedAt,
  });
});
