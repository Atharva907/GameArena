import crypto from "node:crypto";
import { connectPostgres, prisma } from "./postgres.js";
import { findPlayerByEmail } from "./playerStore.js";
import {
  canTransitionOrderStatus,
  generateOrderNumber,
  normalizeOrderItems,
  validateShippingAddress,
} from "./orderUtils.js";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const ORDER_PLAYER_SELECT = {
  id: true,
  fullName: true,
  email: true,
};

const ORDER_PRODUCT_SELECT = {
  id: true,
  name: true,
  description: true,
  price: true,
  image: true,
  inStock: true,
  isFeatured: true,
  categoryId: true,
};

const ORDER_STATUS_HISTORY_SELECT = {
  status: true,
  changedAt: true,
  changedBy: true,
  note: true,
};

const ORDER_DETAIL_INCLUDE = {
  player: {
    select: ORDER_PLAYER_SELECT,
  },
  items: {
    include: {
      product: {
        select: ORDER_PRODUCT_SELECT,
      },
    },
  },
  statusHistory: {
    orderBy: { changedAt: "asc" },
    select: ORDER_STATUS_HISTORY_SELECT,
  },
};

const ORDER_SUMMARY_INCLUDE = {
  player: {
    select: ORDER_PLAYER_SELECT,
  },
  items: {
    include: {
      product: {
        select: ORDER_PRODUCT_SELECT,
      },
    },
  },
};

function buildError(message, statusCode = 400) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function asPlainRecord(record) {
  if (!record) return null;

  if (typeof record.toObject === "function") {
    return record.toObject({ versionKey: false });
  }

  return { ...record };
}

function normalizeRecordId(record) {
  return String(record?.id || record?._id || "");
}

function normalizeDate(value, fallback = null) {
  if (!value) return fallback;
  return value instanceof Date ? value : new Date(value);
}

function normalizeAmount(value) {
  const numeric = Number(value || 0);
  return Math.round(numeric);
}

function normalizeOrderStatus(value) {
  return String(value || "pending").trim().toLowerCase();
}

function normalizePaymentMethod(value) {
  return String(value || "wallet").trim().toLowerCase();
}

function normalizePaymentStatus(value) {
  return String(value || "pending").trim().toLowerCase();
}

function normalizeRefundStatus(value) {
  return String(value || "none").trim().toLowerCase();
}

function normalizeCategoryReference(value) {
  if (!value) return null;

  const plain = asPlainRecord(value);
  const id = normalizeRecordId(plain) || String(value);
  if (!id) return null;

  return {
    ...plain,
    id,
    _id: plain?._id ? String(plain._id) : id,
  };
}

function normalizePlayerSummary(record) {
  if (!record) return null;

  const plain = asPlainRecord(record);
  const id = normalizeRecordId(plain) || String(record);
  if (!id) return null;

  return {
    ...plain,
    id,
    _id: plain?._id ? String(plain._id) : id,
    fullName: plain.fullName || plain.name || "",
    name: plain.name || plain.fullName || "",
    email: String(plain.email || "").toLowerCase(),
  };
}

function normalizeCategoryRecord(record) {
  if (!record) return null;

  const plain = asPlainRecord(record);
  const id = normalizeRecordId(plain);

  return {
    ...plain,
    id,
    _id: plain._id ? String(plain._id) : id,
    name: plain.name || "",
    description: plain.description || "",
    isFeatured: Boolean(plain.isFeatured),
    createdAt: normalizeDate(plain.createdAt, new Date()),
    updatedAt: normalizeDate(plain.updatedAt, new Date()),
    productCount:
      typeof plain.productCount === "number"
        ? plain.productCount
        : typeof plain._count?.products === "number"
          ? plain._count.products
          : plain.productCount === undefined
            ? undefined
            : Number(plain.productCount || 0),
  };
}

