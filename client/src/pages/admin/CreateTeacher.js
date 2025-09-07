// src/pages/admin/CreateTeacher.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import http from '../../api/http';
import { useAuth } from '../../context/authContext';
import '../FormPage.css';

export default function CreateTeacher() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    subject: '',
  });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const [ok, setOk] = useState('');

  if (user?.role !== 'admin') {
    return <div className="form-page"><p>Access denied</p></div>;
  }

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr('');
    setOk('');

    if (!form.username || !form.email || !form.password) {
      return setErr('Username, email and password are required.');
    }

    try {
      setLoading(true);
      await http.post('/api/auth/register-admin', {
        ...form,
        role: 'teacher',
      });
      setOk('✅ Teacher created.');
      setTimeout(() => navigate('/app/admin/teachers'), 1200);
    } catch (error) {
      setErr(
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        'Failed to create teacher.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-page">
      <div className="form-card">
        <header className="form-header">
          <h1>Create Teacher</h1>
          <p>Admins can register teacher accounts here.</p>
        </header>

        {err && <div className="form-alert form-alert--error">{err}</div>}
        {ok && <div className="form-alert form-alert--success">{ok}</div>}

        <form className="form-body" onSubmit={onSubmit}>
          <div className="form-field">
            <label htmlFor="username">Username</label>
            <input id="username" name="username" placeholder="teacher001" value={form.username} onChange={onChange} required />
          </div>

          <div className="form-field">
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" placeholder="teacher@school.org" value={form.email} onChange={onChange} required />
          </div>

          <div className="form-field">
            <label htmlFor="password">Temp Password</label>
            <input id="password" name="password" type="password" placeholder="Set a temporary password" value={form.password} onChange={onChange} required />
          </div>

          <div className="form-field">
            <label htmlFor="subject">Subject (optional)</label>
            <input id="subject" name="subject" placeholder="Maths, English, ..." value={form.subject} onChange={onChange} />
          </div>

          <button className="form-submit" type="submit" disabled={loading}>
            {loading ? 'Creating…' : 'Create Teacher'}
          </button>
        </form>
      </div>
    </div>
  );
}