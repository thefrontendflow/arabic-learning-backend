import { User } from "../models/User.js";
import crypto from "crypto";

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
