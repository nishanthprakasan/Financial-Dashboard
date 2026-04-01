import mongoose from "mongoose";
import Transaction from "../models/Transaction.js";

// ─── Monthly Income & Expenses ────────────────────────────────────────────────
async function getMonthlyData(req, res) {
  try {
    const userObjectId = new mongoose.Types.ObjectId(req.userId);

    const monthlyData = await Transaction.aggregate([
      { $match: { userId: userObjectId, status: "completed" } },
      {
        $group: {
          _id: {
            year: { $year: "$date" },
            month: { $month: "$date" },
            type: "$type",
          },
          total: { $sum: "$amount" },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    // Reshape into { month, year, income, expenses, savings } per month
    const monthMap = {};
    monthlyData.forEach(({ _id, total }) => {
      const key = `${_id.year}-${_id.month}`;
      if (!monthMap[key]) {
        monthMap[key] = { year: _id.year, month: _id.month, income: 0, expenses: 0 };
      }
      if (_id.type === "income") monthMap[key].income = total;
      if (_id.type === "expense") monthMap[key].expenses = total;
    });

    const result = Object.values(monthMap).map((m) => ({
      ...m,
      savings: m.income - m.expenses,
      savingsRate: m.income > 0 ? ((m.income - m.expenses) / m.income) * 100 : 0,
    }));

    res.json({ success: true, data: result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching monthly data" });
  }
}

// ─── Category Breakdown ───────────────────────────────────────────────────────
async function getCategoryData(req, res) {
  try {
    const userObjectId = new mongoose.Types.ObjectId(req.userId);

    const categoryData = await Transaction.aggregate([
      {
        $match: {
          userId: userObjectId,
          type: "expense",
          status: "completed",
        },
      },
      {
        $group: {
          _id: "$category",
          total: { $sum: "$amount" },
        },
      },
      { $sort: { total: -1 } },
    ]);

    // Add percentage to each category
    const grandTotal = categoryData.reduce((sum, c) => sum + c.total, 0);
    const result = categoryData.map((c) => ({
      category: c._id,
      total: c.total,
      percentage: grandTotal > 0 ? Math.round((c.total / grandTotal) * 100) : 0,
    }));

    res.json({ success: true, data: result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching category data" });
  }
}

// ─── Payment Method Breakdown ─────────────────────────────────────────────────
async function getPaymentMethodData(req, res) {
  try {
    const userObjectId = new mongoose.Types.ObjectId(req.userId);

    const paymentData = await Transaction.aggregate([
      { $match: { userId: userObjectId, status: "completed" } },
      {
        $group: {
          _id: "$paymentMethod",
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      { $sort: { total: -1 } },
    ]);

    // Add percentage to each payment method
    const grandTotal = paymentData.reduce((sum, p) => sum + p.total, 0);
    const result = paymentData.map((p) => ({
      paymentMethod: p._id,
      total: p.total,
      count: p.count,
      percentage: grandTotal > 0 ? Math.round((p.total / grandTotal) * 100) : 0,
    }));

    res.json({ success: true, data: result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching payment method data" });
  }
}

export default { getMonthlyData, getCategoryData, getPaymentMethodData };