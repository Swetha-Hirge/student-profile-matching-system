// src/pages/LoginPage.jsx
import { useEffect, useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './LoginPage.css';
// If you have an AuthContext, we’ll use it if available:
import { AuthContext } from '../context/authContext'; // adjust path if different

const API_BASE = process.env.REACT_APP_API_BASE || ''; 
// Use CRA proxy in dev (leave empty) OR set REACT_APP_API_BASE=http://localhost:5000

export default function LoginPage() {
  const navigate = useNavigate();
  const auth = useContext(AuthContext); // { user, setUser } if your context provides it

  const [form, setForm] = useState({
    email: localStorage.getItem('rememberEmail') || '',
    password: '',
    remember: !!localStorage.getItem('rememberEmail'),
  });

  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverErr, setServerErr] = useState('');

  useEffect(() => {
    // optional: if already logged in, redirect
    if (auth?.user?.role) {
      redirectByRole(auth.user.role);
    }
    // eslint-disable-next-line
  }, [auth?.user]);

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const validate = () => {
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return 'Please enter a valid email.';
    if (!form.password) return 'Please enter your password.';
    return '';
  };

  const redirectByRole = (role) => {
    if (role === 'admin') return navigate('/admin');
    if (role === 'teacher') return navigate('/teacher/dashboard');
    return navigate('/student/dashboard'); // default
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setServerErr('');
    const err = validate();
    if (err) return setServerErr(err);

    try {
      setLoading(true);

      const payload = {
        email: form.email.trim().toLowerCase(),
        password: form.password,
      };

      // NOTE: keep withCredentials if your backend sets httpOnly cookies
      const { data } = await axios.post(`${API_BASE}/api/auth/login`, payload, {
        withCredentials: true,
        headers: { 'Content-Type': 'application/json' },
      });

      // Remember email (optional UX)
      if (form.remember) {
        localStorage.setItem('rememberEmail', form.email.trim().toLowerCase());
      } else {
        localStorage.removeItem('rememberEmail');
      }

      // If your API returns { user: { role, ... }, token? }
      const role = data?.user?.role || data?.role;
      if (auth?.setUser) {
        auth.setUser(data.user || { role, email: form.email });
      }

      if (role) {
        redirectByRole(role);
      } else {
        navigate('/dashboard'); // generic fallback
      }
    } catch (error) {
      const status = error?.response?.status;
      const msg =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        (status === 401 ? 'Invalid email or password.' : 'Login failed. Please try again.');
      setServerErr(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-root">
      <div className="login-card">
        <header className="login-header">
          <h1>Welcome back</h1>
          <p>Log in to the Student Matching System</p>
        </header>

        {serverErr ? <div className="login-alert">{serverErr}</div> : null}

        <form className="login-form" onSubmit={onSubmit} noValidate>
          <div className="login-field">
            <label htmlFor="email">Email address</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={onChange}
              autoComplete="email"
              required
            />
          </div>

          <div className="login-field">
            <label htmlFor="password">Password</label>
            <div className="login-pw">
              <input
                id="password"
                name="password"
                type={showPw ? 'text' : 'password'}
                placeholder="••••••••"
                value={form.password}
                onChange={onChange}
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                className="login-toggle"
                onClick={() => setShowPw((s) => !s)}
                aria-label={showPw ? 'Hide password' : 'Show password'}
              >
                {showPw ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          <div className="login-row">
            <label className="login-remember">
              <input
                type="checkbox"
                name="remember"
                checked={form.remember}
                onChange={onChange}
              />
              Remember me
            </label>

            {/* If you implement it later: */}
            <Link to="/forgot-password" className="login-link">Forgot password?</Link>
          </div>

          <button className="login-submit" type="submit" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <div className="login-footer">
          New here? <Link to="/register">Create an account</Link>
        </div>
      </div>
    </div>
  );
}
