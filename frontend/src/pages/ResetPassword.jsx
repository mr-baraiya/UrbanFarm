import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { RiArrowLeftLine } from 'react-icons/ri';
import { FaExclamationCircle, FaLock, FaCheckCircle } from 'react-icons/fa';
import { resetPassword } from '../services/authService';
import { useNotification } from '../hooks/useNotification';
import { validateResetPasswordForm } from '../utils/validators';
import './Auth.css';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { addNotification } = useNotification();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { isValid, errors: formErrors } = validateResetPasswordForm({ password, confirmPassword });
    if (!isValid) {
      setErrors(formErrors);
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      const data = await resetPassword(token, password);
      addNotification(data.message || t('auth.passwordResetSuccess') || 'Password reset successfully!', 'success');
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 2500);
    } catch (err) {
      console.error('Reset password error:', err);
      const msg = err.response?.data?.message || t('messages.operationFailed') || 'Failed to reset password';
      setErrors({ form: msg });
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
        <h2>{t('auth.resetPasswordTitle') || 'Reset Your Password'}</h2>
        <p className="auth-subtitle">
          {t('auth.resetPasswordSubtitle') || 'Please enter and confirm your new password.'}
        </p>

        {success ? (
          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            <FaCheckCircle style={{ fontSize: '3rem', color: '#27ae60', marginBottom: '1rem' }} />
            <h3 style={{ color: 'var(--sage)', marginBottom: '0.5rem' }}>
              {t('auth.passwordUpdatedTitle') || 'Password Updated!'}
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              {t('auth.redirectingToLogin') || 'Your password has been reset successfully. Redirecting to sign in...'}
            </p>
            <Link to="/login" className="btn-primary" style={{ display: 'inline-block', textDecoration: 'none' }}>
              {t('auth.loginButton') || 'Sign In Now'}
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate>
            {errors.form && (
              <div style={{ marginBottom: '1rem', color: '#e74c3c', fontSize: '0.9rem', textAlign: 'center' }}>
                <FaExclamationCircle /> {errors.form}
              </div>
            )}
            <div className="form-group">
              <label>{t('auth.newPassword') || 'New Password'}</label>
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors((prev) => ({ ...prev, password: null }));
                }}
                placeholder={t('auth.passwordPlaceholder')}
                className={errors.password ? 'input-error' : ''}
              />
              {errors.password && (
                <span className="error-text">
                  <FaExclamationCircle /> {errors.password}
                </span>
              )}
            </div>

            <div className="form-group">
              <label>{t('auth.confirmPassword') || 'Confirm New Password'}</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: null }));
                }}
                placeholder={t('auth.passwordPlaceholder')}
                className={errors.confirmPassword ? 'input-error' : ''}
              />
              {errors.confirmPassword && (
                <span className="error-text">
                  <FaExclamationCircle /> {errors.confirmPassword}
                </span>
              )}
            </div>

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? (
                t('common.loading')
              ) : (
                <>
                  <FaLock style={{ marginRight: '0.5rem' }} />
                  {t('auth.resetPasswordBtn') || 'Set New Password'}
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
