import { useEffect, useState } from "react";
import { Layout } from "../components/Layout";
import { useAuth } from "../context/AuthContext";

import ProfileSection from "../components/settings/ProfileSection";
import SecuritySection from "../components/settings/SecuritySection";
import PreferencesSection from "../components/settings/PreferencesSection";
import NotificationSection from "../components/settings/NotificationSection";
import AccountSection from "../components/settings/AccountSection";

export function Settings() {
  const [settingsData, setSettingsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch("http://localhost:8000/api/settings", {
        credentials: "include",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (data.success) {
        setSettingsData(data.user);
      }
    } catch (err) {
      console.error("Failed to load settings:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64 text-slate-500">
          <div className="animate-pulse">Loading Settings...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto p-4 space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Settings</h1>
          <p className="text-slate-600 mt-1">
            Manage your account preferences and profile.
          </p>
        </div>

        <ProfileSection data={settingsData} onUpdate={setSettingsData} />

        {settingsData?.loginMethod === "email" && (
          <SecuritySection />
        )}

        <PreferencesSection data={settingsData} onUpdate={setSettingsData} />

        <NotificationSection data={settingsData} onUpdate={setSettingsData} />

        <AccountSection />
      </div>
    </Layout>
  );
}
