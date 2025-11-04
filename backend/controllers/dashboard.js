import mongoose from 'mongoose';
import Transaction from "../models/Transaction.js";
import FinancialSummary from "../models/FinancialSummary.js";

async function getDashboardData(req, res) {
  try {
    const userId = req.userId;
    const userObjectId = new mongoose.Types.ObjectId(userId);

    const latestTransaction = await Transaction.findOne({ 
      userId: userObjectId 
    }).sort({ date: -1 });

    if (!latestTransaction) {
      return res.json({
        success: true,
        data: {
          metrics: {
            accountBalance: 0,
            monthlyIncome: 0,
            monthlyExpenses: 0,
            savingsRate: 0,
            changes: { accountBalance: 0, monthlyIncome: 0, monthlyExpenses: 0, savingsRate: 0 }
          },
          monthlyData: [],
          categoryBreakdown: [],
          recentTransactions: []
        }
      });
    }

    const referenceDate = new Date(latestTransaction.date);
    
    const startOfCurrentMonth = new Date(
      referenceDate.getFullYear(),
      referenceDate.getMonth(),
      1
    );
    const endOfCurrentMonth = new Date(
      referenceDate.getFullYear(),
      referenceDate.getMonth() + 1,
      0,
      23, 59, 59, 999
    );

    const startOfPreviousMonth = new Date(
      referenceDate.getFullYear(),
      referenceDate.getMonth() - 1,
      1
    );
    const endOfPreviousMonth = new Date(
      referenceDate.getFullYear(),
      referenceDate.getMonth(),
      0,
      23, 59, 59, 999
    );

    let summary = await FinancialSummary.findOne({ userId });
    if (!summary) {
      summary = await FinancialSummary.create({ userId });
    }

    const currentMonthTransactions = await Transaction.aggregate([
      {
        $match: {
          userId: userObjectId,
          date: { $gte: startOfCurrentMonth, $lte: endOfCurrentMonth },
          status: "completed",
        },
      },
      {
        $group: {
          _id: "$type",
          total: { $sum: "$amount" },
        },
      },
    ]);

    const previousMonthTransactions = await Transaction.aggregate([
      {
        $match: {
          userId: userObjectId,
          date: { $gte: startOfPreviousMonth, $lte: endOfPreviousMonth },
          status: "completed",
        },
      },
      {
        $group: {
          _id: "$type",
          total: { $sum: "$amount" },
        },
      },
    ]);
    const currentIncome =
      currentMonthTransactions.find((t) => t._id === "income")?.total || 0;
    const currentExpenses = Math.abs(
      currentMonthTransactions.find((t) => t._id === "expense")?.total || 0
    );
    const currentSavingsRate =
      currentIncome > 0
        ? ((currentIncome - currentExpenses) / currentIncome) * 100
        : 0;

    const previousIncome =
      previousMonthTransactions.find((t) => t._id === "income")?.total || 0;
    const previousExpenses = Math.abs(
      previousMonthTransactions.find((t) => t._id === "expense")?.total || 0
    );
    const previousSavingsRate =
      previousIncome > 0
        ? ((previousIncome - previousExpenses) / previousIncome) * 100
        : 0;

    const calculateChange = (current, previous) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return ((current - previous) / previous) * 100;
    };

    const changes = {
      accountBalance: 0,
      monthlyIncome: calculateChange(currentIncome, previousIncome),
      monthlyExpenses: calculateChange(currentExpenses, previousExpenses),
      savingsRate: calculateChange(currentSavingsRate, previousSavingsRate),
    };

    const allTransactions = await Transaction.aggregate([
      {
        $match: {
          userId: userObjectId,
          status: "completed",
        },
      },
      {
        $group: {
          _id: "$type",
          total: { $sum: "$amount" },
        },
      },
    ]);

    const totalIncome = allTransactions.find((t) => t._id === "income")?.total || 0;
    const totalExpenses = Math.abs(
      allTransactions.find((t) => t._id === "expense")?.total || 0
    );
    const accountBalance = totalIncome - totalExpenses;

    summary.accountBalance = accountBalance;
    await summary.save();

    const categoryBreakdown = await Transaction.aggregate([
      {
        $match: {
          userId: userObjectId,
          date: { $gte: startOfCurrentMonth, $lte: endOfCurrentMonth },
          type: "expense",
          status: "completed",
        },
      },
      {
        $group: {
          _id: "$category",
          amount: { $sum: "$amount" },
        },
      },
      {
        $project: {
          category: "$_id",
          amount: 1,
          _id: 0,
        },
      },
    ]);

    const totalExpensesCurrent = categoryBreakdown.reduce(
      (sum, category) => sum + Math.abs(category.amount),
      0
    );
    const categoryBreakdownWithPercentages = categoryBreakdown.map(
      (category) => ({
        ...category,
        percentage:
          totalExpensesCurrent > 0
            ? Math.round((Math.abs(category.amount) / totalExpensesCurrent) * 100)
            : 0,
      })
    );

    const recentTransactions = await Transaction.find({
      userId: userObjectId,
      status: "completed",
    })
      .sort({ date: -1 })
      .limit(10)
      .select("date description category amount type status paymentMethod");

    const monthlyData = await getLastSixMonthsData(userId);

    res.json({
      success: true,
      data: {
        metrics: {
          accountBalance: accountBalance, 
          monthlyIncome: currentIncome,
          monthlyExpenses: currentExpenses,
          savingsRate: currentSavingsRate,
          changes: changes,
        },
        monthlyData: monthlyData,
        categoryBreakdown: categoryBreakdownWithPercentages,
        recentTransactions: recentTransactions,
      },
    });

  } catch (error) {
    console.error("Dashboard data error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
}

async function getLastSixMonthsData(userId) {
  const months = [];
  const userObjectId = new mongoose.Types.ObjectId(userId);

  const latestTransaction = await Transaction.findOne({
    userId: userObjectId,
  }).sort({ date: -1 });

  const referenceDate = latestTransaction
    ? new Date(latestTransaction.date)
    : new Date();

  for (let i = 5; i >= 0; i--) {
    const date = new Date(
      referenceDate.getFullYear(),
      referenceDate.getMonth() - i,
      1
    );
    const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    const endOfMonth = new Date(
      date.getFullYear(),
      date.getMonth() + 1,
      0,
      23,
      59,
      59,
      999
    );

    const monthData = await Transaction.aggregate([
      {
        $match: {
          userId: userObjectId,
          date: { $gte: startOfMonth, $lte: endOfMonth },
          status: "completed",
        },
      },
      {
        $group: {
          _id: "$type",
          total: { $sum: "$amount" },
        },
      },
    ]);

    const income = monthData.find((t) => t._id === "income")?.total || 0;
    const expenses = Math.abs(
      monthData.find((t) => t._id === "expense")?.total || 0
    );

    months.push({
      month: date.toLocaleString("default", { month: "short" }),
      year: date.getFullYear(),
      income,
      expenses,
    });
  }

  return months;
}

export default { getDashboardData };
