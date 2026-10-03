import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
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
import './ContactPage.css';

const ContactPage = () => {
  const { t } = useTranslation();
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
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: null });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const res = await api.post('/contact', formData);
      addNotification(
        res.data?.message || t('contact.successMsg'),
        'success'
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
      addNotification(
        error.response?.data?.message || t('messages.operationFailed'),
        'error'
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
          <span className="section-tag">{t('contact.tagHero')}</span>
          <h1>{t('contact.heroTitle')}</h1>
          <p className="contact-hero-subtitle">
            {t('contact.heroSubtitle')}
          </p>
        </div>
      </section>

      {/* Main Form & Info Section */}
      <section className="contact-content-section">
        <div className="contact-container contact-grid">
          {/* Left: Contact Info Card */}
          <div className="contact-info-card">
            <h2>{t('contact.infoTitle')}</h2>
            <p className="info-desc">
              {t('contact.infoDesc')}
            </p>

            <ul className="info-list">
              <li>
                <div className="info-icon"><FaEnvelope /></div>
                <div>
                  <strong>{t('contact.emailLabelTitle')}</strong>
                  <span>{t('contact.emailVal')}</span>
                </div>
              </li>
              <li>
                <div className="info-icon"><FaPhone /></div>
                <div>
                  <strong>{t('contact.phoneLabelTitle')}</strong>
                  <span>{t('contact.phoneVal')}</span>
                </div>
              </li>
              <li>
                <div className="info-icon"><FaMapMarkerAlt /></div>
                <div>
                  <strong>{t('contact.headquartersTitle')}</strong>
                  <span>{t('contact.headquartersVal')}</span>
                </div>
              </li>
              <li>
                <div className="info-icon"><FaClock /></div>
                <div>
                  <strong>{t('contact.hoursTitle')}</strong>
                  <span>{t('contact.hoursVal')}</span>
                </div>
              </li>
            </ul>

            <div className="info-highlight-box">
              <FaCheckCircle style={{ color: '#27ae60', fontSize: '1.2rem', marginTop: '0.1rem' }} />
              <div>
                <strong>{t('contact.guaranteeTitle')}</strong>
                <p style={{ margin: '0.2rem 0 0', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                  {t('contact.guaranteeDesc')}
                </p>
              </div>
            </div>
          </div>

          {/* Right: Contact Form */}
          <div className="contact-form-card">
            <h2>{t('contact.formTitle')}</h2>
            <form onSubmit={handleSubmit} noValidate className="contact-form">
              <div className="form-group">
                <label>{t('contact.nameLabel')} <span className="required">*</span></label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder={t('contact.namePlaceholder')}
                  className={errors.name ? 'input-error' : ''}
                />
                {errors.name && <span className="error-text"><FaExclamationCircle /> {errors.name}</span>}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>{t('contact.emailLabel')} <span className="required">*</span></label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder={t('contact.emailPlaceholder')}
                    className={errors.email ? 'input-error' : ''}
                  />
                  {errors.email && <span className="error-text"><FaExclamationCircle /> {errors.email}</span>}
                </div>

                <div className="form-group">
                  <label>{t('contact.phoneLabel')}</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder={t('contact.phonePlaceholder')}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>{t('contact.subjectLabel')} <span className="required">*</span></label>
                <select
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className={errors.subject ? 'input-error' : ''}
                >
                  <option value="General Inquiry">{t('contact.subjectOption1')}</option>
                  <option value="AI Diagnosis Support">{t('contact.subjectOption2')}</option>
                  <option value="Weather Irrigation Query">{t('contact.subjectOption3')}</option>
                  <option value="Partnership & Enterprise">{t('contact.subjectOption4')}</option>
                  <option value="Report an Issue">{t('contact.subjectOption5')}</option>
                </select>
                {errors.subject && <span className="error-text"><FaExclamationCircle /> {errors.subject}</span>}
              </div>

              <div className="form-group">
                <label>{t('contact.messageLabel')} <span className="required">*</span></label>
                <textarea
                  name="message"
                  rows="5"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder={t('contact.messagePlaceholder')}
                  className={errors.message ? 'input-error' : ''}
                />
                {errors.message && <span className="error-text"><FaExclamationCircle /> {errors.message}</span>}
              </div>

              <button type="submit" className="landing-btn landing-btn-primary btn-full" disabled={loading}>
                {loading ? t('contact.sendingMsg') : <><FaPaperPlane /> {t('contact.sendButton')}</>}
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactPage;
