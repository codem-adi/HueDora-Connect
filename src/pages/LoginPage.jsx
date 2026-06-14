import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DEMO_USERS, IS_DEMO_SERVER } from '../config/constants';
import { useAuth } from '../context/AuthContext';
import { trimString } from '../utils/trimInput';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function fillCredentials(demoUser) {
    setEmail(trimString(demoUser.email));
    setPassword(trimString(demoUser.password));
    setError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const trimmedEmail = trimString(email);
    const trimmedPassword = trimString(password);
    setEmail(trimmedEmail);
    setPassword(trimmedPassword);
    setLoading(true);
    setError('');
    try {
      await login(trimmedEmail, trimmedPassword);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <form className="login-card" onSubmit={handleSubmit}>
        <h1>Healthcare Camp Dashboard</h1>
        <p>Sign in to manage screening camps, approvals, and analytics.</p>

        {IS_DEMO_SERVER && (
          <div className="demo-login-block">
            <span className="demo-badge">Demo Server</span>
            <p className="demo-hint">Quick login — click a role to fill credentials:</p>
            <div className="demo-login-buttons">
              {DEMO_USERS.map((demoUser) => (
                <button
                  key={demoUser.email}
                  type="button"
                  className="btn btn-demo"
                  onClick={() => fillCredentials(demoUser)}
                >
                  {demoUser.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {error && <div className="error-banner">{error}</div>}
        <label>
          Email
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={(e) => setEmail(trimString(e.target.value))}
            type="email"
            required
          />
        </label>
        <label>
          Password
          <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required />
        </label>
        <button className="btn btn-primary" disabled={loading}>
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>
    </div>
  );
}
