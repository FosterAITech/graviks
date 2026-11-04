import express from "express";
import {
  createProduct,
  deleteProduct,
  getProductBySlug,
  getProductById,
  getProducts,
  updateProduct
} from "../controllers/productController.js";

import { adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/").get(getProducts).post(adminOnly, createProduct);
router.route("/:id").put(adminOnly, updateProduct).delete(adminOnly, deleteProduct);
router.get("/slug/:slug", getProductBySlug);
router.get("/:id", getProductById);

export default router;
