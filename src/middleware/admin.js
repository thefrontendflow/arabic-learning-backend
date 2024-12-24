import { User } from "../models/User.js";

// Middleware to check if the user is an admin
export const isAdmin = async (req, res, next) => {
  try {
    const userId = req.user.id; // Assuming `req.user` is set by your authentication middleware

    // Find user by ID
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the user is an admin
    if (user.role !== "admin") {
      return res
        .status(403)
        .json({
          message: "Access denied. Admins only can perform this action!",
        });
    }

    // If the user is an admin, move to the next middleware/route handler
    next();
  } catch (error) {
    res.status(500).json({ message: "Error checking admin role", error });
  }
};
