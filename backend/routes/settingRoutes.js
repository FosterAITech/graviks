import express from "express";
import { getSettings, updateSettings } from "../controllers/settingController.js";

import { adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/").get(getSettings).put(adminOnly, updateSettings);

export default router;