function normalizeProductRecord(record) {
  if (!record) return null;

  const plain = asPlainRecord(record);
  const id = normalizeRecordId(plain) || String(record);
  const categorySource = plain.category || plain.categoryId || null;

  return {
    ...plain,
    id,
    _id: plain._id ? String(plain._id) : id,
    name: plain.name || "",
    description: plain.description || "",
    price: Number(plain.price || 0),
    categoryId: String(
      plain.categoryId || categorySource?.id || categorySource?._id || categorySource || "",
    ),
    category: normalizeCategoryReference(categorySource),
    image: plain.image || "",
    inStock: Number(plain.inStock || 0),
    isFeatured: Boolean(plain.isFeatured),
    createdAt: normalizeDate(plain.createdAt, new Date()),
    updatedAt: normalizeDate(plain.updatedAt, new Date()),
  };
}

function normalizeOrderItemRecord(record) {
  if (!record) return null;

  const plain = asPlainRecord(record);
  const productSource = plain.product || plain.productId || null;
  const productId = String(
    plain.productId || productSource?.id || productSource?._id || productSource || "",
  );

  return {
    ...plain,
    productId,
    product: normalizeProductRecord(productSource),
    quantity: Number(plain.quantity || 0),
    price: Number(plain.price || 0),
    nameSnapshot: plain.nameSnapshot || "",
    imageSnapshot: plain.imageSnapshot || "",
  };
}

function normalizeOrderStatusHistoryRecord(record) {
  if (!record) return null;

  const plain = asPlainRecord(record);
  return {
    ...plain,
    status: normalizeOrderStatus(plain.status),
    changedAt: normalizeDate(plain.changedAt, new Date()),
    changedBy: plain.changedBy || "system",
    note: plain.note || "",
  };
}

function normalizeOrderRecord(record) {
  if (!record) return null;

  const plain = asPlainRecord(record);
  const id = normalizeRecordId(plain);

  return {
    ...plain,
    id,
    _id: plain._id ? String(plain._id) : id,
    orderNumber: plain.orderNumber || "",
    idempotencyKey: plain.idempotencyKey || "",
    playerId: String(plain.playerId || plain.player?.id || plain.player?._id || ""),
    player: normalizePlayerSummary(plain.player),
    items: Array.isArray(plain.items)
      ? plain.items.map(normalizeOrderItemRecord).filter(Boolean)
      : [],
    totalAmount: Number(plain.totalAmount || 0),
    status: normalizeOrderStatus(plain.status),
    paymentMethod: normalizePaymentMethod(plain.paymentMethod),
    paymentStatus: normalizePaymentStatus(plain.paymentStatus),
    refundStatus: normalizeRefundStatus(plain.refundStatus),
    refundedAmount: Number(plain.refundedAmount || 0),
    shippingAddress: plain.shippingAddress || null,
    cancelledAt: normalizeDate(plain.cancelledAt, null),
    deliveredAt: normalizeDate(plain.deliveredAt, null),
    createdAt: normalizeDate(plain.createdAt, new Date()),
    updatedAt: normalizeDate(plain.updatedAt, new Date()),
    statusHistory: Array.isArray(plain.statusHistory)
      ? plain.statusHistory.map(normalizeOrderStatusHistoryRecord).filter(Boolean)
      : [],
  };
}

function normalizeMediaRecord(record) {
  if (!record) return null;

  const plain = asPlainRecord(record);
  const id = normalizeRecordId(plain);

  return {
    ...plain,
    id,
    _id: plain._id ? String(plain._id) : id,
    fileId: String(plain.fileId || plain.assetId || "").trim(),
    filePath: String(plain.filePath || plain.publicId || "").trim(),
    url: String(plain.url || plain.path || "").trim(),
    thumbnailUrl: plain.thumbnailUrl || plain.url || "",
    alt: plain.alt || "",
    title: plain.title || "",
    deletedAt: normalizeDate(plain.deletedAt, null),
    createdAt: normalizeDate(plain.createdAt, new Date()),
    updatedAt: normalizeDate(plain.updatedAt, new Date()),
  };
}

