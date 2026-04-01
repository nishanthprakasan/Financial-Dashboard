import mongoose from "mongoose";
import Transaction from "../models/Transaction.js";

// ─── Fetch Transactions (with pagination) ────────────────────────────────────
async function handleFetchTransaction(req, res) {
  try {
    const userId = req.userId;
    const { page = 1, limit = 20 } = req.query;

    const transactions = await Transaction.find({ userId })
      .sort({ date: -1 })
      .skip((page - 1) * Number(limit))
      .limit(Number(limit));

    const total = await Transaction.countDocuments({ userId });

    res.status(200).json({
      success: true,
      transactions,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching entries" });
  }
}

// ─── Add Transaction ──────────────────────────────────────────────────────────
async function handleAddTransaction(req, res) {
  try {
    const userId = req.userId;
    const { description, amount, category, type, date, paymentMethod } =
      req.body;

    // Basic validation
    if (!description || !amount || !category || !type || !date || !paymentMethod) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    if (!["income", "expense"].includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Type must be income or expense",
      });
    }

    if (amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Amount must be greater than 0",
      });
    }

    const transaction = await Transaction.create({
      userId,
      description,
      amount,
      category,
      type,
      date,
      paymentMethod,
    });

    res.status(201).json({
      success: true,
      transaction,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error adding entry" });
  }
}

// ─── Edit Transaction (userId stripped from updates) ─────────────────────────
async function handleEditTransaction(req, res) {
  try {
    const userId = req.userId;
    const { id } = req.params;

    // Strip userId and _id from updates so user can't overwrite ownership
    const { userId: _removedUserId, _id: _removedId, ...safeUpdates } = req.body;

    const transaction = await Transaction.findOneAndUpdate(
      { _id: id, userId },
      safeUpdates,
      { new: true, runValidators: true }
    );

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found or not authorized",
      });
    }

    res.status(200).json({
      success: true,
      transaction,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error updating transaction",
    });
  }
}

// ─── Delete Transaction ───────────────────────────────────────────────────────
async function handleDeleteTransaction(req, res) {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const transaction = await Transaction.findOneAndDelete({ _id: id, userId });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found or not authorized",
      });
    }

    res.json({
      success: true,
      message: "Transaction deleted successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error deleting entry" });
  }
}

// ─── Export Transactions ──────────────────────────────────────────────────────
async function handleExportTransaction(req, res) {
  try {
    const userId = req.userId;
    const { format = "csv" } = req.query;

    const transactions = await Transaction.find({ userId }).sort({ date: -1 });

    switch (format) {
      case "csv":
        exportToCSV(transactions, res);
        break;
      case "json":
        exportToJSON(transactions, res);
        break;
      default:
        return res.status(400).json({
          success: false,
          message: "Unsupported export format. Use csv or json.",
        });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error exporting entries" });
  }
}

function exportToCSV(transactions, res) {
  const headers = [
    "Date",
    "Description",
    "Category",
    "Amount",
    "Type",
    "Payment Method",
    "Status",
  ];

  const csvRows = transactions.map((t) => [
    new Date(t.date).toISOString().split("T")[0],
    `"${t.description.replace(/"/g, '""')}"`,
    t.category,
    Math.abs(t.amount).toFixed(2),
    t.type,
    t.paymentMethod,
    t.status,
  ]);

  const csvContent = [
    headers.join(","),
    ...csvRows.map((row) => row.join(",")),
  ].join("\n");

  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", "attachment; filename=transactions.csv");
  res.send(csvContent);
}

function exportToJSON(transactions, res) {
  const transactionsData = transactions.map((t) => ({
    id: t._id,
    date: t.date,
    description: t.description,
    category: t.category,
    amount: t.amount,
    type: t.type,
    paymentMethod: t.paymentMethod,
    status: t.status,
    createdAt: t.createdAt,
  }));

  res.setHeader("Content-Type", "application/json");
  res.setHeader(
    "Content-Disposition",
    "attachment; filename=transactions.json"
  );
  res.send(JSON.stringify(transactionsData, null, 2));
}

// ─── Analytics ────────────────────────────────────────────────────────────────
async function handleGetAnalytics(req, res) {
  try {
    const userId = req.userId;
    const userObjectId = new mongoose.Types.ObjectId(userId);

    // Monthly income and expenses over all time
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

    // Spending breakdown by category (expenses only)
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

    // Breakdown by payment method
    const paymentData = await Transaction.aggregate([
      { $match: { userId: userObjectId, status: "completed" } },
      {
        $group: {
          _id: "$paymentMethod",
          total: { $sum: "$amount" },
        },
      },
      { $sort: { total: -1 } },
    ]);

    res.json({
      success: true,
      data: {
        monthlyData,
        categoryData,
        paymentData,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching analytics" });
  }
}

export default {
  handleFetchTransaction,
  handleAddTransaction,
  handleEditTransaction,
  handleDeleteTransaction,
  handleExportTransaction,
  handleGetAnalytics,
};