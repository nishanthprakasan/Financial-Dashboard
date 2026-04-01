import { Layout } from "../components/Layout";
import { AIChat } from "../components/AIChat";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../components/ui/card";
import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const PIE_COLORS = [
  "#6366f1",
  "#22c55e",
  "#f59e0b",
  "#ef4444",
  "#3b82f6",
  "#ec4899",
  "#14b8a6",
  "#f97316",
];

function Analytics() {
  const [monthlyData, setMonthlyData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [paymentData, setPaymentData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };
      const opts = { headers, credentials: "include" };

      const [monthlyRes, categoryRes, paymentRes] = await Promise.all([
        fetch(
          "https://financial-dashboard-ytrl.onrender.com/api/analytics/monthly",
          opts,
        ),
        fetch(
          "https://financial-dashboard-ytrl.onrender.com/api/analytics/categories",
          opts,
        ),
        fetch(
          "https://financial-dashboard-ytrl.onrender.com/api/analytics/payment-methods",
          opts,
        ),
      ]);

      const [monthly, category, payment] = await Promise.all([
        monthlyRes.json(),
        categoryRes.json(),
        paymentRes.json(),
      ]);

      if (monthly.success) {
        const formatted = monthly.data.map((d) => ({
          name: `${MONTHS[d.month - 1]} ${d.year}`,
          income: d.income,
          expenses: d.expenses,
          savings: d.savings,
          savingsRate: parseFloat(d.savingsRate.toFixed(1)),
        }));
        setMonthlyData(formatted);
      }

      if (category.success) setCategoryData(category.data);
      if (payment.success) setPaymentData(payment.data);
    } catch (error) {
      console.error("Failed to fetch analytics data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
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
          <h1 className="text-3xl font-bold text-slate-900">Analytics</h1>
          <p className="text-slate-600 mt-1">A deeper look at your finances</p>
        </div>

        {/* Summary metric cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-slate-500 mb-1">Total Income</p>
              <p className="text-2xl font-bold text-slate-900">
                $
                {monthlyData.reduce((s, d) => s + d.income, 0).toLocaleString()}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-slate-500 mb-1">Total Expenses</p>
              <p className="text-2xl font-bold text-slate-900">
                $
                {monthlyData
                  .reduce((s, d) => s + d.expenses, 0)
                  .toLocaleString()}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-slate-500 mb-1">Total Savings</p>
              <p className="text-2xl font-bold text-slate-900">
                $
                {monthlyData
                  .reduce((s, d) => s + d.savings, 0)
                  .toLocaleString()}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Monthly Income vs Expenses */}
        <Card>
          <CardHeader>
            <CardTitle>Income vs Expenses</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e5e7eb",
                  }}
                  formatter={(value) => `$${value.toLocaleString()}`}
                />
                <Legend />
                <Bar
                  dataKey="income"
                  fill="#22c55e"
                  radius={[8, 8, 0, 0]}
                  name="Income"
                />
                <Bar
                  dataKey="expenses"
                  fill="#ef4444"
                  radius={[8, 8, 0, 0]}
                  name="Expenses"
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Savings Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Savings Trend</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e5e7eb",
                  }}
                  formatter={(value) => `$${value.toLocaleString()}`}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="savings"
                  stroke="#6366f1"
                  strokeWidth={2}
                  dot={{ fill: "#6366f1" }}
                  name="Savings"
                />
                <Line
                  type="monotone"
                  dataKey="savingsRate"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  dot={{ fill: "#f59e0b" }}
                  name="Savings Rate (%)"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-2">
          {/* Spending by Category */}
          <Card>
            <CardHeader>
              <CardTitle>Spending by Category</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    dataKey="total"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={({ category, percentage }) =>
                      `${category} ${percentage}%`
                    }
                  >
                    {categoryData.map((_, index) => (
                      <Cell
                        key={index}
                        fill={PIE_COLORS[index % PIE_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => `$${value.toLocaleString()}`}
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #e5e7eb",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              {/* Category list */}
              <div className="mt-4 space-y-2">
                {categoryData.map((item, index) => (
                  <div
                    key={item.category}
                    className="flex items-center justify-between text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded-full"
                        style={{
                          backgroundColor:
                            PIE_COLORS[index % PIE_COLORS.length],
                        }}
                      />
                      <span className="text-slate-700">{item.category}</span>
                    </div>
                    <div className="flex gap-4 text-slate-500">
                      <span>${item.total.toLocaleString()}</span>
                      <span>{item.percentage}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Payment Methods */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Methods</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={paymentData}
                    dataKey="total"
                    nameKey="paymentMethod"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    label={({ paymentMethod, percentage }) =>
                      `${paymentMethod} ${percentage}%`
                    }
                  >
                    {paymentData.map((_, index) => (
                      <Cell
                        key={index}
                        fill={PIE_COLORS[index % PIE_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value, name, props) => [
                      `$${value.toLocaleString()} (${props.payload.count} transactions)`,
                      name,
                    ]}
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #e5e7eb",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              {/* Payment method list */}
              <div className="mt-4 space-y-2">
                {paymentData.map((item, index) => (
                  <div
                    key={item.paymentMethod}
                    className="flex items-center justify-between text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded-full"
                        style={{
                          backgroundColor:
                            PIE_COLORS[index % PIE_COLORS.length],
                        }}
                      />
                      <span className="text-slate-700 capitalize">
                        {item.paymentMethod}
                      </span>
                    </div>
                    <div className="flex gap-4 text-slate-500">
                      <span>{item.count} transactions</span>
                      <span>${item.total.toLocaleString()}</span>
                      <span>{item.percentage}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <AIChat />
    </Layout>
  );
}

export { Analytics };