function normalizeCategoryInput(data = {}, { partial = false } = {}) {
  const payload = {};
  if (typeof data.name !== "undefined") payload.name = String(data.name || "").trim();
  if (typeof data.description !== "undefined") payload.description = String(data.description || "").trim();
  if (typeof data.isFeatured !== "undefined") payload.isFeatured = Boolean(data.isFeatured);

  if (!partial) {
    payload.description = payload.description || "";
    payload.isFeatured = Boolean(payload.isFeatured);
  }

  return payload;
}

function normalizeProductInput(data = {}, { partial = false } = {}) {
  const payload = {};
  if (typeof data.name !== "undefined") payload.name = String(data.name || "").trim();
  if (typeof data.description !== "undefined") payload.description = String(data.description || "").trim();
  if (typeof data.price !== "undefined") payload.price = Number(data.price || 0);
  if (typeof data.categoryId !== "undefined") payload.categoryId = String(data.categoryId || "").trim();
  if (typeof data.image !== "undefined") payload.image = String(data.image || "").trim();
  if (typeof data.inStock !== "undefined") payload.inStock = Number(data.inStock || 0);
  if (typeof data.isFeatured !== "undefined") payload.isFeatured = Boolean(data.isFeatured);

  if (!partial) {
    payload.isFeatured = Boolean(payload.isFeatured);
  }

  return payload;
}

function normalizeMediaInput(data = {}) {
  const source = asPlainRecord(data) || {};
  const fileId = String(
    source.fileId || source.file_id || source.assetId || source.asset_id || "",
  ).trim();
  const filePath = String(
    source.filePath || source.file_path || source.publicId || source.public_id || "",
  ).trim();
  const url = String(source.url || source.secure_url || source.path || "");
  const thumbnailUrl = String(source.thumbnailUrl || source.thumbnail_url || url);

  return {
    fileId,
    filePath,
    url,
    thumbnailUrl,
    alt: String(source.alt || "").trim(),
    title: String(source.title || "").trim(),
  };
}

function isValidDatabaseId(id) {
  const value = String(id || "").trim();
  return Boolean(value) && UUID_REGEX.test(value);
}

function filterValidIds(ids = []) {
  return [...new Set(ids.map((id) => String(id || "").trim()).filter(isValidDatabaseId))];
}

async function getPostgresCategoryCount(categoryId) {
  await connectPostgres();
  return prisma.product.count({ where: { categoryId: String(categoryId) } });
}

async function fetchProductsByIds(ids = []) {
  const uniqueIds = filterValidIds(ids);
  if (!uniqueIds.length) return [];

  await connectPostgres();
  const products = await prisma.product.findMany({
    where: { id: { in: uniqueIds } },
    include: {
      category: true,
    },
  });
  return products.map(normalizeProductRecord);
}

export async function countProductRecords({ featured = null, category = null } = {}) {
  if (category && !isValidDatabaseId(category)) return 0;

  const where = {};
  if (featured === true || featured === "true") where.isFeatured = true;
  if (category) where.categoryId = String(category);

  await connectPostgres();
  return prisma.product.count({ where });
}

export async function listProductRecords({ featured = null, category = null, limit = 20, page = 1 } = {}) {
  const safeLimit = Math.min(Math.max(Number.parseInt(limit, 10) || 20, 1), 100);
  const safePage = Math.max(Number.parseInt(page, 10) || 1, 1);
  const skip = (safePage - 1) * safeLimit;

  if (category && !isValidDatabaseId(category)) {
    return {
      products: [],
      pagination: { total: 0, page: safePage, pages: 0 },
    };
  }

  const where = {};
  if (featured === true || featured === "true") where.isFeatured = true;
  if (category) where.categoryId = String(category);

  await connectPostgres();
  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { category: true },
      orderBy: { createdAt: "desc" },
      skip,
      take: safeLimit,
    }),
    prisma.product.count({ where }),
  ]);

  return {
    products: products.map(normalizeProductRecord),
    pagination: {
      total,
      page: safePage,
      pages: Math.ceil(total / safeLimit),
    },
  };
}

