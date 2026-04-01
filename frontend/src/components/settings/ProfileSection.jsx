import { useState } from "react";
import { User, Image, Wallet } from "lucide-react";

export default function ProfileSection({ data, onUpdate }) {
  const [form, setForm] = useState({
    name: data?.name || "",
    avatar: data?.avatar || "",
    usagePurpose: data?.usagePurpose || "personal",
    currency: data?.currency || "USD",
    monthlyIncome: data?.monthlyIncome || 0,
  });

  const [saving, setSaving] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const saveChanges = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem("token");

      const res = await fetch("http://localhost:8000/api/settings", {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

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
          <User className="h-5 w-5 text-blue-600" />
          Profile
        </h2>
        <p className="text-slate-600 text-sm mt-1">
          Update your personal details.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Name</label>
          <input
            className="w-full border border-slate-300 focus:ring-2 focus:ring-blue-500 rounded-lg p-2 transition"
            name="name"
            value={form.name}
            onChange={handleChange}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Avatar URL</label>
          <div className="flex gap-2">
            <input
              className="flex-1 border border-slate-300 focus:ring-2 focus:ring-blue-500 rounded-lg p-2 transition"
              name="avatar"
              value={form.avatar}
              onChange={handleChange}
            />
            {form.avatar && (
              <img
                src={form.avatar}
                className="w-10 h-10 rounded-full border shadow"
                alt="avatar"
              />
            )}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Currency</label>
          <select
            className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
            name="currency"
            value={form.currency}
            onChange={handleChange}
          >
            {["USD", "EUR", "GBP", "INR", "CAD", "AUD", "JPY", "CNY", "SGD"].map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Monthly Income</label>
          <input
            type="number"
            className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
            name="monthlyIncome"
            value={form.monthlyIncome}
            onChange={handleChange}
          />
        </div>
      </div>

      <button
        onClick={saveChanges}
        className="bg-blue-600 text-white px-5 py-2 rounded-xl shadow hover:bg-blue-700 transition flex items-center gap-2"
      >
        {saving ? "Saving..." : "Save Changes"}
      </button>
    </div>
  );
}
