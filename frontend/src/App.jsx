import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import GuestLayout from "./components/Guest/GuestLayout";
import LandingPage from "./pages/Guest/LandingPage";
import AboutPage from "./pages/Guest/AboutPage";
import FeaturesPage from "./pages/Guest/FeaturesPage";
import ContactPage from "./pages/Guest/ContactPage";
import FaqPage from "./pages/Guest/FaqPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import MainApp from "./pages/MainApp";
import AdminPanel from "./pages/AdminPanel";
import ProtectedRoute from "./components/Common/ProtectedRoute";
import AdminRoute from "./components/Common/AdminRoute";
import { useAuth } from "./hooks/useAuth";

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div
        className="loading-screen"
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          fontSize: "1.2rem",
          color: "var(--sage, #4a3f3a)",
        }}
      >
        Loading your urban farm...
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Guest Public Routes */}
        <Route element={<GuestLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/features" element={<FeaturesPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/faq" element={<FaqPage />} />
        </Route>

        {/* Auth Routes */}
        <Route
          path="/login"
          element={
            user ? (
              <Navigate
                to={user.role === "admin" ? "/admin" : "/app"}
                replace
              />
            ) : (
              <Login />
            )
          }
        />
        <Route
          path="/register"
          element={
            user ? (
              <Navigate
                to={user.role === "admin" ? "/admin" : "/app"}
                replace
              />
            ) : (
              <Register />
            )
          }
        />

        {/* User Routes */}
        <Route
          path="/app/*"
          element={
            <ProtectedRoute>
              {user?.role === "admin" ? (
                <Navigate to="/admin" replace />
              ) : (
                <MainApp />
              )}
            </ProtectedRoute>
          }
        />

        {/* Admin Routes */}
        <Route
          path="/admin/*"
          element={
            <AdminRoute>
              <AdminPanel />
            </AdminRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