export async function listProductRecordsByIds(ids = []) {
  return fetchProductsByIds(ids);
}

export async function getProductRecord(id) {
  const normalizedId = String(id || "").trim();
  if (!normalizedId) return null;

  await connectPostgres();
  const product = await prisma.product.findUnique({
    where: { id: normalizedId },
    include: { category: true },
  });
  return normalizeProductRecord(product);
}

export async function createProductRecord(data = {}) {
  const payload = normalizeProductInput(data);
  const categoryId = String(payload.categoryId || "").trim();

  if (!payload.name || !payload.description || !payload.image || !categoryId) {
    throw buildError("Missing required fields: name, description, category, image, price, inStock", 400);
  }

  if (payload.price < 0 || payload.inStock < 0) {
    throw buildError("Product price and stock cannot be negative.", 400);
  }

  await connectPostgres();
  const category = await prisma.category.findUnique({
    where: { id: categoryId },
    select: { id: true },
  });
  if (!category) {
    throw buildError("Selected category does not exist", 400);
  }

  const created = await prisma.product.create({
    data: {
      name: payload.name,
      description: payload.description,
      price: payload.price,
      categoryId,
      image: payload.image,
      inStock: payload.inStock,
      isFeatured: Boolean(payload.isFeatured),
    },
    include: { category: true },
  });
  return normalizeProductRecord(created);
}

export async function updateProductRecord(id, data = {}) {
  const normalizedId = String(id || "").trim();
  const payload = normalizeProductInput(data, { partial: true });
  if (!normalizedId) return null;

  await connectPostgres();
  const existing = await prisma.product.findUnique({
    where: { id: normalizedId },
    select: { id: true },
  });
  if (!existing) return null;

  if (payload.categoryId) {
    const category = await prisma.category.findUnique({
      where: { id: payload.categoryId },
      select: { id: true },
    });
    if (!category) {
      throw buildError("Selected category does not exist", 400);
    }
  }

  const updated = await prisma.product.update({
    where: { id: normalizedId },
    data: {
      ...(payload.name !== undefined ? { name: payload.name } : {}),
      ...(payload.description !== undefined ? { description: payload.description } : {}),
      ...(payload.price !== undefined ? { price: payload.price } : {}),
      ...(payload.categoryId !== undefined ? { categoryId: payload.categoryId } : {}),
      ...(payload.image !== undefined ? { image: payload.image } : {}),
      ...(payload.inStock !== undefined ? { inStock: payload.inStock } : {}),
      ...(payload.isFeatured !== undefined ? { isFeatured: payload.isFeatured } : {}),
    },
    include: { category: true },
  });
  return normalizeProductRecord(updated);
}

export async function deleteProductRecord(id) {
  const normalizedId = String(id || "").trim();
  if (!normalizedId) return false;

  await connectPostgres();
  const existing = await prisma.product.findUnique({
    where: { id: normalizedId },
    select: { id: true },
  });
  if (!existing) return false;

  try {
    await prisma.product.delete({ where: { id: normalizedId } });
    return true;
  } catch (error) {
    if (error?.code === "P2003") {
      throw buildError("Cannot delete product because it is used by an order.", 400);
    }
    throw error;
  }
}

export async function listCategoryRecords({ includeProductCount = false } = {}) {
  await connectPostgres();
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    include: includeProductCount ? { _count: { select: { products: true } } } : undefined,
  });
  return categories.map((category) => {
    const record = normalizeCategoryRecord(category);
    if (includeProductCount) {
      record.productCount = typeof category._count?.products === "number" ? category._count.products : 0;
    }
    return record;
  });
}

export async function countCategoryRecords() {
  await connectPostgres();
  return prisma.category.count();
}

export async function getCategoryRecord(id) {
  const normalizedId = String(id || "").trim();
  if (!normalizedId) return null;

  await connectPostgres();
  const category = await prisma.category.findUnique({ where: { id: normalizedId } });
  return normalizeCategoryRecord(category);
}

