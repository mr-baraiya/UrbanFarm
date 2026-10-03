import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { RiArrowLeftLine } from "react-icons/ri";
import { FaExclamationCircle } from "react-icons/fa";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { login } from "../services/authService";
import { useNotification } from "../hooks/useNotification";
import { validateLoginForm } from "../utils/validators";
import "./Auth.css";

const Login = () => {
  const { t } = useTranslation();
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

      authLogin(data.user, data.token);
      addNotification(t("auth.loginSuccess"), "success");

      if (data.user?.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/app");
      }
    } catch (error) {
      console.error("❌ Login error:", error);
      let errMsg = t("auth.invalidCredentials");

      if (error.response) {
        console.error("Response data:", error.response.data);
        const status = error.response.status;
        const backendMsg = error.response.data?.message;

        if (status === 401 || status === 404) {
          errMsg = backendMsg || t("auth.invalidCredentials");
        } else if (status === 403) {
          errMsg = backendMsg || "Account is suspended. Please contact system administrator.";
        } else if (status === 400) {
          errMsg = backendMsg || "Invalid login input.";
        } else {
          errMsg = backendMsg || t("auth.invalidCredentials");
        }
      } else if (error.request) {
        console.error("No response received");
        errMsg = t("messages.networkError");
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
          <RiArrowLeftLine /> {t("navigation.home")}
        </Link>
        <h2>{t("auth.loginTitle")}</h2>
        <p className="auth-subtitle">{t("auth.loginSubtitle")}</p>

        {authError && (
          <div className="auth-error-banner">
            <FaExclamationCircle />
            <span>{authError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label>{t("auth.email")}</label>
            <input
              type="email"
              value={email}
              onChange={handleEmailChange}
              placeholder={t("auth.emailPlaceholder")}
              className={errors.email ? "input-error" : ""}
            />
            {errors.email && (
              <span className="error-text">
                <FaExclamationCircle /> {errors.email}
              </span>
            )}
          </div>
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
              <label style={{ margin: 0 }}>{t("auth.password")}</label>
              <Link to="/forgot-password" style={{ fontSize: '0.85rem', color: 'var(--sage)', textDecoration: 'none', fontWeight: '500' }}>
                {t("auth.forgotPassword")}
              </Link>
            </div>
            <div className="password-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={handlePasswordChange}
                placeholder={t("auth.passwordPlaceholder")}
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
            {loading ? t("common.loading") : t("auth.loginButton")}
          </button>
        </form>
        <p className="auth-footer">
          {t("auth.dontHaveAccount")}{" "}
          <Link to="/register">{t("auth.registerButton")}</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
