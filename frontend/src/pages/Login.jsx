import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { login } from "../services/authService";
import { useNotification } from "../hooks/useNotification";
import "./Auth.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login: authLogin } = useAuth();
  const { addNotification } = useNotification();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await login({ email, password });

      // ✅ Log the response for debugging
      console.log("🔐 Login response:", data);
      console.log("👤 User data:", data.user);
      console.log("👑 User role:", data.user?.role);

      // Store user in context
      authLogin(data.user, data.token);
      addNotification("Welcome back.", "success");

      // ✅ Check role and redirect
      if (data.user?.role === "admin") {
        console.log("🔐 Redirecting to admin panel...");
        navigate("/admin");
      } else {
        console.log("🔐 Redirecting to user dashboard...");
        navigate("/app");
      }
    } catch (error) {
      console.error("❌ Login error:", error);

      if (error.response) {
        console.error("Response data:", error.response.data);
        const errorMessage = error.response.data?.message || "Login failed";
        addNotification(errorMessage, "error");
      } else if (error.request) {
        console.error("No response received");
        addNotification("Server not responding. Please try again.", "error");
      } else {
        console.error("Error message:", error.message);
        addNotification(error.message || "Login failed", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>Welcome back</h2>
        <p className="auth-subtitle">Sign in to manage your city garden.</p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
        <p className="auth-footer">
          Don't have an account? <Link to="/register">Register here</Link>
        </p>
        <div className="auth-hint">
          <small>Admin accounts open the admin panel automatically.</small>
        </div>
      </div>
    </div>
  );
};

export default Login;
