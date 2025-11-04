import Transaction from "../models/Transaction.js";

async function handleFetchTransaction(req, res) {
  try {
    const userId = req.userId;
    const transactions = await Transaction.find({ userId: userId });
    res.status(200).json({
      success: true,
      transactions: transactions,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching entries" });
  }
}

async function handleAddTransaction(req, res) {
  try {
    const userId = req.userId;
    const { description, amount, category, type, date, paymentMethod } =
      req.body;
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
      transaction: transaction,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error adding entry" });
  }
}

async function handleEditTransaction(req, res) {
  try {
    const userId = req.userId;
    const { id } = req.params;
    const updates = req.body;

    const transaction = await Transaction.findOneAndUpdate(
      {
        _id: id,
        userId: userId,
      },
      updates,
      { new: true }
    );

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found or not authorized",
      });
    }
    res.status(200).json({
      success: true,
      transaction: transaction,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error updating transaction",
    });
  }
}

async function handleDeleteTransaction(req, res) {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const transaction = await Transaction.findOne({ _id: id, userId });
    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

    await Transaction.findByIdAndDelete(id);
    res.json({
      success: true,
      message: "Transaction deleted successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error deleting entry" });
  }
}

async function handleExportTransaction(req, res) {
  try {
    const userId = req.userId;
    const { format = "csv" } = req.query;

    const transaction = await Transaction.find({ userId }).sort({ date: -1 });
    switch (format) {
      case "csv":
        await exportToCSV(transaction, res);
        break;
      case "json":
        await exportToJSON(transaction, res);
        break;
      default:
        return res.status(400).json({
          success: false,
          message: "Unsupported export format",
        });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error exporting entry" });
  }
}

function exportToCSV(transactions, res) {
  try {
    const headers = [
      "Date",
      "Description",
      "Category",
      "Amount",
      "Type",
      "Payment Method",
      "Status",
    ];

    const csvRows = transactions.map((transaction) => [
      new Date(transaction.date).toISOString().split("T")[0],
      `"${transaction.description.replace(/"/g, '""')}"`,
      transaction.category,
      Math.abs(transaction.amount).toFixed(2),
      transaction.type,
      transaction.paymentMethod,
      transaction.status,
    ]);

    const csvContent = [
      headers.join(","),
      ...csvRows.map((row) => row.join(",")),
    ].join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=transactions.csv"
    );

    res.send(csvContent);
  } catch (error) {
    throw new Error("CSV export failed");
  }
}

function exportToJSON(transactions, res) {
  try {
    const transactionsData = transactions.map((transaction) => ({
      id: transaction._id,
      date: transaction.date,
      description: transaction.description,
      category: transaction.category,
      amount: transaction.amount,
      type: transaction.type,
      paymentMethod: transaction.paymentMethod,
      status: transaction.status,
      createdAt: transaction.createdAt,
    }));

    res.setHeader("Content-Type", "application/json");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=transactions.json"
    );

    res.send(JSON.stringify(transactionsData, null, 2));
  } catch (error) {
    throw new Error("JSON export failed");
  }
}

export default {
  handleFetchTransaction,
  handleAddTransaction,
  handleEditTransaction,
  handleDeleteTransaction,
  handleExportTransaction,
};
