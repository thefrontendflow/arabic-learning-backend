import { User } from "../models/User.js";
import bcrypt from "bcrypt";
import crypto from "crypto";
import jwt from "jsonwebtoken";
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

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(32).toString("hex");

    const user = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
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

    res.status(201).json({
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
    if (!user)
      return res.status(400).json({ error: "Invalid or expired token" });

    if (user.emailVerificationExpires < Date.now()) {
      return res.status(400).json({
        error: "Verification token has expired. Please request for new link!.",
      });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    res
      .status(200)
      .json({ success: true, message: "Email verified successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Login Controller
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ error: "Invalid email or password" });

    // Check if the email is verified
    if (!user.isVerified) {
      return res
        .status(403)
        .json({ error: "Email not verified. Please verify your email first." });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ error: "Invalid email or password" });

    // Starts here

    // Check if 2FA is enabled
    if (user.isTwoFactorEnabled) {
      // Generate a random 6-digit code for 2FA
      const twoFactorCode = crypto.randomInt(100000, 999999).toString();
      user.twoFactorCode = twoFactorCode;
      user.twoFactorExpires = Date.now() + 10 * 60 * 1000; // Expires in 10 minutes
      await user.save();

      // Send the 2FA code via email
      await sendEmail({
        to: user.email,
        subject: "Your 2FA Login Code",
        text: `Your login verification code is ${twoFactorCode}. It will expire in 10 minutes.`,
      });
      // Respond indicating that 2FA is required
      return res.status(200).json({
        success: true,
        message: "2FA code sent to your email. Please verify to continue.",
      });
    }

    // Stops here

    // Generate JWT
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h", // Token valid in 1 hr
      }
    );

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Resend email link for verification
export const resendVerificationEmail = async (req, res) => {
  try {
    const { email } = req.body;

    // Check if the user exists
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found!" });

    // Check if the user is already verified
    if (user.isVerified) {
      return res.status(400).json({ error: "Email is already verified!" });
    }

    // Generate a new verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");
    user.verificationToken = verificationToken;
    user.emailVerificationExpires = Date.now() + 1 * 60 * 60 * 1000; // 1 hour
    await user.save();

    // Send the verification email
    const verificationUrl = `${process.env.CLIENT_URL}/verify-email?token=${verificationToken}`;
    await sendEmail({
      to: email,
      subject: "Email Verification",
      text: `Please verify your email by clicking this link: ${verificationUrl}`,
    });

    res.status(200).json({
      success: true,
      message: "Verification email resent successfully.",
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const forgetPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({
        message:
          "If your email address exists in our database, you will receive a password recovery link at your email address in a few minutes!",
      });

    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
    await sendEmail({
      to: email,
      subject: "Password Reset",
      text: `Click here to reset: ${resetUrl}`,
    });

    res.status(200).json({ message: "Password reset link sent!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { newPassword } = req.body;
    const { token } = req.params;
    if (!newPassword) {
      return res.status(400).json({ error: "New password is required." });
    }
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });
    if (!user)
      return res.status(400).json({ message: "Invalid or expired token!" });

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({ message: "Password reset successfully!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    // Validate inputs
    if (!oldPassword || !newPassword) {
      return res
        .status(400)
        .json({ message: "Old password and New password are required." });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found!" });
    }
    // Check if the old password is correct
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Incorrect old password!" });

    // Check if the old password is same as new password
    if (oldPassword === newPassword) {
      return res
        .status(400)
        .json({ message: "You can't use the old password!" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.status(200).json({ message: "Password successfully changed!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const checkAuthentication = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found!" });
    }
    res.status(200).json({
      message: "User is authenticated",
      user: { ...user._doc, password: undefined }, // The user info decoded from the JWT token in the middleware
    });
  } catch (error) {
    console.log("Error in checkAuth", error);
    res.status(500).json({ message: error.message });
  }
};

export const enable2FA = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Generate a random 6-digit code
    const code = crypto.randomInt(100000, 999999).toString();

    // Set the verification code and expiration
    user.twoFactorCode = code;
    user.twoFactorExpires = Date.now() + 10 * 60 * 1000; // Code expires in 10 minutes
    await user.save();

    await sendEmail({
      to: user.email,
      subject: "Your 2FA Verification Code",
      text: `Your verification code is ${code}. It will expire in 10 minutes.`,
    });

    res
      .status(200)
      .json({ success: true, message: "2FA code sent to your email." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const verify2FA = async (req, res) => {
  try {
    const { code } = req.body;
    const user = await User.findById(req.user.id);

    if (!user || !user.twoFactorCode) {
      return res.status(400).json({ error: "2FA not enabled or code not found" });
    }

    // Check if the code matches and has not expired
    if (user.twoFactorCode !== code || user.twoFactorExpires < Date.now()) {
      return res.status(400).json({ error: "Invalid or expired code" });
    }

    // Mark 2FA as enabled and clear the code
    user.isTwoFactorEnabled = true;
    user.twoFactorCode = undefined;
    user.twoFactorExpires = undefined;
    await user.save();

    res.status(200).json({ success: true, message: "2FA enabled successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const disable2FA = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    user.isTwoFactorEnabled = false;
    user.twoFactorCode = undefined;
    user.twoFactorExpires = undefined;
    await user.save();

    res.status(200).json({ success: true, message: "2FA disabled successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const verifyLogin2FA = async (req, res) => {
  try {
    const { email, code } = req.body;

    // Find the user by email
    const user = await User.findOne({ email });
    if (!user || !user.isTwoFactorEnabled || !user.twoFactorCode) {
      return res.status(400).json({ error: "2FA not enabled or invalid user" });
    }

    // Validate the code and check expiration
    if (user.twoFactorCode !== code || user.twoFactorExpires < Date.now()) {
      return res.status(400).json({ error: "Invalid or expired 2FA code" });
    }

    // Clear the 2FA code after successful verification
    user.twoFactorCode = undefined;
    user.twoFactorExpires = undefined;
    await user.save();

    // Generate and send the JWT
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};