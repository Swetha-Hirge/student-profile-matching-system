// src/pages/LoginPage.jsx
import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './LoginPage.css';

import http from '../api/http';               // ✅ our axios instance (adds Bearer automatically)
import { useAuth } from '../context/authContext'; // ✅ use the hook you just added

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, setUser } = useAuth();

  const [form, setForm] = useState({
    email: localStorage.getItem('rememberEmail') || '',
    password: '',
    remember: !!localStorage.getItem('rememberEmail'),
  });

  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverErr, setServerErr] = useState('');
  const [forgotPw, setForgotPw] = useState(false);

  useEffect(() => {
    if (user?.role) {
      redirectByRole(user.role);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.role]);

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
    // Prefer redirecting back to where user came from (if present)
    const from = location.state?.from?.pathname;
    if (from) return navigate(from, { replace: true });

    // Otherwise route by role under /app/*
    if (role === 'admin') return navigate('/app/admin', { replace: true });
    if (role === 'teacher') return navigate('/app/teacher/dashboard', { replace: true });
    return navigate('/app/student/dashboard', { replace: true });
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

      // withCredentials OK even if you mainly rely on Bearer
      const { data } = await http.post('/api/auth/login', payload, {
        withCredentials: true,
        headers: { 'Content-Type': 'application/json' },
      });

      // Persist token so our http client adds Authorization on next requests
      if (data?.token) {
        localStorage.setItem('access_token', data.token);
      }

      // Remember email UX
      if (form.remember) {
        localStorage.setItem('rememberEmail', payload.email);
      } else {
        localStorage.removeItem('rememberEmail');
      }

      // Put user into context immediately
      if (data?.user) {
        setUser(data.user);
      }

      // Redirect
      const role = data?.user?.role || 'student';
      redirectByRole(role);
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
                        <div className="login-pw">
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
            <div onClick={()=>setForgotPw(!forgotPw)} className="login-link">{forgotPw? "Contact admin/teacher": "Forgot password?"}</div>
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