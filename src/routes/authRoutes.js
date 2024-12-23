import { registerUser, verifyEmail } from '../controllers/authController.js';

import express from 'express';

const router = express.Router();

router.post("/register", registerUser);
router.get("/verify-email", verifyEmail);

router.post("/login", (req, res) => {
  res.send("User login endpoint");
});

export default router;
