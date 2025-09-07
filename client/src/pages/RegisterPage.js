// src/pages/RegisterPage.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './RegisterPage.css';
import http from '../api/http';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverErr, setServerErr] = useState('');

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const validate = () => {
    if (!form.username.trim()) return 'Please enter your full name or username.';
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return 'Please enter a valid email.';
    if (form.password.length < 6) return 'Password must be at least 6 characters.';
    if (form.password !== form.confirmPassword) return 'Passwords do not match.';
    return '';
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setServerErr('');
    const err = validate();
    if (err) return setServerErr(err);

    try {
      setLoading(true);
      // Public admin self-register (org policy)
      const payload = {
        username: form.username.trim(),
        name: form.username.trim(),            // harmless fallback for backend
        email: form.email.trim().toLowerCase(),
        password: form.password,
        role: 'admin',                         // <-- force admin
      };

      await http.post('/api/auth/register', payload, {
        withCredentials: true,
        headers: { 'Content-Type': 'application/json' },
      });

      alert('Admin account created. Please log in.');
      navigate('/login', { replace: true });
    } catch (error) {
      const status = error?.response?.status;
      const msg =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        (status === 409 ? 'Email already registered.' : 'Registration failed. Please try again.');
      setServerErr(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reg-root">
      <div className="reg-card">
        <header className="reg-header">
          <h1>Create Admin Account</h1>
          <p>This registration is for organization administrators only.</p>
        </header>

        {serverErr ? <div className="reg-alert">{serverErr}</div> : null}

        <form className="reg-form" onSubmit={onSubmit} noValidate>
          <div className="reg-field">
            <label htmlFor="username">Full name / Username</label>
            <input
              id="username"
              name="username"
              type="text"
              placeholder="e.g., Alex Johnson"
              value={form.username}
              onChange={onChange}
              autoComplete="name"
              required
            />
          </div>

          <div className="reg-field">
            <label htmlFor="email">Work email</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="admin@yourorg.com"
              value={form.email}
              onChange={onChange}
              autoComplete="email"
              required
            />
          </div>

          <div className="reg-two">
            <div className="reg-field">
              <label htmlFor="password">Password</label>
              <div className="reg-pw">
                <input
                  id="password"
                  name="password"
                  type={showPw ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={onChange}
                  autoComplete="new-password"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  className="reg-toggle"
                  onClick={() => setShowPw((s) => !s)}
                  aria-label={showPw ? 'Hide password' : 'Show password'}
                >
                  {showPw ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            <div className="reg-field">
              <label htmlFor="confirmPassword">Confirm password</label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showPw ? 'text' : 'password'}
                placeholder="••••••••"
                value={form.confirmPassword}
                onChange={onChange}
                autoComplete="new-password"
                required
                minLength={6}
              />
            </div>
          </div>

          {/* No role picker — teachers are created by admin; students by teachers */}
          <button className="reg-submit" type="submit" disabled={loading}>
            {loading ? 'Creating admin…' : 'Create admin account'}
          </button>
        </form>

        <div className="reg-footer">
          Already have an account? <Link to="/login">Log in</Link>
        </div>
      </div>
    </div>
  );
}