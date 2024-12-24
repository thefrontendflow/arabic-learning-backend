import { User } from "../models/User.js";
import jwt from "jsonwebtoken";

export const authMiddleware = async (req, res, next) => {
  const authHeader = req.header("Authorization");
  if (!authHeader) {
    return res
      .status(403)
      .json({ message: "Access denied. No token provided." });
  }
  const token = req.header("Authorization")?.split(" ")[1]; // Extract token from "Bearer <token>"
  if (!token) return res.status(403).json({ message: "Access denied!" });

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    if (!verified)
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized - invalid token" });

    const user = await User.findById(verified.id); // Get user from DB using the ID in the JWT payload
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    req.user = user; // Attach full user details to req.user
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token!" });
  }
};
