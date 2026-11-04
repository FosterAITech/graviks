import express from "express";
import { createContact, getContacts, updateContactStatus, deleteContact } from "../controllers/contactController.js";

import { adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/").get(adminOnly, getContacts).post(createContact);
router.route("/:id").put(adminOnly, updateContactStatus).delete(adminOnly, deleteContact);

export default router;