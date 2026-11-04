import express from "express";
import {
  createTestimonial,
  deleteTestimonial,
  getTestimonials,
  updateTestimonial
} from "../controllers/testimonialController.js";

import { adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", getTestimonials);
router.post("/", adminOnly, createTestimonial);
router.put("/:id", adminOnly, updateTestimonial);
router.delete("/:id", adminOnly, deleteTestimonial);

export default router;
