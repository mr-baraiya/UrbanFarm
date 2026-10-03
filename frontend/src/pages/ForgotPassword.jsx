import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { RiArrowLeftLine } from 'react-icons/ri';
import { FaExclamationCircle, FaCheckCircle, FaPaperPlane } from 'react-icons/fa';
import { forgotPassword } from '../services/authService';
import { useNotification } from '../hooks/useNotification';
import { validateForgotPasswordForm } from '../utils/validators';
import './Auth.css';

const ForgotPassword = () => {
  const { t } = useTranslation();
  const { addNotification } = useNotification();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { isValid, firstError } = validateForgotPasswordForm({ email });
    if (!isValid) {
      setError(firstError);
      return;
    }

    setError('');
    setLoading(true);

    try {
      const data = await forgotPassword(email);
      addNotification(data.message || t('auth.resetEmailSent') || 'Reset link sent to your email', 'success');
      setSubmitted(true);
    } catch (err) {
      console.error('Forgot password error:', err);
      const msg = err.response?.data?.message || t('messages.operationFailed') || 'Failed to send reset email';
      setError(msg);
      addNotification(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <Link to="/login" className="auth-back-home">
          <RiArrowLeftLine /> {t('auth.loginButton') || 'Back to Sign In'}
        </Link>
        <h2>{t('auth.forgotPasswordTitle') || 'Forgot Password?'}</h2>
        <p className="auth-subtitle">
          {t('auth.forgotPasswordSubtitle') || 'Enter your email address to receive a password reset link.'}
        </p>

        {submitted ? (
          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            <FaCheckCircle style={{ fontSize: '3rem', color: '#27ae60', marginBottom: '1rem' }} />
            <h3 style={{ color: 'var(--sage)', marginBottom: '0.5rem' }}>
              {t('auth.checkYourEmail') || 'Check Your Email'}
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              {t('auth.resetEmailSentDesc') || `We have sent a password reset link to ${email}. Please check your inbox.`}
            </p>
            <Link to="/login" className="btn-primary" style={{ display: 'inline-block', textDecoration: 'none' }}>
              {t('auth.backToLogin') || 'Return to Sign In'}
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label>{t('auth.email')}</label>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError('');
                }}
                placeholder={t('auth.emailPlaceholder')}
                className={error ? 'input-error' : ''}
              />
              {error && (
                <span className="error-text">
                  <FaExclamationCircle /> {error}
                </span>
              )}
            </div>

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? (
                t('common.loading')
              ) : (
                <>
                  <FaPaperPlane style={{ marginRight: '0.5rem' }} />
                  {t('auth.sendResetLinkBtn') || 'Send Reset Link'}
                </>
              )}
            </button>
          </form>
        )}

        <p className="auth-footer">
          {t('auth.rememberPassword') || 'Remembered your password?'}{' '}
          <Link to="/login">{t('auth.loginButton')}</Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