export async function createCategoryRecord(data = {}) {
  const payload = normalizeCategoryInput(data);
  if (!payload.name) {
    throw buildError("Category name is required", 400);
  }

  await connectPostgres();
  const existing = await prisma.category.findFirst({ where: { name: payload.name } });
  if (existing) {
    throw buildError("A category with this name already exists", 400);
  }

  const category = await prisma.category.create({
    data: {
      name: payload.name,
      description: payload.description || "",
      isFeatured: Boolean(payload.isFeatured),
    },
  });
  return normalizeCategoryRecord(category);
}

export async function updateCategoryRecord(id, data = {}) {
  const normalizedId = String(id || "").trim();
  const payload = normalizeCategoryInput(data, { partial: true });
  if (!normalizedId) return null;
  if (!payload.name) {
    throw buildError("Category name is required", 400);
  }

  await connectPostgres();
  const category = await prisma.category.findUnique({ where: { id: normalizedId } });
  if (!category) return null;

  const existing = await prisma.category.findFirst({
    where: {
      name: payload.name,
      id: { not: normalizedId },
    },
  });
  if (existing) {
    throw buildError("A category with this name already exists", 400);
  }

  const updated = await prisma.category.update({
    where: { id: normalizedId },
    data: {
      name: payload.name,
      description: payload.description || "",
      isFeatured: Boolean(payload.isFeatured),
    },
  });
  return normalizeCategoryRecord(updated);
}

export async function deleteCategoryRecord(id) {
  const normalizedId = String(id || "").trim();
  if (!normalizedId) return false;

  const productCount = await getPostgresCategoryCount(normalizedId);
  if (productCount > 0) {
    throw buildError(
      `Cannot delete category with ${productCount} products. Please move or delete the products first.`,
      400,
    );
  }

  await connectPostgres();
  const existing = await prisma.category.findUnique({
    where: { id: normalizedId },
    select: { id: true },
  });
  if (!existing) return false;

  await prisma.category.delete({ where: { id: normalizedId } });
  return true;
}

export async function validateCartItems(items = []) {
  const normalizedItems = normalizeOrderItems(items);
  const productIds = normalizedItems.map((item) => item.productId);
  const products = await fetchProductsByIds(productIds);
  const productMap = new Map(products.map((product) => [String(product.id || product._id), product]));

  const validatedItems = normalizedItems.map((item) => {
    const product = productMap.get(item.productId);

    if (!product) {
      return {
        productId: item.productId,
        quantity: item.quantity,
        valid: false,
        reason: "Product no longer exists.",
      };
    }

    const price = normalizeAmount(product.price);
    const availableQuantity = Number(product.inStock || 0);
    const valid = availableQuantity >= item.quantity;

    return {
      productId: product.id || product._id,
      name: product.name,
      image: product.image,
      price,
      requestedQuantity: item.quantity,
      availableQuantity,
      valid,
      reason: valid ? "" : `Only ${availableQuantity} unit(s) available.`,
    };
  });

  const subtotal = validatedItems.reduce(
    (sum, item) => (item.valid ? sum + item.price * item.requestedQuantity : sum),
    0,
  );

  return {
    valid: validatedItems.every((item) => item.valid),
    items: validatedItems,
    subtotal,
  };
}

export async function countOrderRecords({ status = null } = {}) {
  const where = status ? { status: normalizeOrderStatus(status).toUpperCase() } : {};
  await connectPostgres();
  return prisma.order.count({ where });
}

export async function sumOrderRevenue() {
  await connectPostgres();
  const result = await prisma.order.aggregate({
    _sum: { totalAmount: true },
  });
  return Number(result._sum.totalAmount || 0);
}

export async function listLowStockProductRecords(limit = 5) {
  const safeLimit = Math.min(Math.max(Number.parseInt(limit, 10) || 5, 1), 20);

  await connectPostgres();
  const products = await prisma.product.findMany({
    where: { inStock: { lte: 5 } },
    orderBy: [
      { inStock: "asc" },
      { createdAt: "desc" },
    ],
    take: safeLimit,
    include: { category: true },
  });
  return products.map(normalizeProductRecord);
}

