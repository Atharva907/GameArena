import {
  deleteImageKitFile,
  ensureImageKitConfigured,
  isImageKitConfigured,
  listImageKitAssets,
  uploadImageKitBuffer,
} from "../lib/imagekit.js";
import { createMediaRecords } from "../lib/commerceStore.js";

function normalizeImageKitAsset(asset = {}) {
  const fileId = String(asset.fileId || asset.id || asset.file_id || "").trim();
  const filePath = String(asset.filePath || asset.path || asset.file_path || "").trim();
  const url = String(
    asset.url || asset.secureUrl || asset.secure_url || asset.thumbnailUrl || "",
  ).trim();
  const thumbnailUrl = String(
    asset.thumbnailUrl || asset.thumbnail_url || asset.thumbnailURL || url,
  ).trim();

  return {
    fileId,
    filePath,
    url,
    thumbnailUrl,
    fileType: String(asset.fileType || asset.type || "").trim(),
    mimeType: String(asset.mime || asset.mimeType || asset.contentType || "").trim(),
    size: Number(asset.size || 0),
    width: asset.width ? Number(asset.width) : null,
    height: asset.height ? Number(asset.height) : null,
    name: String(asset.name || filePath || fileId || "").trim(),
  };
}

function parsePositiveInt(value, fallback) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
}

export async function listMediaAssets(req, res) {
  if (!isImageKitConfigured()) {
    res.json({
      success: true,
      configured: false,
      message:
        "ImageKit is not configured. Add the credentials to load media assets.",
      resources: [],
      next_cursor: null,
      total_count: 0,
    });
    return;
  }

  ensureImageKitConfigured();

  const limit = parsePositiveInt(req.query.limit || req.query.max_results, 30);
  const skip = parsePositiveInt(req.query.skip, 0);

  const assetsResponse = await listImageKitAssets({ skip, limit });
  const assets = Array.isArray(assetsResponse)
    ? assetsResponse
    : assetsResponse?.results ||
      assetsResponse?.assets ||
      assetsResponse?.files ||
      assetsResponse?.data ||
      [];
  const imageAssets = assets.filter((asset) => {
    const fileType = String(asset.fileType || asset.type || "").trim().toLowerCase();
    return fileType === "image";
  });

  res.json({
    success: true,
    configured: true,
    resources: imageAssets.map(normalizeImageKitAsset),
    next_cursor: null,
    total_count: imageAssets.length,
  });
}

export async function uploadMediaAsset(req, res) {
  if (!isImageKitConfigured()) {
    res.status(503).json({
      success: false,
      configured: false,
      message:
        "ImageKit is not configured. Add the credentials before uploading media.",
    });
    return;
  }

  ensureImageKitConfigured();

  if (!req.file) {
    res.status(400).json({ success: false, message: "No file provided" });
    return;
  }

  const result = await uploadImageKitBuffer(req.file.buffer, req.file.originalname, {
    tags: ["gamearena", "media-library"],
  });

  res.json({
    success: true,
    message: "Upload successful",
    data: normalizeImageKitAsset(result),
  });
}

export async function deleteMediaAsset(req, res) {
  if (!isImageKitConfigured()) {
    res.status(503).json({
      success: false,
      configured: false,
      message:
        "ImageKit is not configured. Add the credentials before deleting media.",
    });
    return;
  }

  ensureImageKitConfigured();

  const fileId = req.body?.fileId || req.body?.file_id;

  if (!fileId) {
    res.status(400).json({ success: false, message: "File ID is required" });
    return;
  }

  await deleteImageKitFile(fileId);

  res.json({
    success: true,
    message: "Image deleted successfully",
  });
}

export async function createMedia(req, res) {
  const payload = req.body;

  if (!Array.isArray(payload) || payload.length === 0) {
    res
      .status(400)
      .json({ success: false, message: "No media payload provided." });
    return;
  }

  try {
    const newMedia = await createMediaRecords(payload);

    res.json({
      success: true,
      statusCode: 200,
      message: "Media uploaded successfully.",
      data: newMedia,
    });
  } catch (error) {
    const fileIds = payload
      .map((data) => data.fileId || data.file_id || data.assetId || data.publicId)
      .filter(Boolean);

    if (fileIds.length > 0 && isImageKitConfigured()) {
      try {
        ensureImageKitConfigured();
        await Promise.all(fileIds.map((fileId) => deleteImageKitFile(fileId)));
      } catch (cleanupError) {
        error.imagekit = cleanupError;
      }
    }

    throw error;
  }
}
