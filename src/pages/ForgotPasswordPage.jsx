import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authApi } from '../services/endpoints';
import { PasswordInput } from '../components/PasswordInput';
import { trimString } from '../utils/trimInput';
import { validateResetPasswordForm } from '../utils/userFormValidation';

export default function ForgotPasswordPage() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [expiresInMinutes, setExpiresInMinutes] = useState(10);

  function clearFieldError(field) {
    setFieldErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }

  async function handleRequestOtp(e) {
    e.preventDefault();
    const trimmedEmail = trimString(email).toLowerCase();
    setEmail(trimmedEmail);
    setError('');
    setSuccess('');

    if (!trimmedEmail) {
      setFieldErrors({ email: 'Email is required' });
      return;
    }

    setLoading(true);
    try {
      const { data } = await authApi.forgotPassword(trimmedEmail);
      setExpiresInMinutes(data.expiresInMinutes || 10);
      setSuccess(data.message || 'If an account exists for this email, a reset code has been sent.');
      setStep(2);
      setFieldErrors({});
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send reset code');
      if (err.response?.data?.errors) setFieldErrors(err.response.data.errors);
    } finally {
      setLoading(false);
    }
  }

  async function handleResendOtp() {
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const { data } = await authApi.forgotPassword(email);
      setExpiresInMinutes(data.expiresInMinutes || 10);
      setSuccess('A new reset code has been sent to your email.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend reset code');
    } finally {
      setLoading(false);
    }
  }

  async function handleResetPassword(e) {
    e.preventDefault();
    const form = {
      email: trimString(email).toLowerCase(),
      otp: trimString(otp),
      password,
      confirmPassword,
    };

    const validation = validateResetPasswordForm(form);
    setFieldErrors(validation.errors);
    if (!validation.isValid) return;

    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const { data } = await authApi.resetPassword(form);
      setSuccess(data.message || 'Password reset successful.');
      setStep(3);
    } catch (err) {
      if (err.response?.data?.errors) setFieldErrors(err.response.data.errors);
      setError(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-card signup-card">
        <h1>{step === 3 ? 'Password Updated' : 'Reset Password'}</h1>

        {step === 1 && (
          <p className="auth-step-intro">
            Enter your account email and we&apos;ll send you a one-time password (OTP).
          </p>
        )}

        {step === 2 && (
          <p className="auth-step-intro">
            Enter the 6-digit OTP sent to <strong>{email}</strong>. It expires in {expiresInMinutes} minutes.
          </p>
        )}

        {step !== 3 && (error || success) && (
          <div className="auth-alerts">
            {error && <div className="error-banner">{error}</div>}
            {success && <div className="success-banner">{success}</div>}
          </div>
        )}

        {step === 1 && (
          <form onSubmit={handleRequestOtp}>
            <label>
              Email
              <input
                value={email}
                onChange={(e) => { setEmail(e.target.value); clearFieldError('email'); }}
                onBlur={(e) => setEmail(trimString(e.target.value))}
                type="email"
                required
              />
              {fieldErrors.email && <span className="field-error">{fieldErrors.email}</span>}
            </label>
            <button className="btn btn-primary" disabled={loading}>
              {loading ? 'Sending...' : 'Send OTP'}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleResetPassword}>
            <label>
              OTP Code
              <input
                value={otp}
                onChange={(e) => { setOtp(e.target.value.replace(/\D/g, '').slice(0, 6)); clearFieldError('otp'); }}
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder="6-digit code"
                required
              />
              {fieldErrors.otp && <span className="field-error">{fieldErrors.otp}</span>}
            </label>

            <label>
              New Password
              <PasswordInput
                value={password}
                onChange={(e) => { setPassword(e.target.value); clearFieldError('password'); }}
                required
                autoComplete="new-password"
              />
              {fieldErrors.password && <span className="field-error">{fieldErrors.password}</span>}
            </label>

            <label>
              Confirm New Password
              <PasswordInput
                value={confirmPassword}
                onChange={(e) => { setConfirmPassword(e.target.value); clearFieldError('confirmPassword'); }}
                required
                autoComplete="new-password"
              />
              {fieldErrors.confirmPassword && <span className="field-error">{fieldErrors.confirmPassword}</span>}
            </label>

            <button className="btn btn-primary" disabled={loading}>
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>

            <div className="auth-inline-actions">
              <button type="button" className="btn btn-secondary btn-inline" onClick={() => setStep(1)} disabled={loading}>
                Change email
              </button>
              <button type="button" className="btn btn-secondary btn-inline" onClick={handleResendOtp} disabled={loading}>
                Resend OTP
              </button>
            </div>
          </form>
        )}

        {step === 3 && (
          <div className="auth-success-panel">
            <div className="success-banner">{success}</div>
            <p>You can now sign in with your new password.</p>
          </div>
        )}

        <p className="auth-switch-link">
          <Link to="/login">Back to sign in</Link>
        </p>
      </div>
    </div>
  );
}
