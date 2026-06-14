import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../services/endpoints';
import { trimFormStrings, trimString } from '../utils/trimInput';
import { validateSignupForm } from '../utils/userFormValidation';
import { PasswordInput } from '../components/PasswordInput';

const emptyForm = {
  name: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
};

export default function SignupPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState(emptyForm);
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  function updateField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setFieldErrors((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const trimmed = trimFormStrings(form, ['name', 'email', 'phone', 'password', 'confirmPassword']);
    setForm(trimmed);

    const validation = validateSignupForm(trimmed);
    setFieldErrors(validation.errors);
    if (!validation.isValid) return;

    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const { data } = await authApi.signup({
        name: trimmed.name,
        email: trimString(trimmed.email).toLowerCase(),
        phone: trimmed.phone || undefined,
        password: trimmed.password,
        confirmPassword: trimmed.confirmPassword,
      });
      setSuccess(data.message || 'Signup submitted. An admin will review your request.');
      setForm(emptyForm);
    } catch (err) {
      const apiErrors = err.response?.data?.errors;
      if (apiErrors) setFieldErrors(apiErrors);
      setError(err.response?.data?.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <form className="login-card signup-card" onSubmit={handleSubmit}>
        <h1>Create Account</h1>
        <p>Request access to HueDora Connect. An admin will review and approve your account.</p>

        {(error || success) && (
          <div className="auth-alerts">
            {error && <div className="error-banner">{error}</div>}
            {success && <div className="success-banner">{success}</div>}
          </div>
        )}

        <label>
          Full Name
          <input
            value={form.name}
            onChange={(e) => updateField('name', e.target.value)}
            onBlur={(e) => updateField('name', trimString(e.target.value))}
            required
          />
          {fieldErrors.name && <span className="field-error">{fieldErrors.name}</span>}
        </label>

        <label>
          Email
          <input
            value={form.email}
            onChange={(e) => updateField('email', e.target.value)}
            onBlur={(e) => updateField('email', trimString(e.target.value))}
            type="email"
            required
          />
          {fieldErrors.email && <span className="field-error">{fieldErrors.email}</span>}
        </label>

        <label>
          Phone (optional)
          <input
            value={form.phone}
            onChange={(e) => updateField('phone', e.target.value)}
            onBlur={(e) => updateField('phone', trimString(e.target.value))}
            type="tel"
          />
          {fieldErrors.phone && <span className="field-error">{fieldErrors.phone}</span>}
        </label>

        <label>
          Password
          <PasswordInput
            value={form.password}
            onChange={(e) => updateField('password', e.target.value)}
            required
            autoComplete="new-password"
          />
          {fieldErrors.password && <span className="field-error">{fieldErrors.password}</span>}
        </label>

        <label>
          Confirm Password
          <PasswordInput
            value={form.confirmPassword}
            onChange={(e) => updateField('confirmPassword', e.target.value)}
            required
            autoComplete="new-password"
          />
          {fieldErrors.confirmPassword && <span className="field-error">{fieldErrors.confirmPassword}</span>}
        </label>

        <button className="btn btn-primary" disabled={loading}>
          {loading ? 'Submitting...' : 'Request Access'}
        </button>

        <p className="auth-switch-link">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </form>
    </div>
  );
}
