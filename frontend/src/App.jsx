import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { Login } from "./pages/Login";
import { Signup } from "./pages/Signup";
import { Dashboard } from "./pages/Dashboard";
import { Settings } from "./pages/Settings";
import { Analytics } from "./pages/Analytics";
import { Transactions } from "./pages/Transactions";
import { Onboarding } from "./pages/Onboarding";
import { AuthProvider, useAuth } from "./context/AuthContext";

function AppRoutes() {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={!isAuthenticated ? <Login /> : <Navigate to="/" />}
      />
      <Route
        path="/signup"
        element={!isAuthenticated ? <Signup /> : <Navigate to="/" />}
      />
      <Route
        path="/onboarding"
        element={
          isAuthenticated && !user?.onboardingCompleted ? (
            <Onboarding />
          ) : (
            <Navigate to="/" />
          )
        }
      />
      <Route
        path="/"
        element={
          isAuthenticated ? (
            user?.onboardingCompleted ? (
              <Dashboard />
            ) : (
              <Navigate to="/onboarding" />
            )
          ) : (
            <Navigate to="/login" />
          )
        }
      />
      <Route
        path="/transactions"
        element={isAuthenticated ? <Transactions /> : <Navigate to="/login" />}
      />
      <Route
        path="/analytics"
        element={isAuthenticated ? <Analytics /> : <Navigate to="/login" />}
      />
      <Route
        path="/settings"
        element={isAuthenticated ? <Settings /> : <Navigate to="/login" />}
      />
    </Routes>
  );
}

function App() {
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
