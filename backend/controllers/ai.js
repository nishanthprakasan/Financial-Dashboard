import { GoogleGenerativeAI } from "@google/generative-ai";
import Transaction from "../models/Transaction.js";
import mongoose from "mongoose";

async function handleAIChat(req, res) {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const { message } = req.body;
    const userObjectId = new mongoose.Types.ObjectId(req.userId);

    if (!message) {
      return res
        .status(400)
        .json({ success: false, message: "Message is required" });
    }

    // Fetch user's transactions to give Gemini real context
    const transactions = await Transaction.find({ userId: userObjectId })
      .sort({ date: -1 })
      .limit(100)
      .select("date description category amount type paymentMethod status");

    // Summarize the data for the prompt
    const totalIncome = transactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = transactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);

    const categoryTotals = {};
    transactions
      .filter((t) => t.type === "expense")
      .forEach((t) => {
        categoryTotals[t.category] =
          (categoryTotals[t.category] || 0) + t.amount;
      });

    const recentTransactions = transactions.slice(0, 10).map((t) => ({
      date: new Date(t.date).toISOString().split("T")[0],
      description: t.description,
      category: t.category,
      amount: t.amount,
      type: t.type,
    }));

    const context = `
You are a personal finance assistant. You have access to the user's financial data below.
Answer their question in a helpful, concise, and friendly way. Use the data to give specific answers.
Keep responses under 150 words. Use $ for amounts.

FINANCIAL SUMMARY:
- Total Income: $${totalIncome.toLocaleString()}
- Total Expenses: $${totalExpenses.toLocaleString()}
- Total Savings: $${(totalIncome - totalExpenses).toLocaleString()}
- Savings Rate: ${totalIncome > 0 ? (((totalIncome - totalExpenses) / totalIncome) * 100).toFixed(1) : 0}%

SPENDING BY CATEGORY:
${Object.entries(categoryTotals)
  .sort((a, b) => b[1] - a[1])
  .map(([cat, amt]) => `- ${cat}: $${amt.toLocaleString()}`)
  .join("\n")}

RECENT TRANSACTIONS:
${recentTransactions.map((t) => `- ${t.date} | ${t.description} | ${t.category} | $${t.amount} | ${t.type}`).join("\n")}

USER QUESTION: ${message}
    `;

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(context);
    const reply = result.response.text();

    res.json({ success: true, reply });
  } catch (error) {
    console.error("AI chat error:", error);
    res
      .status(500)
      .json({ success: false, message: "Error getting AI response" });
  }
}

export default { handleAIChat };
