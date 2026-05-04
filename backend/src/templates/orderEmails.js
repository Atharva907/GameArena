const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

const escapeHtml = (value = "") =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

export const orderConfirmationEmail = (order) => {
  const rows = (order.items || [])
    .map((item) => {
      const productName = item.product?.name || item.nameSnapshot || "Product";
      const lineTotal = Number(item.price || 0) * Number(item.quantity || 0);
      return `<tr><td>${escapeHtml(productName)}</td><td>${item.quantity}</td><td>${currencyFormatter.format(lineTotal)}</td></tr>`;
    })
    .join("");

  return `<h1>Order Confirmed</h1><p>Order number: <strong>${escapeHtml(order.orderNumber || order._id)}</strong></p><table>${rows}</table><p>Total paid: <strong>${currencyFormatter.format(order.totalAmount || 0)}</strong></p>`;
};

export const orderStatusEmail = (order) =>
  `<h1>Order Status Updated</h1><p>Order <strong>${escapeHtml(order.orderNumber || order._id)}</strong> is now <strong>${escapeHtml(order.status)}</strong>.</p>`;
