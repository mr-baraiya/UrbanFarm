import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { RiArrowLeftLine } from "react-icons/ri";
import { FaExclamationCircle } from "react-icons/fa";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { login } from "../services/authService";
import { useNotification } from "../hooks/useNotification";
import { validateLoginForm } from "../utils/validators";
import "./Auth.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [authError, setAuthError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login: authLogin } = useAuth();
  const { addNotification } = useNotification();
  const navigate = useNavigate();

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (errors.email) {
      setErrors((prev) => ({ ...prev, email: null }));
    }
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    if (errors.password) {
      setErrors((prev) => ({ ...prev, password: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { isValid, errors: formErrors } = validateLoginForm({ email, password });
    if (!isValid) {
      setErrors(formErrors);
      return;
    }

    setErrors({});
    setAuthError("");
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
      let errMsg = "Login failed. Please check your credentials.";

      if (error.response) {
        console.error("Response data:", error.response.data);
        const status = error.response.status;
        const backendMsg = error.response.data?.message;

        if (status === 401 || status === 404) {
          errMsg = backendMsg || "User not found or incorrect credentials. Please try again or register.";
        } else if (status === 403) {
          errMsg = backendMsg || "Account is suspended. Please contact system administrator.";
        } else if (status === 400) {
          errMsg = backendMsg || "Invalid login input.";
        } else {
          errMsg = backendMsg || "Login failed. Please try again.";
        }
      } else if (error.request) {
        console.error("No response received");
        errMsg = "Server not responding. Please check your internet connection.";
      } else {
        console.error("Error message:", error.message);
        errMsg = error.message || "An unexpected error occurred.";
      }

      setAuthError(errMsg);
      addNotification(errMsg, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <Link to="/" className="auth-back-home">
          <RiArrowLeftLine /> Back to Home
        </Link>
        <h2>Welcome back</h2>
        <p className="auth-subtitle">Sign in to manage your city garden.</p>

        {authError && (
          <div className="auth-error-banner">
            <FaExclamationCircle />
            <span>{authError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={handleEmailChange}
              placeholder="your@email.com"
              className={errors.email ? "input-error" : ""}
            />
            {errors.email && (
              <span className="error-text">
                <FaExclamationCircle /> {errors.email}
              </span>
            )}
          </div>
          <div className="form-group">
            <label>Password</label>
            <div className="password-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={handlePasswordChange}
                placeholder="Enter your password"
                className={errors.password ? "input-error" : ""}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && (
              <span className="error-text">
                <FaExclamationCircle /> {errors.password}
              </span>
            )}
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
