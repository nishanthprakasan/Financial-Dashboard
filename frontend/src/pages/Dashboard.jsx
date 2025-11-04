import { Layout } from "../components/Layout";
import { MetricCard } from "../components/MetricCard";
import { IncomeExpenseChart } from "../components/IncomeExpenseChart";
import { SpendingChart } from "../components/SpendingChart";
import { TransactionsTable } from "../components/TransactionsTable";
import { Wallet, TrendingUp, TrendingDown, PiggyBank } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

function Dashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:8000/api/dashboard", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      });
      const data = await response.json();
      if (data.success) {
        setDashboardData(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading ) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div>Loading...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Personal Finance
          </h1>
          <p className="text-slate-600 mt-1">Welcome back, {user?.name}</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Account Balance"
            value={`$${
              dashboardData?.metrics.accountBalance.toLocaleString() || "0"
            }`}
            change={`${
              dashboardData?.metrics.changes.accountBalance?.toFixed(1) || "0"
            }%`}
            trend={
              dashboardData?.metrics.changes.accountBalance >= 0 ? "up" : "down"
            }
            icon={<Wallet className="h-4 w-4" />}
          />
          <MetricCard
            title="Monthly Income"
            value={`$${
              dashboardData?.metrics.monthlyIncome.toLocaleString() || "0"
            }`}
            change={`${
              dashboardData?.metrics.changes.monthlyIncome?.toFixed(1) || "0"
            }%`}
            trend={
              dashboardData?.metrics.changes.monthlyIncome >= 0 ? "up" : "down"
            }
            icon={<TrendingUp className="h-4 w-4" />}
          />
          <MetricCard
            title="Monthly Expenses"
            value={`$${
              dashboardData?.metrics.monthlyExpenses.toLocaleString() || "0"
            }`}
            change={`${
              dashboardData?.metrics.changes.monthlyExpenses?.toFixed(1) || "0"
            }%`}
            trend={
              dashboardData?.metrics.changes.monthlyExpenses >= 0
                ? "up"
                : "down"
            }
            icon={<TrendingDown className="h-4 w-4" />}
          />
          <MetricCard
            title="Savings Rate"
            value={`${dashboardData?.metrics.savingsRate?.toFixed(1) || "0"}%`}
            change={`${
              dashboardData?.metrics.changes.savingsRate?.toFixed(1) || "0"
            }%`}
            trend={
              dashboardData?.metrics.changes.savingsRate >= 0 ? "up" : "down"
            }
            icon={<PiggyBank className="h-4 w-4" />}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <IncomeExpenseChart data={dashboardData?.monthlyData} />
          <SpendingChart data={dashboardData?.categoryBreakdown} />
        </div>

        <TransactionsTable transactions={dashboardData?.recentTransactions} />
      </div>
    </Layout>
  );
}

export { Dashboard };
