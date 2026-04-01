import { Router } from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import aiController from "../controllers/ai.js";

const router = Router();

router.use(authMiddleware);

router.post("/chat", aiController.handleAIChat);

export default router;