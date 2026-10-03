import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { RiArrowLeftLine } from "react-icons/ri";
import { FaExclamationCircle } from "react-icons/fa";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { register } from "../services/authService";
import { useNotification } from "../hooks/useNotification";
import { validateRegisterForm } from "../utils/validators";
import "./Auth.css";

const Register = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    city: "",
    gardeningLevel: "beginner",
  });
  const [errors, setErrors] = useState({});
  const [authError, setAuthError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const { addNotification } = useNotification();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { isValid, errors: formErrors } = validateRegisterForm(formData);
    if (!isValid) {
      setErrors(formErrors);
      return;
    }

    setErrors({});
    setAuthError("");
    setLoading(true);

    try {
      const data = await register(formData);
      login(data.user, data.token);
      addNotification(t("auth.registerSuccess"), "success");
      navigate("/app");
    } catch (error) {
      console.error("Registration error:", error);
      let errMsg = "Registration failed. Please try again.";

      if (error.response) {
        const status = error.response.status;
        const data = error.response.data;

        if (status === 400) {
          if (data.message === "Email already registered") {
            setErrors((prev) => ({ ...prev, email: "This email is already registered." }));
            errMsg = "This email is already registered. Please login or use a different email.";
          } else {
            errMsg = data.message || t("messages.operationFailed");
          }
        } else if (status === 500) {
          errMsg = "Server error. Please try again later.";
        } else {
          errMsg = data.message || t("messages.operationFailed");
        }
      } else if (error.request) {
        errMsg = t("messages.networkError");
      } else {
        errMsg = error.message || "An unexpected error occurred. Please try again.";
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
        <h2>{t("auth.registerTitle")}</h2>
        <p className="auth-subtitle">{t("auth.registerSubtitle")}</p>

        {authError && (
          <div className="auth-error-banner">
            <FaExclamationCircle />
            <span>{authError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label>{t("auth.fullName")} *</label>
            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder={t("auth.namePlaceholder")}
              className={errors.name ? "input-error" : ""}
            />
            {errors.name && (
              <span className="error-text">
                <FaExclamationCircle /> {errors.name}
              </span>
            )}
          </div>
          <div className="form-group">
            <label>{t("auth.email")} *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
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
            <label>{t("auth.city")} *</label>
            <input
              name="city"
              value={formData.city}
              onChange={handleChange}
              placeholder={t("auth.cityPlaceholder") || "e.g., Mumbai, New York"}
              className={errors.city ? "input-error" : ""}
            />
            {errors.city && (
              <span className="error-text">
                <FaExclamationCircle /> {errors.city}
              </span>
            )}
          </div>
          <div className="form-group">
            <label>{t("auth.password")} (min 6 chars) *</label>
            <div className="password-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
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
          <div className="form-group">
            <label>{t("profile.gardenerLevel")}</label>
            <select
              name="gardeningLevel"
              value={formData.gardeningLevel}
              onChange={handleChange}
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? t("common.loading") : t("auth.registerButton")}
          </button>
        </form>
        <p className="auth-footer">
          {t("auth.alreadyHaveAccount")}{" "}
          <Link to="/login">{t("navigation.signIn")}</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
