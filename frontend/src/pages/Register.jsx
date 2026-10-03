import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { RiArrowLeftLine } from "react-icons/ri";
import { FaExclamationCircle } from "react-icons/fa";
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
    gardeningLevel: "beginner",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
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
    setLoading(true);

    try {
      const data = await register(formData);
      login(data.user, data.token);
      addNotification(t("auth.registerSuccess"), "success");
      navigate("/app");
    } catch (error) {
      console.error("Registration error:", error);

      if (error.response) {
        const errorMessage = error.response.data?.message || t("messages.operationFailed");
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
        <h2>{t("auth.registerTitle")}</h2>
        <p className="auth-subtitle">{t("auth.registerSubtitle")}</p>
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
            <label>{t("auth.password")} *</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder={t("auth.passwordPlaceholder")}
              className={errors.password ? "input-error" : ""}
            />
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
