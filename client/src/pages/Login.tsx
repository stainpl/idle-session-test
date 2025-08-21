import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../index.css';

const API = import.meta.env.VITE_API_URL || 'http://localhost:4000';
const DEMO_EMAIL = 'demo@demo.com';
const DEMO_PASSWORD = 'demo';

export default function LoginModern() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [pwVisible, setPwVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function validate() {
    if (!email.trim()) return 'Email is required';
    if (!/\S+@\S+\.\S+/.test(email)) return 'Invalid email address';
    if (!password) return 'Password is required';
    if (password.length < 4) return 'Password must be at least 4 characters';
    return '';
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e?.preventDefault();
    setError('');
    const v = validate();
    if (v) return setError(v);

    setLoading(true);
    try {
      const res = await fetch(`${API}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || 'Login failed');
        setLoading(false);
        return;
      }
      localStorage.setItem('id_token', data.token);
      localStorage.setItem('user_email', data.user.email);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      console.error(err);
      setError('Network error');
    } finally {
      setLoading(false);
    }
  }

  async function handleUseDemo() {
    setEmail(DEMO_EMAIL);
    setPassword(DEMO_PASSWORD);
  }


  return (
    <div className="lm-root">
      <div className="lm-shell">
        <aside className="lm-left" aria-hidden>
          <div className="lm-brand">
            <div className="lm-logo">Idle-Logout</div>
           
            <p className="muted">Sign in to continue to the Idle Logout demo app — a modern React experience for testing session inactivity.</p>
          </div>

          <ul className="lm-features">
            <li>
              <strong>Realtime session</strong>
              <span>Visual countdown & auto-logout demo.</span>
            </li>
            <li>
              <strong>Lightweight</strong>
              <span>Framework-agnostic idle detection.</span>
            </li>
            <li>
              <strong>Secure</strong>
              <span>Works with token expiry and API activity.</span>
            </li>
          </ul>

          <div className="lm-illustration" aria-hidden>
            {/* subtle SVG / decorative shape for flair */}
            <svg viewBox="0 0 200 120" preserveAspectRatio="xMidYMid meet">
              <defs>
                <linearGradient id="g1" x1="0" x2="1">
                  <stop offset="0" stopOpacity="0.12" stopColor="#7b61ff" />
                  <stop offset="1" stopOpacity="0.06" stopColor="#00d4ff" />
                </linearGradient>
              </defs>
              <rect x="0" y="0" width="200" height="120" rx="16" fill="url(#g1)" />
            </svg>
          </div>
        </aside>

        <main className="lm-card" role="main">
          <form className="lm-form" onSubmit={handleSubmit} aria-label="Login form">
            <div className="lm-form-header">
              <h2>Sign in</h2>

            </div>

            <div className="lm-hint">
              <div className="hint-left">
                <div className="hint-title">Demo credentials</div>
                <div className="hint-creds">{DEMO_EMAIL} / {DEMO_PASSWORD}</div>
              </div>

              <div className="hint-actions">
                <button type="button" className="btn ghost" onClick={handleUseDemo}>Autofill</button>
              </div>
            </div>

            <label className="lm-label">Email</label>
            <input
              className="lm-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@domain.com"
              autoComplete="username"
            />

            <label className="lm-label">Password</label>
            <div className="lm-pw-row">
              <input
                className="lm-input"
                type={pwVisible ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
              />
              <button
                type="button"
                className="btn ghost icon-btn"
                aria-pressed={pwVisible}
                onClick={() => setPwVisible(v => !v)}
              >
                {pwVisible ? 'Hide' : 'Show'}
              </button>
            </div>

            {error && <div className="lm-error" role="alert">{error}</div>}

            <div className="lm-actions">
              <button className="btn primary" type="submit" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign in'}
              </button>

              <button className="btn ghost" type="button" onClick={() => { setEmail(''); setPassword(''); }}>
                Clear
              </button>
            </div>

            <div className="lm-legal muted">
              <small>By signing in you agree to our <a href="#" onClick={(e)=>e.preventDefault()}>Terms</a>.</small>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}
