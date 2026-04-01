import { useState } from "react";
import { Bell } from "lucide-react";

export default function NotificationSection({ data, onUpdate }) {
  const [prefs, setPrefs] = useState(data.notificationPreferences);
  const [saving, setSaving] = useState(false);

  const toggle = (key) => setPrefs((prev) => ({ ...prev, [key]: !prev[key] }));

  const saveNotif = async () => {
    setSaving(true);
    try {
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
          body: JSON.stringify({ notificationPreferences: prefs }),
        },
      );

      const result = await res.json();

      if (result.success) {
        onUpdate((prev) => ({ ...prev, notificationPreferences: prefs }));
      }
    } finally {
      setSaving(false);
    }
  };

  const items = [
    ["email", "Email Notifications"],
    ["push", "Push Notifications"],
    ["weeklyReports", "Weekly Reports"],
    ["budgetAlerts", "Budget Alerts"],
  ];

  return (
    <div className="bg-white shadow-sm hover:shadow-md transition-all border border-slate-200 rounded-2xl p-6 space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
          <Bell className="h-5 w-5 text-blue-600" />
          Notifications
        </h2>
        <p className="text-slate-600 text-sm mt-1">
          Manage alerts and updates.
        </p>
      </div>

      <div className="space-y-4">
        {items.map(([key, label]) => (
          <div key={key} className="flex items-center justify-between">
            <span className="text-slate-700">{label}</span>

            <button
              onClick={() => toggle(key)}
              className={`w-14 h-7 flex items-center rounded-full p-1 transition ${
                prefs[key] ? "bg-blue-600" : "bg-slate-300"
              }`}
            >
              <div
                className={`h-5 w-5 bg-white rounded-full shadow transition-all ${
                  prefs[key] ? "translate-x-7" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        ))}
      </div>

      <button
        onClick={saveNotif}
        className="bg-blue-600 text-white px-5 py-2 rounded-xl shadow hover:bg-blue-700 transition"
      >
        {saving ? "Saving..." : "Save Notification Settings"}
      </button>
    </div>
  );
}