export async function listRecentOrderRecords(limit = 5) {
  const safeLimit = Math.min(Math.max(Number.parseInt(limit, 10) || 5, 1), 20);

  await connectPostgres();
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    take: safeLimit,
    include: ORDER_SUMMARY_INCLUDE,
  });
  return orders.map(normalizeOrderRecord);
}

export async function listOrderRecordsByPlayerEmail(playerEmail, { limit = 20, page = 1 } = {}) {
  const normalizedEmail = String(playerEmail || "").trim().toLowerCase();
  if (!normalizedEmail) {
    return {
      orders: [],
      pagination: { total: 0, page: 1, pages: 0 },
    };
  }

  const safeLimit = Math.min(Math.max(Number.parseInt(limit, 10) || 20, 1), 50);
  const safePage = Math.max(Number.parseInt(page, 10) || 1, 1);
  const skip = (safePage - 1) * safeLimit;

  const player = await findPlayerByEmail(normalizedEmail, { includeTransactions: false });
  if (!player) {
    return {
      orders: [],
      pagination: { total: 0, page: safePage, pages: 0 },
    };
  }

  await connectPostgres();
  const where = { playerId: player.id };
  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: safeLimit,
      include: ORDER_DETAIL_INCLUDE,
    }),
    prisma.order.count({ where }),
  ]);

  return {
    orders: orders.map(normalizeOrderRecord),
    pagination: {
      total,
      page: safePage,
      pages: Math.ceil(total / safeLimit),
    },
  };
}

async function findExistingOrderByIdempotencyKey(idempotencyKey) {
  if (!idempotencyKey) return null;

  await connectPostgres();
  return prisma.order.findUnique({
    where: { idempotencyKey },
    include: ORDER_DETAIL_INCLUDE,
  });
}

