import path from "node:path";
import ImageKit, { toFile } from "@imagekit/nodejs";
import { env } from "../config/env.js";

let imageKitClient;
const placeholderPatterns = [
  /^replace-with-/i,
  /^your-/i,
  /<username>/i,
  /<password>/i,
  /<cluster>/i,
  /example\.com/i,
];

function isPlaceholder(value) {
  const normalized = String(value || "").trim();
  return placeholderPatterns.some((pattern) => pattern.test(normalized));
}

function hasRequiredConfig() {
  return Boolean(env.imagekit.privateKey && !isPlaceholder(env.imagekit.privateKey));
}

export function ensureImageKitConfigured() {
  if (!hasRequiredConfig()) {
    const error = new Error("Missing ImageKit credentials");
    error.statusCode = 503;
    throw error;
  }

  return getImageKitClient();
}

export function isImageKitConfigured() {
  return hasRequiredConfig();
}

function getImageKitClient() {
  if (imageKitClient) {
    return imageKitClient;
  }

  imageKitClient = new ImageKit({
    publicKey: env.imagekit.publicKey || undefined,
    privateKey: env.imagekit.privateKey,
    urlEndpoint: env.imagekit.urlEndpoint || undefined,
  });

  return imageKitClient;
}

function normalizeFileName(fileName = "media-upload") {
  const cleaned = String(fileName || "media-upload").trim();
  const baseName = path.basename(cleaned);

  if (!baseName) {
    return "media-upload";
  }

  return baseName.replace(/\0/g, "");
}

export async function uploadImageKitBuffer(buffer, fileName, options = {}) {
  const client = ensureImageKitConfigured();
  const safeName = normalizeFileName(fileName);
  const file = await toFile(buffer, safeName);

  return client.files.upload({
    file,
    fileName: safeName,
    useUniqueFileName: true,
    tags: ["gamearena", "media-library"],
    ...options,
  });
}

export async function listImageKitAssets({ skip = 0, limit = 30 } = {}) {
  const client = ensureImageKitConfigured();

  return client.assets.list({
    skip: Number(skip) || 0,
    limit: Number(limit) || 30,
  });
}

export async function deleteImageKitFile(fileId) {
  const client = ensureImageKitConfigured();
  return client.files.delete(fileId);
}
