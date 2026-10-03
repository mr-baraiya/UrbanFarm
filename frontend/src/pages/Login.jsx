import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { RiArrowLeftLine } from "react-icons/ri";
import { FaExclamationCircle } from "react-icons/fa";
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
  const [loading, setLoading] = useState(false);
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
      if (error.response) {
        const errorMessage = error.response.data?.message || t("auth.invalidCredentials");
        addNotification(errorMessage, "error");
      } else {
        addNotification(t("messages.networkError"), "error");
      }
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
            <input
              type="password"
              value={password}
              onChange={handlePasswordChange}
              placeholder={t("auth.passwordPlaceholder")}
              className={errors.password ? "input-error" : ""}
            />
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