export async function createOrderRecord({
  playerEmail,
  items = [],
  shippingAddress = {},
  idempotencyKey = "",
}) {
  const normalizedEmail = String(playerEmail || "").trim().toLowerCase();
  if (!normalizedEmail) {
    throw buildError("playerEmail is required", 400);
  }

  const normalizedItems = normalizeOrderItems(items);
  if (normalizedItems.length === 0) {
    throw buildError("Missing required fields: playerEmail, items", 400);
  }

  const normalizedShippingAddress = validateShippingAddress(shippingAddress);
  const existingByKey = await findExistingOrderByIdempotencyKey(idempotencyKey);

  if (existingByKey) {
    const existingEmail = String(
      existingByKey.player?.email || existingByKey.playerEmail || "",
    ).toLowerCase();
    if (existingEmail !== normalizedEmail) {
      throw buildError("Invalid idempotency key", 409);
    }
    return normalizeOrderRecord(existingByKey);
  }

  const player = await findPlayerByEmail(normalizedEmail, { includeTransactions: false });
  if (!player) {
    throw buildError("Player not found", 404);
  }

  const productIds = normalizedItems.map((item) => item.productId);
  const products = await fetchProductsByIds(productIds);
  const productMap = new Map(products.map((product) => [String(product.id || product._id), product]));

  if (productMap.size !== productIds.length) {
    throw buildError("One or more products could not be found.", 404);
  }

  const orderItems = [];
  let totalAmount = 0;

  for (const item of normalizedItems) {
    const product = productMap.get(item.productId);
    const price = normalizeAmount(product.price);
    const availableStock = Number(product.inStock || 0);

    if (availableStock < item.quantity) {
      throw buildError(`Not enough stock for product: ${product.name}`, 400);
    }

    totalAmount += price * item.quantity;
    orderItems.push({
      productId: String(product.id || product._id),
      quantity: item.quantity,
      price,
      nameSnapshot: product.name,
      imageSnapshot: product.image,
    });
  }

  await connectPostgres();
  const result = await prisma.$transaction(async (tx) => {
    const dbPlayer = await tx.player.findUnique({
      where: { email: normalizedEmail },
      select: { id: true, email: true, fullName: true, walletBalance: true },
    });

    if (!dbPlayer) {
      throw buildError("Player not found", 404);
    }

    const walletCheck = await tx.player.updateMany({
      where: {
        id: dbPlayer.id,
        walletBalance: { gte: totalAmount },
      },
      data: {
        walletBalance: { decrement: totalAmount },
      },
    });

    if (!walletCheck.count) {
      throw buildError("Insufficient wallet balance", 400);
    }

    for (const item of normalizedItems) {
      const stockUpdate = await tx.product.updateMany({
        where: {
          id: item.productId,
          inStock: { gte: item.quantity },
        },
        data: {
          inStock: { decrement: item.quantity },
        },
      });

      if (!stockUpdate.count) {
        throw buildError(`Not enough stock for product: ${productMap.get(item.productId).name}`, 400);
      }
    }

    const order = await tx.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        ...(idempotencyKey ? { idempotencyKey } : {}),
        playerId: dbPlayer.id,
        totalAmount,
        status: "CONFIRMED",
        paymentMethod: "WALLET",
        paymentStatus: "COMPLETED",
        refundStatus: "NONE",
        shippingAddress: normalizedShippingAddress,
        items: {
          create: orderItems.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
            nameSnapshot: item.nameSnapshot,
            imageSnapshot: item.imageSnapshot,
          })),
        },
        statusHistory: {
          create: [
            {
              status: "confirmed",
              changedBy: normalizedEmail,
              note: "Order placed through wallet checkout",
            },
          ],
        },
      },
      include: ORDER_DETAIL_INCLUDE,
    });

    await tx.playerTransaction.create({
      data: {
        transactionId: crypto.randomUUID(),
        playerId: dbPlayer.id,
        date: new Date(),
        type: "Store Purchase",
        amount: -totalAmount,
        status: "COMPLETED",
        method: "wallet",
        description: `GameArena shop order #${order.orderNumber}`,
        orderId: order.id,
      },
    });

    return order;
  });

  return normalizeOrderRecord(result);
}

export async function listAdminOrderRecords({ status = null, limit = 20, page = 1 } = {}) {
  const safeLimit = Math.min(Math.max(Number.parseInt(limit, 10) || 20, 1), 50);
  const safePage = Math.max(Number.parseInt(page, 10) || 1, 1);
  const skip = (safePage - 1) * safeLimit;
  const where = status ? { status: normalizeOrderStatus(status).toUpperCase() } : {};

  await connectPostgres();
  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: safeLimit,
      include: ORDER_SUMMARY_INCLUDE,
    }),
    prisma.order.count({ where }),
  ]);

  return {
    orders: orders.map(normalizeOrderRecord),
    pagination: {
      total,
      page: safePage,
      pages: Math.ceil(total / safeLimit),
    },
  };
}

export async function getAdminOrderRecord(id) {
  const normalizedId = String(id || "").trim();
  if (!normalizedId) return null;

  await connectPostgres();
  const order = await prisma.order.findUnique({
    where: { id: normalizedId },
    include: ORDER_DETAIL_INCLUDE,
  });
  return normalizeOrderRecord(order);
}

