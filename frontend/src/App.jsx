import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Home from "./pages/Home";
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
          color: "#4a3f3a",
        }}
      >
        Loading your garden...
      </div>
    );
  }

  console.log("👤 App - Current user:", user);
  console.log("👑 App - User role:", user?.role);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
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
      </Routes>
    </Router>
  );
}

export default App;
