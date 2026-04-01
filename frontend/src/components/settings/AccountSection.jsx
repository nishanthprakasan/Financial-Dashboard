import { useAuth } from "../../context/AuthContext";
import { AlertTriangle, ShieldCheck } from "lucide-react";

export default function AccountSection() {
  const { logout, user } = useAuth();

  const deleteAccount = async () => {
    if (!confirm("Are you sure? This cannot be undone.")) return;

    try {
      const token = localStorage.getItem("token");

      await fetch("http://localhost:8000/api/settings/delete", {
        method: "DELETE",
        credentials: "include",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      logout();
      window.location.href = "/login";
    } catch (err) {
      console.error("Account deletion error:", err);
    }
  };

  return (
    <div className="bg-white shadow-sm hover:shadow-md transition-all border border-slate-200 rounded-2xl p-6 space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-blue-600" />
          Account
        </h2>
        <p className="text-slate-600 text-sm mt-1">
          View account status or deactivate your account.
        </p>
      </div>

      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
        <p className="text-slate-700">
          Email Verified:{" "}
          <span className={user.emailVerified ? "text-green-600" : "text-red-600 font-medium"}>
            {user.emailVerified ? "Yes" : "No"}
          </span>
        </p>
      </div>

      <button
        onClick={deleteAccount}
        className="bg-red-600 text-white px-5 py-2 rounded-xl shadow hover:bg-red-700 flex items-center gap-2 transition"
      >
        <AlertTriangle className="h-5 w-5" />
        Deactivate Account
      </button>
    </div>
  );
}