export async function updateAdminOrderRecord(id, { status, note = "", changedBy = "admin" } = {}) {
  const normalizedId = String(id || "").trim();
  const normalizedStatus = normalizeOrderStatus(status);

  if (!normalizedId) return null;
  if (!["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"].includes(normalizedStatus)) {
    throw buildError("Invalid order status", 400);
  }

  await connectPostgres();
  const result = await prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { id: normalizedId },
      include: ORDER_DETAIL_INCLUDE,
    });

    if (!order) {
      return null;
    }

    const currentStatus = normalizeOrderStatus(order.status);
    if (!canTransitionOrderStatus(currentStatus, normalizedStatus)) {
      throw buildError(`Cannot move order from ${currentStatus} to ${normalizedStatus}.`, 400);
    }

    if (normalizedStatus === "cancelled" && currentStatus !== "cancelled") {
      if (currentStatus === "delivered") {
        throw buildError("Delivered orders cannot be cancelled.", 400);
      }

      for (const item of order.items || []) {
        await tx.product.update({
          where: { id: item.productId },
          data: { inStock: { increment: item.quantity } },
        });
      }

      if (
        normalizePaymentStatus(order.paymentStatus) === "completed" &&
        normalizeRefundStatus(order.refundStatus) !== "refunded"
      ) {
        await tx.player.update({
          where: { id: order.playerId },
          data: { walletBalance: { increment: order.totalAmount } },
        });

        await tx.playerTransaction.create({
          data: {
            transactionId: crypto.randomUUID(),
            playerId: order.playerId,
            date: new Date(),
            type: "Store Refund",
            amount: Number(order.totalAmount || 0),
            status: "REFUNDED",
            method: "wallet",
            description: `Refund for order #${order.orderNumber || order.id}`,
            orderId: order.id,
          },
        });
      }
    }

    await tx.order.update({
      where: { id: normalizedId },
      data: {
        status: normalizedStatus.toUpperCase(),
        ...(normalizedStatus === "cancelled" ? { cancelledAt: new Date() } : {}),
        ...(normalizedStatus === "delivered" ? { deliveredAt: new Date() } : {}),
        ...(normalizedStatus === "cancelled" &&
        normalizePaymentStatus(order.paymentStatus) === "completed"
          ? {
              paymentStatus: "REFUNDED",
              refundStatus: "REFUNDED",
              refundedAmount: Number(order.totalAmount || 0),
            }
          : {}),
      },
    });

    await tx.orderStatusHistory.create({
      data: {
        orderId: order.id,
        status: normalizedStatus.toUpperCase(),
        changedBy: String(changedBy || "admin"),
        note: String(note || "").trim(),
      },
    });

    return tx.order.findUnique({
      where: { id: normalizedId },
      include: ORDER_DETAIL_INCLUDE,
    });
  });

  return normalizeOrderRecord(result);
}

export async function deleteAdminOrderRecord(id) {
  const normalizedId = String(id || "").trim();
  if (!normalizedId) return false;

  await connectPostgres();
  const order = await prisma.order.findUnique({
    where: { id: normalizedId },
    select: { id: true, status: true },
  });

  if (!order) return false;
  if (!["cancelled", "delivered"].includes(normalizeOrderStatus(order.status))) {
    throw buildError("Only cancelled or delivered orders can be deleted from admin.", 400);
  }

  await prisma.order.delete({ where: { id: normalizedId } });
  return true;
}

export async function createMediaRecords(payload = []) {
  const normalizedPayload = Array.isArray(payload)
    ? payload.map(normalizeMediaInput).filter((item) => item.fileId || item.filePath)
    : [];

  if (!normalizedPayload.length) {
    return [];
  }

  await connectPostgres();
  const created = await prisma.$transaction(async (tx) => {
    const results = [];

    for (const media of normalizedPayload) {
      const fileId = String(media.fileId || media.filePath || "").trim();
      if (!fileId) {
        continue;
      }

      const existing = await tx.media.findFirst({
        where: { fileId },
      });

      const record = existing
        ? await tx.media.update({
            where: { id: existing.id },
            data: {
              fileId,
              filePath: media.filePath || "",
              url: media.url || media.thumbnailUrl || "",
              thumbnailUrl: media.thumbnailUrl || media.url || "",
              alt: media.alt || null,
              title: media.title || null,
            },
          })
        : await tx.media.create({
            data: {
              fileId,
              filePath: media.filePath || "",
              url: media.url || media.thumbnailUrl || "",
              thumbnailUrl: media.thumbnailUrl || media.url || "",
              alt: media.alt || null,
              title: media.title || null,
            },
          });

      results.push(record);
    }

    return results;
  });
  return created.map(normalizeMediaRecord);
}
