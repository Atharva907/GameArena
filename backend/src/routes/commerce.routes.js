import { Router } from "express";
import {
  createCategory,
  createOrder,
  createProduct,
  deleteAdminOrder,
  deleteCategory,
  deleteProduct,
  getAdminOrder,
  getCategory,
  getProduct,
  listAdminOrders,
  listCategories,
  listOrders,
  listProducts,
  updateAdminOrder,
  updateCategory,
  updateProduct,
  validateCart,
} from "../controllers/commerce.controller.js";
import { requireRole, requireSelfOrAdmin } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.get("/products", asyncHandler(listProducts));
router.post("/products", requireRole("admin"), asyncHandler(createProduct));
router.get("/products/:id", asyncHandler(getProduct));
router.put("/products/:id", requireRole("admin"), asyncHandler(updateProduct));
router.delete("/products/:id", requireRole("admin"), asyncHandler(deleteProduct));

router.get("/categories", asyncHandler(listCategories));
router.post("/categories", requireRole("admin"), asyncHandler(createCategory));
router.get("/categories/:id", asyncHandler(getCategory));
router.put("/categories/:id", requireRole("admin"), asyncHandler(updateCategory));
router.delete("/categories/:id", requireRole("admin"), asyncHandler(deleteCategory));

router.post("/cart/validate", asyncHandler(validateCart));

router.get("/orders", requireSelfOrAdmin("playerEmail"), asyncHandler(listOrders));
router.post("/orders", requireSelfOrAdmin("playerEmail"), asyncHandler(createOrder));

router.get("/admin/orders", requireRole("admin"), asyncHandler(listAdminOrders));
router.get("/admin/orders/:id", requireRole("admin"), asyncHandler(getAdminOrder));
router.patch("/admin/orders/:id", requireRole("admin"), asyncHandler(updateAdminOrder));
router.delete("/admin/orders/:id", requireRole("admin"), asyncHandler(deleteAdminOrder));

export default router;
