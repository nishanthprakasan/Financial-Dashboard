import { useState } from "react";
import { Lock } from "lucide-react";

export default function SecuritySection() {
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [saving, setSaving] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const updatePassword = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem("token");

      const res = await fetch("http://localhost:8000/api/settings/password", {
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
        setForm({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      }
    } catch (error) {
      console.error("Password update failed:", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white shadow-sm hover:shadow-md transition-all border border-slate-200 rounded-2xl p-6 space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
          <Lock className="h-5 w-5 text-blue-600" />
          Security
        </h2>
        <p className="text-slate-600 text-sm mt-1">Change your password.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Current Password</label>
          <input
            type="password"
            name="currentPassword"
            value={form.currentPassword}
            onChange={handleChange}
            className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
            placeholder="Enter current password"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">New Password</label>
          <input
            type="password"
            name="newPassword"
            value={form.newPassword}
            onChange={handleChange}
            className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
            placeholder="Enter new password"
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-medium text-slate-700">Confirm Password</label>
          <input
            type="password"
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={handleChange}
            className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
            placeholder="Confirm new password"
          />
        </div>
      </div>

      <button
        onClick={updatePassword}
        className="bg-blue-600 text-white px-5 py-2 rounded-xl shadow hover:bg-blue-700 transition"
      >
        {saving ? "Updating..." : "Update Password"}
      </button>
    </div>
  );
}
