import User from "../models/User.js";
import { createHmac, randomBytes } from "node:crypto";
async function handleSettings(req, res) {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    return res.json({
      success: true,
      user: {
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        currency: user.currency,
        usagePurpose: user.usagePurpose,
        monthlyIncome: user.monthlyIncome,
        financialGoals: user.financialGoals,
        notificationPreferences: user.notificationPreferences,
        loginMethod: user.loginMethod,
        emailVerified: user.emailVerified,
        onboardingCompleted: user.onboardingCompleted,
      },
    });
  } catch (err) {
    console.error("Settings fetch error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

async function handleUserUpdate(req, res) {
  try {
    const allowedFields = [
      "name",
      "avatar",
      "usagePurpose",
      "currency",
      "monthlyIncome",
      "financialGoals",
      "notificationPreferences",
    ];

    const updates = {};

    for (const key of allowedFields) {
      if (req.body[key] !== undefined) {
        updates[key] = req.body[key];
      }
    }

    const user = await User.findByIdAndUpdate(req.userId, updates, {
      new: true,
    });

    return res.json({
      success: true,
      message: "Settings updated successfully",
      user: user.getProfile(),
    });
  } catch (err) {
    console.error("Settings update error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

async function handlePasswordChange(req, res) {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match",
      });
    }

    const user = await User.findById(req.userId).select("+password +salt");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (user.loginMethod !== "email") {
      return res.status(403).json({
        success: false,
        message: "Password cannot be changed for Google accounts",
      });
    }

    const hashedCurrent = createHmac("sha256", user.salt)
      .update(currentPassword)
      .digest("hex");

    if (hashedCurrent !== user.password) {
      return res.status(401).json({
        success: false,
        message: "Incorrect current password",
      });
    }

    const newSalt = randomBytes(16).toString("hex");
    const hashedNew = createHmac("sha256", newSalt)
      .update(newPassword)
      .digest("hex");

    user.password = hashedNew;
    user.salt = newSalt;

    await user.save();

    return res.json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (err) {
    console.error("Password change error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

async function handleAccountDeletion(req, res) {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    user.isActive = false;
    await user.save();

    res.clearCookie("authToken");

    return res.json({
      success: true,
      message: "Account deactivated successfully",
    });
  } catch (err) {
    console.error("Account deletion error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

export default {
  handleSettings,
  handleUserUpdate,
  handlePasswordChange,
  handleAccountDeletion,
};
