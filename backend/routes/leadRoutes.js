import express from "express";
import { createLead, getLeads, updateLeadStatus, deleteLead } from "../controllers/leadController.js";

import { adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/").get(adminOnly, getLeads).post(createLead);
router.route("/:id").put(adminOnly, updateLeadStatus).delete(adminOnly, deleteLead);

export default router;


