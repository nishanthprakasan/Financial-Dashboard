import { Router } from "express";
import authControllers from "../controllers/user.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = Router();
const {
  handleUserSignup,
  handleUserLogin,
  handleUserLogout,
  completeOnboarding,
} = authControllers;

router.post("/signup", handleUserSignup);

router.post("/login", handleUserLogin);

router.post("/logout", handleUserLogout);

router.post("/complete-onboarding", authMiddleware, completeOnboarding);

export default router;
