import { Router } from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import dashboardControllers from "../controllers/dashboard.js";

const { getDashboardData } = dashboardControllers;
const router = Router();

router.get("/",authMiddleware, getDashboardData);

export default router;
