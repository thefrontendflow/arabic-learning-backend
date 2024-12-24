import {
  forgetPassword,
  loginUser,
  registerUser,
  resendVerificationEmail,
  resetPassword,
  verifyEmail,
} from "../controllers/authController.js";

import express from "express";

const router = express.Router();

router.post("/register", registerUser);
router.get("/verify-email", verifyEmail);
router.post("/login", loginUser);
router.post("/resend-email-verification-link", resendVerificationEmail);
router.post("/forget-password", forgetPassword);
router.post("/reset-password/:token", resetPassword);

export default router;
