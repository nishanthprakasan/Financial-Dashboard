import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  User,
  Briefcase,
  GraduationCap,
  Users,
  Home,
  DollarSign,
  Target,
  Bell,
} from "lucide-react";

export function Onboarding() {
  const { user, updateProfile } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    avatar: "",
    usagePurpose: "personal",
    currency: "USD",
    financialGoals: [],
    monthlyIncome: "",
    notificationPreferences: {
      email: true,
      push: true,
      weeklyReports: true,
      budgetAlerts: true,
    },
  });

  const usageOptions = [
    {
      value: "personal",
      label: "Personal Finance",
      icon: Home,
      description: "Manage personal expenses and savings",
    },
    {
      value: "business",
      label: "Business",
      icon: Briefcase,
      description: "Track business income and expenses",
    },
    {
      value: "freelancer",
      label: "Freelancer",
      icon: User,
      description: "Manage project-based income and taxes",
    },
    {
      value: "student",
      label: "Student",
      icon: GraduationCap,
      description: "Track student budget and expenses",
    },
    {
      value: "family",
      label: "Family Budget",
      icon: Users,
      description: "Manage household finances",
    },
  ];

  const currencyOptions = [
    { value: "USD", label: "US Dollar ($)", symbol: "$" },
    { value: "EUR", label: "Euro (€)", symbol: "€" },
    { value: "GBP", label: "British Pound (£)", symbol: "£" },
    { value: "INR", label: "Indian Rupee (₹)", symbol: "₹" },
    { value: "CAD", label: "Canadian Dollar (C$)", symbol: "C$" },
    { value: "AUD", label: "Australian Dollar (A$)", symbol: "A$" },
    { value: "JPY", label: "Japanese Yen (¥)", symbol: "¥" },
    { value: "CNY", label: "Chinese Yuan (¥)", symbol: "¥" },
    { value: "SGD", label: "Singapore Dollar (S$)", symbol: "S$" },
  ];

  const goalOptions = [
    { value: "save_money", label: "Save Money" },
    { value: "track_spending", label: "Track Spending" },
    { value: "budgeting", label: "Budgeting" },
    { value: "debt_free", label: "Become Debt Free" },
    { value: "investing", label: "Start Investing" },
    { value: "retirement", label: "Plan for Retirement" },
    { value: "emergency_fund", label: "Build Emergency Fund" },
  ];

  const handleGoalToggle = (goal) => {
    setFormData((prev) => ({
      ...prev,
      financialGoals: prev.financialGoals.includes(goal)
        ? prev.financialGoals.filter((g) => g !== goal)
        : [...prev.financialGoals, goal],
    }));
  };

  const handleSubmit = async () => {
    try {
      const response = await fetch(
        "http://localhost:8000/api/auth/complete-onboarding",
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...formData,
            monthlyIncome: parseFloat(formData.monthlyIncome) || 0,
          }),
        }
      );

      const data = await response.json();
      if (data.success) {
        updateProfile(data.user);
        updateProfile({
          ...data.user,
          onboardingCompleted: true,
        });
        window.location.href = "/";
      }
    } catch (error) {
      console.error("Onboarding error:", error);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-slate-900">
                Welcome to FinanceApp! 🎉
              </h2>
              <p className="text-slate-600 mt-2">
                Let's personalize your experience
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-4">
                How do you plan to use FinanceApp?
              </label>
              <div className="grid gap-3">
                {usageOptions.map((option) => {
                  const Icon = option.icon;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          usagePurpose: option.value,
                        }))
                      }
                      className={`p-4 text-left rounded-lg border-2 transition-all ${
                        formData.usagePurpose === option.value
                          ? "border-blue-500 bg-blue-50"
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="h-5 w-5 text-slate-600" />
                        <div>
                          <div className="font-medium text-slate-900">
                            {option.label}
                          </div>
                          <div className="text-sm text-slate-600">
                            {option.description}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-slate-900">
                Set Your Financial Goals
              </h2>
              <p className="text-slate-600 mt-2">
                What would you like to achieve?
              </p>
            </div>

            <div className="grid gap-3">
              {goalOptions.map((goal) => (
                <button
                  key={goal.value}
                  type="button"
                  onClick={() => handleGoalToggle(goal.value)}
                  className={`p-4 text-left rounded-lg border-2 transition-all ${
                    formData.financialGoals.includes(goal.value)
                      ? "border-green-500 bg-green-50"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-slate-900">
                      {goal.label}
                    </span>
                    <Target
                      className={`h-4 w-4 ${
                        formData.financialGoals.includes(goal.value)
                          ? "text-green-600"
                          : "text-slate-400"
                      }`}
                    />
                  </div>
                </button>
              ))}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-slate-900">
                Financial Setup
              </h2>
              <p className="text-slate-600 mt-2">
                Help us understand your financial situation
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Primary Currency
              </label>
              <select
                value={formData.currency}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, currency: e.target.value }))
                }
                className="w-full p-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {currencyOptions.map((currency) => (
                  <option key={currency.value} value={currency.value}>
                    {currency.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Monthly Income (optional)
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="number"
                  value={formData.monthlyIncome}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      monthlyIncome: e.target.value,
                    }))
                  }
                  placeholder="0.00"
                  className="w-full pl-10 p-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-slate-900">
                Notification Preferences
              </h2>
              <p className="text-slate-600 mt-2">
                Choose how you'd like to stay updated
              </p>
            </div>

            <div className="space-y-4">
              {Object.entries(formData.notificationPreferences).map(
                ([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-slate-900 capitalize">
                        {key
                          .replace(/([A-Z])/g, " $1")
                          .replace(/^./, (str) => str.toUpperCase())}
                      </div>
                      <div className="text-sm text-slate-600">
                        {key === "email" && "Receive email notifications"}
                        {key === "push" && "Browser push notifications"}
                        {key === "weeklyReports" && "Weekly financial reports"}
                        {key === "budgetAlerts" && "Budget limit alerts"}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          notificationPreferences: {
                            ...prev.notificationPreferences,
                            [key]: !value,
                          },
                        }))
                      }
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        value ? "bg-blue-600" : "bg-slate-200"
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          value ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>
                )
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-lg shadow-sm border p-6">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-slate-500 mb-2">
            <span>Step {currentStep} of 4</span>
            <span>{Math.round((currentStep / 4) * 100)}%</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / 4) * 100}%` }}
            />
          </div>
        </div>

        {renderStep()}

        <div className="flex justify-between mt-8">
          <button
            type="button"
            onClick={() => setCurrentStep((prev) => prev - 1)}
            disabled={currentStep === 1}
            className={`px-4 py-2 rounded-lg border ${
              currentStep === 1
                ? "text-slate-400 border-slate-200 cursor-not-allowed"
                : "text-slate-700 border-slate-300 hover:bg-slate-50"
            }`}
          >
            Back
          </button>

          {currentStep < 4 ? (
            <button
              type="button"
              onClick={() => setCurrentStep((prev) => prev + 1)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Continue
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Complete Setup
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
