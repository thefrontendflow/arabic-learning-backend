import { User } from "../models/User.js";
import crypto from "crypto";
import { sendEmail } from "../utils/emailService.js";

export const registerUser = async (req, res) => {
  try {
    const { firstName, lastName, email, password, role } = req.body;

    if (!firstName || !lastName || !email || !password || !role) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const userExists = await User.findOne({ email });
    if (userExists)
      return res.status(400).json({ error: "Email already exists!" });

    const verificationToken = crypto.randomBytes(32).toString("hex");

    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      role,
      verificationToken,
      emailVerificationExpires: Date.now() + 24 * 60 * 60 * 1000, // 24 hours from now
    });

    const verificationUrl = `${process.env.CLIENT_URL}/verify-email?token=${verificationToken}`;
    
    await sendEmail({
      to: email,
      subject: "Verify Your Email",
      text: `Please verify your email by clicking this link: ${verificationUrl}`,
    });

    res
      .status(201)
      .json({
        success: true,
        message: "Registration successful. Verify your email.",
      });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Verify Email
export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;

    const user = await User.findOne({ verificationToken: token });
    if (!user) return res.status(400).json({ error: "Invalid or expired token" });

    if (user.emailVerificationExpires < Date.now()) {
      return res.status(400).json({ error: "Verification token has expired. Please request for new link!." });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    res.status(200).json({ success: true, message: "Email verified successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
