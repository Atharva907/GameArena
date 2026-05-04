import {
  createCategoryRecord,
  createOrderRecord,
  createProductRecord,
  deleteAdminOrderRecord,
  deleteCategoryRecord,
  deleteProductRecord,
  getAdminOrderRecord,
  getCategoryRecord,
  getProductRecord,
  listAdminOrderRecords,
  listCategoryRecords,
  listOrderRecordsByPlayerEmail,
  listProductRecords,
  updateAdminOrderRecord,
  updateCategoryRecord,
  updateProductRecord,
  validateCartItems,
} from "../lib/commerceStore.js";
import { sendOrderConfirmation, sendOrderStatusNotification } from "../lib/notifications.js";

export async function listProducts(req, res) {
  const result = await listProductRecords({
    featured: req.query.featured || null,
    category: req.query.category || null,
    limit: req.query.limit || 20,
    page: req.query.page || 1,
  });

  res.json(result);
}

export async function createProduct(req, res) {
  const product = await createProductRecord(req.body);
  res.status(201).json(product);
}

export async function getProduct(req, res) {
  const product = await getProductRecord(req.params.id);
  if (!product) return res.status(404).json({ success: false, error: "Product not found" });
  res.json({ success: true, product });
}

export async function updateProduct(req, res) {
  const product = await updateProductRecord(req.params.id, req.body);
  if (!product) return res.status(404).json({ success: false, error: "Product not found" });
  res.json({ success: true, product });
}

export async function deleteProduct(req, res) {
  const deleted = await deleteProductRecord(req.params.id);
  if (!deleted) return res.status(404).json({ success: false, error: "Product not found" });
  res.json({ success: true, message: "Product deleted successfully" });
}

export async function listCategories(req, res) {
  const categories = await listCategoryRecords({ includeProductCount: true });
  res.json({ success: true, categories });
}

export async function createCategory(req, res) {
  const category = await createCategoryRecord(req.body);
  res.status(201).json({
    success: true,
    message: "Category created successfully",
    category,
  });
}

export async function getCategory(req, res) {
  const category = await getCategoryRecord(req.params.id);
  if (!category) return res.status(404).json({ success: false, message: "Category not found" });
  res.json({ success: true, category });
}

export async function updateCategory(req, res) {
  const category = await updateCategoryRecord(req.params.id, req.body);
  if (!category) return res.status(404).json({ success: false, message: "Category not found" });
  res.json({ success: true, message: "Category updated successfully", category });
}

export async function deleteCategory(req, res) {
  const deleted = await deleteCategoryRecord(req.params.id);
  if (!deleted) return res.status(404).json({ success: false, message: "Category not found" });
  res.json({ success: true, message: "Category deleted successfully" });
}

export async function validateCart(req, res) {
  const validation = await validateCartItems(req.body.items);
  res.json(validation);
}

export async function listOrders(req, res) {
  const playerEmail = req.query.playerEmail;
  if (!playerEmail) {
    return res.status(400).json({ error: "playerEmail is required" });
  }
  const result = await listOrderRecordsByPlayerEmail(playerEmail, {
    limit: req.query.limit || 20,
    page: req.query.page || 1,
  });
  res.json(result);
}

export async function createOrder(req, res) {
  const order = await createOrderRecord({
    playerEmail: req.body.playerEmail,
    items: req.body.items,
    shippingAddress: req.body.shippingAddress,
    idempotencyKey: req.body.idempotencyKey,
  });

  sendOrderConfirmation(order).catch((error) =>
    console.warn("Order confirmation email failed:", error),
  );

  res.status(201).json(order);
}

export async function listAdminOrders(req, res) {
  const result = await listAdminOrderRecords({
    status: req.query.status || null,
    limit: req.query.limit || 20,
    page: req.query.page || 1,
  });
  res.json(result);
}

export async function getAdminOrder(req, res) {
  const order = await getAdminOrderRecord(req.params.id);
  if (!order) return res.status(404).json({ error: "Order not found" });
  res.json(order);
}

export async function updateAdminOrder(req, res) {
  const { status, note = "" } = req.body;
  const order = await updateAdminOrderRecord(req.params.id, {
    status,
    note,
    changedBy: req.user?.email || "admin",
  });

  if (!order) return res.status(404).json({ error: "Order not found" });

  sendOrderStatusNotification(order).catch((error) =>
    console.warn("Order status email failed:", error),
  );

  res.json(order);
}

export async function deleteAdminOrder(req, res) {
  const deleted = await deleteAdminOrderRecord(req.params.id);
  if (!deleted) return res.status(404).json({ error: "Order not found" });
  res.json({ message: "Order deleted successfully" });
}
