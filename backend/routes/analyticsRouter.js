import { Router } from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import analyticsController from "../controllers/analytics.js";

const router = Router();

router.use(authMiddleware);

router.get("/monthly", analyticsController.getMonthlyData);
router.get("/categories", analyticsController.getCategoryData);
router.get("/payment-methods", analyticsController.getPaymentMethodData);

export default router;