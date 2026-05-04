export const ORDER_STATUSES = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

const transitions = {
  pending: ["confirmed", "processing", "cancelled"],
  confirmed: ["processing", "shipped", "cancelled"],
  processing: ["shipped", "delivered", "cancelled"],
  shipped: ["delivered", "cancelled"],
  delivered: [],
  cancelled: [],
};

export const canTransitionOrderStatus = (fromStatus, toStatus) =>
  fromStatus === toStatus || Boolean(transitions[fromStatus]?.includes(toStatus));

export const generateOrderNumber = () => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `GA-${timestamp}-${random}`;
};

export const normalizeOrderItems = (items = []) => {
  const normalized = new Map();
  for (const item of items) {
    const productId = String(item.productId || item.product || "").trim();
    const quantity = Number.parseInt(item.quantity, 10);
    if (!productId || !Number.isInteger(quantity) || quantity < 1) {
      throw Object.assign(
        new Error("Each order item must include a product ID and a positive quantity."),
        { statusCode: 400 },
      );
    }
    if (quantity > 99) {
      throw Object.assign(new Error("A single line item cannot exceed 99 units."), {
        statusCode: 400,
      });
    }
    normalized.set(productId, (normalized.get(productId) || 0) + quantity);
  }
  return Array.from(normalized.entries()).map(([productId, quantity]) => ({
    productId,
    quantity,
  }));
};

export const validateShippingAddress = (shippingAddress = {}) => {
  const requiredFields = ["street", "city", "state", "zipCode", "country"];
  const sanitized = {};
  for (const field of requiredFields) {
    const value = String(shippingAddress[field] || "").trim();
    if (!value) {
      throw Object.assign(new Error("Complete shipping address is required."), {
        statusCode: 400,
      });
    }
    sanitized[field] = value;
  }
  return sanitized;
};
