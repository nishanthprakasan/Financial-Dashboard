import jwt from "jsonwebtoken";
import User from "../models/User.js";
import FinancialSummary from "../models/FinancialSummary.js";

async function handleUserSignup(req, res) {
  try {
    const { name, email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists with the given email.",
      });
    }
    const user = await User.create({ name, email, password });
    await FinancialSummary.create({
      userId: user._id,
      accountBalance: 0,
      monthlyIncome: 0,
      monthlyExpenses: 0,
      savingsRate: 0,
      categoryBreakdown: [],
    });
    console.log("User created successfully:", user._id);
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.cookie("authToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        currency: user.currency,
        onboardingCompleted: user.onboardingCompleted,
      },
      token: token,
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: "Server error" });
  }
}

async function completeOnboarding(req, res) {
  try {
    const userId = req.userId;
    const {
      avatar,
      usagePurpose,
      currency,
      financialGoals,
      monthlyIncome,
      notificationPreferences,
    } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        avatar,
        usagePurpose,
        currency,
        financialGoals,
        monthlyIncome,
        notificationPreferences,
        onboardingCompleted: true,
      },
      { new: true }
    );

    res.json({
      success: true,
      user: updatedUser.getProfile(),
    });
  } catch (error) {
    console.error("Onboarding error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to complete onboarding" });
  }
}

async function handleUserLogin(req, res) {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password +salt");
    console.log(user);
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    const isPasswordCorrect = await user.matchPassword(password);

    if (!isPasswordCorrect) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.cookie("authToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        currency: user.currency,
        onboardingCompleted: user.onboardingCompleted, 
        usagePurpose: user.usagePurpose,
        financialGoals: user.financialGoals,
        monthlyIncome: user.monthlyIncome,
        avatar: user.avatar,
      },
      token: token,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function handleUserLogout(req, res) {
  try {
    res.clearCookie("authToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Logout failed",
    });
  }
}

export default {
  handleUserSignup,
  completeOnboarding,
  handleUserLogin,
  handleUserLogout,
};
