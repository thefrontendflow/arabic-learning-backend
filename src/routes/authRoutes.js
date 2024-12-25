import {
  changePassword,
  checkAuthentication,
  disable2FA,
  enable2FA,
  forgetPassword,
  loginUser,
  registerUser,
  resendVerificationEmail,
  resetPassword,
  verify2FA,
  verifyEmail,
  verifyLogin2FA,
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
router.post("/enable-2fa", authMiddleware, enable2FA);
router.post("/verify-2fa", authMiddleware, verify2FA);
router.post("/verify-2faLogin", verifyLogin2FA);
router.post("/disable-2fa", authMiddleware, disable2FA);

export default router;
