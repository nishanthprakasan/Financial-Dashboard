import { useState } from "react";
import { SlidersHorizontal } from "lucide-react";

export default function PreferencesSection({ data, onUpdate }) {
  const [form, setForm] = useState({
    currency: data?.currency,
    usagePurpose: data?.usagePurpose,
    monthlyIncome: data?.monthlyIncome,
    financialGoals: data?.financialGoals || [],
  });

  const [saving, setSaving] = useState(false);

  const GOALS = [
    "save_money",
    "track_spending",
    "budgeting",
    "debt_free",
    "investing",
    "retirement",
    "emergency_fund",
  ];

  const toggleGoal = (goal) => {
    setForm((prev) => ({
      ...prev,
      financialGoals: prev.financialGoals.includes(goal)
        ? prev.financialGoals.filter((g) => g !== goal)
        : [...prev.financialGoals, goal],
    }));
  };

  const savePreferences = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem("token");

      const res = await fetch(
        "https://financial-dashboard-ytrl.onrender.com/api/settings",
        {
          method: "PATCH",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(form),
        },
      );

      const result = await res.json();

      if (result.success) {
        onUpdate((prev) => ({ ...prev, ...form }));
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white shadow-sm hover:shadow-md transition-all border border-slate-200 rounded-2xl p-6 space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
          <SlidersHorizontal className="h-5 w-5 text-blue-600" />
          Preferences
        </h2>
        <p className="text-slate-600 text-sm mt-1">
          Customize your app preferences.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Currency */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Currency</label>
          <select
            className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
            value={form.currency}
            onChange={(e) => setForm({ ...form, currency: e.target.value })}
          >
            {[
              "USD",
              "EUR",
              "GBP",
              "INR",
              "CAD",
              "AUD",
              "JPY",
              "CNY",
              "SGD",
            ].map((currency) => (
              <option key={currency}>{currency}</option>
            ))}
          </select>
        </div>

        {/* Usage Purpose */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">
            Usage Purpose
          </label>
          <select
            className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
            value={form.usagePurpose}
            onChange={(e) => setForm({ ...form, usagePurpose: e.target.value })}
          >
            {[
              "personal",
              "business",
              "freelancer",
              "student",
              "family",
              "other",
            ].map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        </div>

        {/* Monthly Income */}
        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-medium text-slate-700">
            Monthly Income
          </label>
          <input
            type="number"
            className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
            value={form.monthlyIncome}
            onChange={(e) =>
              setForm({ ...form, monthlyIncome: e.target.value })
            }
          />
        </div>
      </div>

      {/* Goals */}
      <div>
        <label className="text-sm font-medium text-slate-700">
          Financial Goals
        </label>
        <div className="flex flex-wrap gap-2 mt-2">
          {GOALS.map((goal) => {
            const active = form.financialGoals.includes(goal);
            return (
              <button
                key={goal}
                onClick={() => toggleGoal(goal)}
                className={`px-3 py-1 rounded-full text-sm border transition ${
                  active
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-slate-700 border-slate-300 hover:bg-slate-100"
                }`}
              >
                {goal.replaceAll("_", " ")}
              </button>
            );
          })}
        </div>
      </div>

      <button
        onClick={savePreferences}
        className="bg-blue-600 text-white px-5 py-2 rounded-xl shadow hover:bg-blue-700 transition"
      >
        {saving ? "Saving..." : "Save Preferences"}
      </button>
    </div>
  );
}
