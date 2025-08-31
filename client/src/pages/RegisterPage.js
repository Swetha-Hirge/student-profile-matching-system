// src/pages/RegisterPage.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './RegisterPage.css';

const API_BASE = process.env.REACT_APP_API_BASE || ''; 
// If you have CRA proxy set to http://localhost:5000, keep API_BASE = ''.
// Otherwise set REACT_APP_API_BASE="http://localhost:5000" in .env

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student', // 'student' | 'teacher'
  });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverErr, setServerErr] = useState('');

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const validate = () => {
    if (!form.name.trim()) return 'Please enter your name.';
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return 'Please enter a valid email.';
    if (form.password.length < 6) return 'Password must be at least 6 characters.';
    if (form.password !== form.confirmPassword) return 'Passwords do not match.';
    if (!['student', 'teacher'].includes(form.role)) return 'Please select a valid role.';
    return '';
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setServerErr('');
    const err = validate();
    if (err) return setServerErr(err);

    try {
      setLoading(true);
      // Adjust keys if your backend expects different names (e.g., "username")
      const payload = {
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        role: form.role,
      };

      const res = await axios.post(`${API_BASE}/api/auth/register`, payload, {
        withCredentials: true,
        headers: { 'Content-Type': 'application/json' },
      });

      // If success, send the user to login
      alert('Registration successful. Please log in.');
      navigate('/login');
    } catch (error) {
      // Common API errors
      const msg =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        (error?.response?.status === 409
          ? 'Email already registered.'
          : 'Registration failed. Please try again.');
      setServerErr(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reg-root">
      <div className="reg-card">
        <header className="reg-header">
          <h1>Create your account</h1>
          <p>Join the Student Matching System</p>
        </header>

        {serverErr ? <div className="reg-alert">{serverErr}</div> : null}

        <form className="reg-form" onSubmit={onSubmit} noValidate>
          <div className="reg-field">
            <label htmlFor="name">Full name</label>
            <input
              id="name"
              name="name"
              type="text"
              placeholder="e.g., Alex Johnson"
              value={form.name}
              onChange={onChange}
              autoComplete="name"
              required
            />
          </div>

          <div className="reg-field">
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

          <div className="reg-field">
            <label htmlFor="role">Role</label>
            <select id="role" name="role" value={form.role} onChange={onChange} required>
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
              {/* If admin signups are restricted, handle separately in backend */}
            </select>
          </div>

          <button className="reg-submit" type="submit" disabled={loading}>
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <div className="reg-footer">
          Already have an account? <Link to="/login">Log in</Link>
        </div>
      </div>
    </div>
  );
}
