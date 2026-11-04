import express from "express";
import {
  createSectionItem,
  deleteSectionItem,
  getSectionItems,
  updateSectionItem
} from "../controllers/sectionItemController.js";

import { adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/").get(getSectionItems).post(adminOnly, createSectionItem);
router.route("/:id").put(adminOnly, updateSectionItem).delete(adminOnly, deleteSectionItem);

export default router;
