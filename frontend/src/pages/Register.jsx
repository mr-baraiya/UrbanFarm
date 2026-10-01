import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { register } from "../services/authService";
import { useNotification } from "../hooks/useNotification";
import "./Auth.css";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    gardeningLevel: "beginner",
  });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { addNotification } = useNotification();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Validate password length
    if (formData.password.length < 6) {
      addNotification("Password must be at least 6 characters", "error");
      setLoading(false);
      return;
    }

    try {
      const data = await register(formData);
      login(data.user, data.token);
      addNotification("Account created. Your garden is ready.", "success");
      navigate("/app");
    } catch (error) {
      console.error("Registration error:", error);

      if (error.response) {
        const status = error.response.status;
        const data = error.response.data;

        if (status === 400) {
          if (data.message === "Email already registered") {
            addNotification(
              "This email is already registered. Please login or use a different email.",
              "error",
            );
          } else if (data.message.includes("Validation")) {
            addNotification(data.message, "error");
          } else {
            addNotification(
              data.message || "Please check your input and try again.",
              "error",
            );
          }
        } else if (status === 500) {
          addNotification("Server error. Please try again later.", "error");
        } else {
          addNotification(
            data.message || "Registration failed. Please try again.",
            "error",
          );
        }
      } else if (error.request) {
        addNotification(
          "Cannot reach the server. Please check your connection.",
          "error",
        );
      } else {
        addNotification(
          "An unexpected error occurred. Please try again.",
          "error",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>Create an account</h2>
        <p className="auth-subtitle">Set up your city garden in a few steps.</p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name *</label>
            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              minLength="2"
              placeholder="John Doe"
            />
          </div>
          <div className="form-group">
            <label>Email *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="your@email.com"
            />
          </div>
          <div className="form-group">
            <label>Password (min 6 characters) *</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength="6"
              placeholder="Choose a password"
            />
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
