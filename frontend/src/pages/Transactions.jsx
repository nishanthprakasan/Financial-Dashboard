import { Layout } from "../components/Layout";
import { useEffect, useState } from "react";
import {
  Plus,
  Search,
  Download,
  Edit,
  Trash2,
  Calendar,
  ArrowUpCircle,
  ArrowDownCircle,
} from "lucide-react";

export function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [dateRange, setDateRange] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [newTransaction, setNewTransaction] = useState({
    description: "",
    amount: "",
    category: "",
    type: "expense",
    date: new Date().toISOString().split("T")[0],
    paymentMethod: "card",
  });

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/transactions", {
        credentials: "include",
      });
      const data = await response.json();
      if (data.success) {
        setTransactions(data.transactions);
      } else {
        alert("Failed to fetch transactions");
      }
    } catch (error) {
      console.error("Transaction error:", error);
      alert("Cannot fetch transactions. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddTransaction = async (transactionData) => {
    try {
      const response = await fetch("http://localhost:8000/api/transactions", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(transactionData),
      });
      const data = await response.json();
      if (data.success) {
        await fetchTransactions();
        setShowAddModal(false);
        setNewTransaction({
          description: "",
          amount: "",
          category: "",
          type: "expense",
          date: new Date().toISOString().split("T")[0],
          paymentMethod: "card",
        });
      } else {
        alert("Failed to add transaction");
      }
    } catch (error) {
      console.error("Adding transaction error:", error);
      alert("Cannot add transaction. Please try again.");
    }
  };

  const handleDeleteTransaction = async (id) => {
    try {
      const response = await fetch(
        `http://localhost:8000/api/transactions/${id}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );
      const data = await response.json();
      if (data.success) {
        await fetchTransactions();
      } else {
        alert("Failed to delete transaction");
      }
    } catch (error) {
      console.error("Deleting transaction error:", error);
      alert("Cannot delete transaction. Please try again.");
    }
  };

  const handleEditClick = (transaction) => {
    setEditingTransaction({ ...transaction });
    setShowEditModal(true);
  };

  const handleEditTransaction = async (id, updates) => {
    try {
      const response = await fetch(
        `http://localhost:8000/api/transactions/${id}`,
        {
          method: "PATCH",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updates),
        }
      );
      const data = await response.json();
      if (data.success) {
        await fetchTransactions();
        setShowEditModal(false);
        setEditingTransaction(null);
      } else {
        alert("Failed to edit transaction");
      }
    } catch (error) {
      console.error("Editing transaction error:", error);
      alert("Cannot edit transaction. Please try again.");
    }
  };

  const handleExport = (format = "csv") => {
    try {
      let content, mimeType, filename;
      const date = new Date().toISOString().split("T")[0];

      if (format === "csv") {
        const headers = [
          "Date",
          "Description",
          "Category",
          "Amount",
          "Type",
          "Status",
        ];
        const csvRows = filteredTransactions.map((t) => [
          new Date(t.date).toLocaleDateString(),
          `"${t.description.replace(/"/g, '""')}"`,
          t.category,
          Math.abs(t.amount).toFixed(2),
          t.type,
          t.status,
        ]);

        content = [
          headers.join(","),
          ...csvRows.map((row) => row.join(",")),
        ].join("\n");
        mimeType = "text/csv";
        filename = `transactions-${date}.csv`;
      } else {
        const exportData = filteredTransactions.map((transaction) => {
          const { userId, __v, ...cleanTransaction } = transaction;
          return cleanTransaction;
        });

        content = JSON.stringify(exportData, null, 2);
        mimeType = "application/json";
        filename = `transactions-${date}.json`;
      }

      const blob = new Blob([content], { type: mimeType });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export error:", error);
      alert("Failed to export transactions. Please try again.");
    }
  };

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch =
      transaction.description
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      transaction.amount.toString().includes(searchTerm);
    const matchesCategory =
      selectedCategory === "all" || transaction.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const totalIncome = filteredTransactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = filteredTransactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const netFlow = totalIncome - totalExpenses;

  return (
    <>
      <Layout>
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header Section */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                Transactions
              </h1>
              <p className="text-slate-600 mt-1">
                Manage your income and expenses
              </p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
              Add Transaction
            </button>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-6 rounded-lg border border-slate-200">
              <div className="flex items-center gap-3">
                <ArrowUpCircle className="h-8 w-8 text-green-500" />
                <div>
                  <p className="text-sm text-slate-600">Total Income</p>
                  <p className="text-2xl font-bold text-slate-900">
                    ${totalIncome.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border border-slate-200">
              <div className="flex items-center gap-3">
                <ArrowDownCircle className="h-8 w-8 text-red-500" />
                <div>
                  <p className="text-sm text-slate-600">Total Expenses</p>
                  <p className="text-2xl font-bold text-slate-900">
                    ${totalExpenses.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border border-slate-200">
              <div className="flex items-center gap-3">
                <div
                  className={`h-8 w-8 rounded-full flex items-center justify-center ${
                    netFlow >= 0 ? "bg-green-100" : "bg-red-100"
                  }`}
                >
                  <span
                    className={`text-sm font-bold ${
                      netFlow >= 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {netFlow >= 0 ? "+" : ""}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Net Flow</p>
                  <p
                    className={`text-2xl font-bold ${
                      netFlow >= 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    ${netFlow.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Filters and Search Section */}
          <div className="bg-white p-6 rounded-lg border border-slate-200">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search transactions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Categories</option>
                <option value="Food & Dining">Food & Dining</option>
                <option value="Transportation">Transportation</option>
                <option value="Shopping">Shopping</option>
                <option value="Entertainment">Entertainment</option>
                <option value="Bills & Utilities">Bills & Utilities</option>
                <option value="Income">Income</option>
                <option value="Other">Other</option>
              </select>

              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>

              {/* Export Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowExportMenu(!showExportMenu)}
                  className="px-4 py-2 border border-slate-300 rounded-lg flex items-center gap-2 hover:bg-slate-50"
                >
                  <Download className="h-4 w-4" />
                  Export
                </button>

                {showExportMenu && (
                  <div className="absolute top-full right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-10 min-w-32">
                    <button
                      onClick={() => {
                        handleExport("csv");
                        setShowExportMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-slate-50 text-sm border-b border-slate-100"
                    >
                      Export as CSV
                    </button>
                    <button
                      onClick={() => {
                        handleExport("json");
                        setShowExportMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-slate-50 text-sm"
                    >
                      Export as JSON
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Transactions Table */}
          <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredTransactions.map((transaction) => (
                    <tr key={transaction._id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                        {new Date(transaction.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-900">
                        {transaction.description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {transaction.category}
                        </span>
                      </td>
                      <td
                        className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                          transaction.type === "income"
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {transaction.type === "income" ? "+" : "-"}$
                        {Math.abs(transaction.amount).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            transaction.status === "completed"
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {transaction.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEditClick(transaction)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() =>
                              handleDeleteTransaction(transaction._id)
                            }
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredTransactions.length === 0 && (
              <div className="text-center py-12">
                <div className="text-slate-400 mb-4">
                  <Calendar className="h-12 w-12 mx-auto" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  No transactions found
                </h3>
                <p className="text-slate-600 mb-4">
                  {transactions.length === 0
                    ? "Get started by adding your first transaction"
                    : "No transactions match your current filters"}
                </p>
                {transactions.length === 0 && (
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                  >
                    Add First Transaction
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </Layout>

      {/* Add Transaction Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">Add Transaction</h2>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Description"
                  className="w-full p-3 border border-slate-300 rounded-lg"
                  value={newTransaction.description}
                  onChange={(e) =>
                    setNewTransaction((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                />
                <input
                  type="number"
                  step="0.01"
                  placeholder="Amount"
                  className="w-full p-3 border border-slate-300 rounded-lg"
                  value={newTransaction.amount}
                  onChange={(e) =>
                    setNewTransaction((prev) => ({
                      ...prev,
                      amount: parseFloat(e.target.value),
                    }))
                  }
                />
                <select
                  value={newTransaction.type}
                  onChange={(e) =>
                    setNewTransaction((prev) => ({
                      ...prev,
                      type: e.target.value,
                      category: "",
                    }))
                  }
                  className="w-full p-3 border border-slate-300 rounded-lg"
                >
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>
                {newTransaction.type === "expense" ? (
                  <select
                    value={newTransaction.category}
                    onChange={(e) =>
                      setNewTransaction((prev) => ({
                        ...prev,
                        category: e.target.value,
                      }))
                    }
                    className="w-full p-3 border border-slate-300 rounded-lg"
                  >
                    <option value="">Select Expense Category</option>
                    <option value="Food & Dining">Food & Dining</option>
                    <option value="Transportation">Transportation</option>
                    <option value="Shopping">Shopping</option>
                    <option value="Entertainment">Entertainment</option>
                    <option value="Bills & Utilities">Bills & Utilities</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Education">Education</option>
                    <option value="Other">Other</option>
                  </select>
                ) : (
                  <select
                    value={newTransaction.category}
                    onChange={(e) =>
                      setNewTransaction((prev) => ({
                        ...prev,
                        category: e.target.value,
                      }))
                    }
                    className="w-full p-3 border border-slate-300 rounded-lg"
                  >
                    <option value="">Select Income Source</option>
                    <option value="Salary">Salary</option>
                    <option value="Freelance">Freelance</option>
                    <option value="Business">Business</option>
                    <option value="Investment">Investment</option>
                    <option value="Rental">Rental Income</option>
                    <option value="Bonus">Bonus</option>
                    <option value="Other Income">Other Income</option>
                  </select>
                )}
                <input
                  type="date"
                  className="w-full p-3 border border-slate-300 rounded-lg"
                  value={newTransaction.date}
                  onChange={(e) =>
                    setNewTransaction((prev) => ({
                      ...prev,
                      date: e.target.value,
                    }))
                  }
                />
                <select
                  value={newTransaction.paymentMethod}
                  onChange={(e) =>
                    setNewTransaction((prev) => ({
                      ...prev,
                      paymentMethod: e.target.value,
                    }))
                  }
                  className="w-full p-3 border border-slate-300 rounded-lg"
                >
                  <option value="cash">Cash</option>
                  <option value="card">Card</option>
                  <option value="bank transfer">Bank Transfer</option>
                  <option value="digital wallet">Digital Wallet</option>
                </select>
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 px-4 py-3 border border-slate-300 rounded-lg hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleAddTransaction(newTransaction)}
                    className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Add Transaction
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Transaction Modal */}
      {showEditModal && editingTransaction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">Edit Transaction</h2>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Description"
                  className="w-full p-3 border border-slate-300 rounded-lg"
                  value={editingTransaction.description}
                  onChange={(e) =>
                    setEditingTransaction((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                />
                <input
                  type="number"
                  step="0.01"
                  placeholder="Amount"
                  className="w-full p-3 border border-slate-300 rounded-lg"
                  value={editingTransaction.amount}
                  onChange={(e) =>
                    setEditingTransaction((prev) => ({
                      ...prev,
                      amount: parseFloat(e.target.value),
                    }))
                  }
                />
                <select
                  value={editingTransaction.type}
                  onChange={(e) =>
                    setEditingTransaction((prev) => ({
                      ...prev,
                      type: e.target.value,
                    }))
                  }
                  className="w-full p-3 border border-slate-300 rounded-lg"
                >
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>
                {editingTransaction.type === "expense" ? (
                  <select
                    value={editingTransaction.category}
                    onChange={(e) =>
                      setEditingTransaction((prev) => ({
                        ...prev,
                        category: e.target.value,
                      }))
                    }
                    className="w-full p-3 border border-slate-300 rounded-lg"
                  >
                    <option value="">Select Expense Category</option>
                    <option value="Food & Dining">Food & Dining</option>
                    <option value="Transportation">Transportation</option>
                    <option value="Shopping">Shopping</option>
                    <option value="Entertainment">Entertainment</option>
                    <option value="Bills & Utilities">Bills & Utilities</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Education">Education</option>
                    <option value="Other">Other</option>
                  </select>
                ) : (
                  <select
                    value={editingTransaction.category}
                    onChange={(e) =>
                      setEditingTransaction((prev) => ({
                        ...prev,
                        category: e.target.value,
                      }))
                    }
                    className="w-full p-3 border border-slate-300 rounded-lg"
                  >
                    <option value="">Select Income Source</option>
                    <option value="Salary">Salary</option>
                    <option value="Freelance">Freelance</option>
                    <option value="Business">Business</option>
                    <option value="Investment">Investment</option>
                    <option value="Rental">Rental Income</option>
                    <option value="Bonus">Bonus</option>
                    <option value="Other Income">Other Income</option>
                  </select>
                )}
                <input
                  type="date"
                  className="w-full p-3 border border-slate-300 rounded-lg"
                  value={editingTransaction.date.split("T")[0]}
                  onChange={(e) =>
                    setEditingTransaction((prev) => ({
                      ...prev,
                      date: e.target.value,
                    }))
                  }
                />
                <select
                  value={editingTransaction.paymentMethod}
                  onChange={(e) =>
                    setEditingTransaction((prev) => ({
                      ...prev,
                      paymentMethod: e.target.value,
                    }))
                  }
                  className="w-full p-3 border border-slate-300 rounded-lg"
                >
                  <option value="cash">Cash</option>
                  <option value="card">Card</option>
                  <option value="bank transfer">Bank Transfer</option>
                  <option value="digital wallet">Digital Wallet</option>
                </select>
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => {
                      setShowEditModal(false);
                      setEditingTransaction(null);
                    }}
                    className="flex-1 px-4 py-3 border border-slate-300 rounded-lg hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() =>
                      handleEditTransaction(editingTransaction._id, {
                        description: editingTransaction.description,
                        amount: editingTransaction.amount,
                        category: editingTransaction.category,
                        type: editingTransaction.type,
                        date: editingTransaction.date,
                        paymentMethod: editingTransaction.paymentMethod,
                      })
                    }
                    className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Update Transaction
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
