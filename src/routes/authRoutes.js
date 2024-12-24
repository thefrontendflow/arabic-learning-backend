import {
  changePassword,
  checkAuthentication,
  forgetPassword,
  loginUser,
  registerUser,
  resendVerificationEmail,
  resetPassword,
  verifyEmail,
} from "../controllers/authController.js";

import { authMiddleware } from "../middleware/authMiddleware.js";
import express from "express";

const router = express.Router();

router.post("/register", registerUser);
router.get("/verify-email", verifyEmail);
router.post("/login", loginUser);
router.post("/resend-email-verification-link", resendVerificationEmail);
router.post("/forget-password", forgetPassword);
router.post("/reset-password/:token", resetPassword);
router.post("/change-password", authMiddleware, changePassword);
router.get("/check-auth", authMiddleware, checkAuthentication);

export default router;
