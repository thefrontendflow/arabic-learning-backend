import {
  deleteUser,
  getAllUsers,
  getUserDetails,
  updateUser,
} from "../controllers/userController.js";

import { authMiddleware } from "../middleware/authMiddleware.js";
import express from "express";
import { isAdmin } from "../middleware/admin.js";

const router = express.Router();

router.get("/", authMiddleware, isAdmin, getAllUsers);
router.get("/:id", authMiddleware, getUserDetails);
router.put("/:id", authMiddleware, updateUser);
router.delete("/:id", authMiddleware, isAdmin, deleteUser);

export default router;
