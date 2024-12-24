import bcrypt from "bcrypt";
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["student", "instructor", "admin"],
      default: "student",
    },
    isVerified: { type: Boolean, default: false },
    verificationToken: { type: String },
    emailVerificationExpires: { type: Date },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
    twoFactorAuth: {
      enabled: { type: Boolean, default: false },
      secret: { type: String },
    },
  },
  { timestamps: true }
);

export const User = mongoose.model("User", userSchema);
