import { User } from "../models/User.js";

// Get all users
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password -__v"); // Exclude sensitive fields
    res.status(200).json({ users });
  } catch (error) {
    res.status(500).json({ message: "Error fetching users", error });
  }
};

// Get user details
export const getUserDetails = async (req, res) => {
  try {
    const { id } = req.params;

    // Find user by ID
    const user = await User.findById(id).select("-password -__v"); // Exclude sensitive fields

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ message: "Error fetching user details", error });
  }
};

// Update user details
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Validate user input (optional: ensure only specific fields can be updated)
    const allowedFields = ["firstName", "lastName", "email", "password"];
    const isValidUpdate = Object.keys(updates).every((key) =>
      allowedFields.includes(key)
    );
    if (!isValidUpdate) {
      return res
        .status(400)
        .json({ message: "Invalid fields in update request" });
    }

    // Update user in database
    const user = await User.findByIdAndUpdate(id, updates, {
      new: true,
    }).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "User updated successfully", user });
  } catch (error) {
    res.status(500).json({ message: "Error updating user details", error });
  }
};

// Delete a user (admin only)
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Delete user
    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting user", error });
  }
};
