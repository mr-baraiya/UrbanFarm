import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { RiArrowLeftLine } from "react-icons/ri";
import { FaExclamationCircle } from "react-icons/fa";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { register } from "../services/authService";
import { useNotification } from "../hooks/useNotification";
import { validateRegisterForm } from "../utils/validators";
import "./Auth.css";

const Register = () => {
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

    // Centralized form validation
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
      addNotification("Account created. Your garden is ready.", "success");
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
            errMsg = data.message || "Please check your input and try again.";
          }
        } else if (status === 500) {
          errMsg = "Server error. Please try again later.";
        } else {
          errMsg = data.message || "Registration failed. Please try again.";
        }
      } else if (error.request) {
        errMsg = "Cannot reach the server. Please check your connection.";
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
          <RiArrowLeftLine /> Back to Home
        </Link>
        <h2>Create an account</h2>
        <p className="auth-subtitle">Set up your city garden in a few steps.</p>

        {authError && (
          <div className="auth-error-banner">
            <FaExclamationCircle />
            <span>{authError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label>Full Name *</label>
            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Vishal Sharma"
              className={errors.name ? "input-error" : ""}
            />
            {errors.name && (
              <span className="error-text">
                <FaExclamationCircle /> {errors.name}
              </span>
            )}
          </div>
          <div className="form-group">
            <label>Email *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
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
            <label>City *</label>
            <input
              name="city"
              value={formData.city}
              onChange={handleChange}
              placeholder="e.g., Mumbai, New York"
              className={errors.city ? "input-error" : ""}
            />
            {errors.city && (
              <span className="error-text">
                <FaExclamationCircle /> {errors.city}
              </span>
            )}
          </div>
          <div className="form-group">
            <label>Password (min 6 characters) *</label>
            <div className="password-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Choose a password"
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
            <label>Gardening Level</label>
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
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>
        <p className="auth-footer">
          Already have an account? <Link to="/login">Login here</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
