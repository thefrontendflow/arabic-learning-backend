import express from 'express';
import { registerUser } from '../controllers/authController.js';
const router = express.Router();

router.post("/register", registerUser);

router.post("/login", (req, res) => {
  res.send("User login endpoint");
});

export default router;
