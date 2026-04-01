import { Router } from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import settingsController from "../controllers/settings.js";

const router = Router();

router.use(authMiddleware);

router.get("/", settingsController.handleSettings);
router.patch("/", settingsController.handleUserUpdate);
router.patch("/password", settingsController.handlePasswordChange);
router.delete("/delete", settingsController.handleAccountDeletion);

export default router;