import { Router } from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import settingsController from "../controllers/settings.js";

const router = Router();
const { handleUserUpdate, handleSettings } = settingsController;

router.use(authMiddleware);
router.route("/").get(handleSettings).patch(handleUserUpdate);

export default router;