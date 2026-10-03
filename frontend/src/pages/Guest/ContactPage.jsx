import React, { useState } from 'react';
import api from '../../services/api';
import { useNotification } from '../../hooks/useNotification';
import { validateContactForm } from '../../utils/validators';
import {
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaPaperPlane,
  FaClock,
  FaCheckCircle,
  FaExclamationCircle,
} from 'react-icons/fa';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './ContactPage.css';

const ContactPage = () => {
  const { addNotification } = useNotification();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'General Inquiry',
    message: '',
  });

  const [errors, setErrors] = useState({});

  const validate = () => {
    const { isValid, errors: formErrors } = validateContactForm(formData);
    setErrors(formErrors);
    return isValid;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updatedData = { ...formData, [name]: value };
    setFormData(updatedData);

    // Live validation check for instant error resolution as user types
    const { errors: newErrors } = validateContactForm(updatedData);
    setErrors((prev) => ({
      ...prev,
      [name]: newErrors[name] || null,
    }));
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    const { errors: newErrors } = validateContactForm(formData);
    if (newErrors[name]) {
      setErrors((prev) => ({ ...prev, [name]: newErrors[name] }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const res = await api.post('/contact', formData);
      toast.success(
        res.data?.message || 'Message sent successfully! Our team will contact you shortly.',
        {
          position: 'bottom-right',
          autoClose: 4000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          className: 'urban-toast-success',
        }
      );
      // Reset form state cleanly
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: 'General Inquiry',
        message: '',
      });
      setErrors({});
    } catch (error) {
      console.error('Contact submission error:', error);
      toast.error(
        error.response?.data?.message || 'Failed to send message. Please try again.',
        {
          position: 'bottom-right',
          autoClose: 4000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          className: 'urban-toast-error',
        }
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="contact-page">
      {/* Hero Header */}
      <section className="contact-hero">
        <div className="contact-container text-center">
          <span className="section-tag">GET IN TOUCH</span>
          <h1>We'd Love to Hear From You</h1>
          <p className="contact-hero-subtitle">
            Have questions about UrbanFarm features, enterprise partnerships, or urban gardening advice? Send us a message!
          </p>
        </div>
      </section>

      {/* Main Form & Info Section */}
      <section className="contact-content-section">
        <div className="contact-container contact-grid">
          {/* Left: Contact Info Card */}
          <div className="contact-info-card">
            <h2>Contact Information</h2>
            <p className="info-desc">
              Reach out via form or through our direct channels. Our agronomy support team typically responds within 24 hours.
            </p>

            <ul className="info-list">
              <li>
                <div className="info-icon"><FaEnvelope /></div>
                <div>
                  <strong>Email Us</strong>
                  <span>support@urbanfarm.io</span>
                </div>
              </li>
              <li>
                <div className="info-icon"><FaPhone /></div>
                <div>
                  <strong>Call Us</strong>
                  <span>+1 (800) 555-FARM (3276)</span>
                </div>
              </li>
              <li>
                <div className="info-icon"><FaMapMarkerAlt /></div>
                <div>
                  <strong>Headquarters</strong>
                  <span>100 AgriTech Plaza, Suite 400, Green City</span>
                </div>
              </li>
              <li>
                <div className="info-icon"><FaClock /></div>
                <div>
                  <strong>Operating Hours</strong>
                  <span>Monday – Friday: 9:00 AM – 6:00 PM EST</span>
                </div>
              </li>
            </ul>

            <div className="info-highlight-box">
              <FaCheckCircle style={{ color: '#27ae60', fontSize: '1.2rem', marginTop: '0.1rem' }} />
              <div>
                <strong>Active Support Guarantee</strong>
                <p style={{ margin: '0.2rem 0 0', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                  All guest submissions are tracked in our Admin Inquiry System for prompt follow-up.
                </p>
              </div>
            </div>
          </div>

          {/* Right: Contact Form */}
          <div className="contact-form-card">
            <h2>Send Us a Message</h2>
            <form onSubmit={handleSubmit} noValidate className="contact-form">
              <div className="form-group">
                <label>Full Name <span className="required">*</span></label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="e.g. Vishal Sharma"
                  className={errors.name ? 'input-error' : ''}
                />
                {errors.name && <span className="error-text"><FaExclamationCircle /> {errors.name}</span>}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Email Address <span className="required">*</span></label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="e.g. Vishal@example.com"
                    className={errors.email ? 'input-error' : ''}
                  />
                  {errors.email && <span className="error-text"><FaExclamationCircle /> {errors.email}</span>}
                </div>

                <div className="form-group">
                  <label>Phone Number (Optional)</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="e.g. +91 1234567890"
                    className={errors.phone ? 'input-error' : ''}
                  />
                  {errors.phone && <span className="error-text"><FaExclamationCircle /> {errors.phone}</span>}
                </div>
              </div>

              <div className="form-group">
                <label>Subject / Topic <span className="required">*</span></label>
                <select
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={errors.subject ? 'input-error' : ''}
                >
                  <option value="General Inquiry">General Inquiry</option>
                  <option value="AI Diagnosis Support">AI Diagnosis Support</option>
                  <option value="Weather Irrigation Query">Weather Irrigation Query</option>
                  <option value="Partnership & Enterprise">Partnership & Enterprise</option>
                  <option value="Report an Issue">Report an Issue</option>
                </select>
                {errors.subject && <span className="error-text"><FaExclamationCircle /> {errors.subject}</span>}
              </div>

              <div className="form-group">
                <label>Your Message <span className="required">*</span></label>
                <textarea
                  name="message"
                  rows="5"
                  value={formData.message}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="How can we help your urban farm?"
                  className={errors.message ? 'input-error' : ''}
                />
                {errors.message && <span className="error-text"><FaExclamationCircle /> {errors.message}</span>}
              </div>

              <button type="submit" className="landing-btn landing-btn-primary btn-full" disabled={loading}>
                {loading ? 'Sending Message...' : <><FaPaperPlane /> Send Message</>}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Toastify Notification Container */}
      <ToastContainer position="bottom-right" />
    </div>
  );
};

export default ContactPage;
