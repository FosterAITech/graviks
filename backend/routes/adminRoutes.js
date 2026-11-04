import express from "express";
import { getDashboardSummary } from "../controllers/adminController.js";

import { adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/dashboard", adminOnly, getDashboardSummary);

export default router;
