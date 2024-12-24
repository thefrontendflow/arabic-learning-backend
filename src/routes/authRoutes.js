import { loginUser, registerUser, resendVerificationEmail, verifyEmail } from '../controllers/authController.js';

import express from 'express';

const router = express.Router();

router.post("/register", registerUser);
router.get("/verify-email", verifyEmail);
router.post("/login", loginUser);
router.post("/resend-email-verification-link", resendVerificationEmail);

export default router;
