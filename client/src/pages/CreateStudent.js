// src/pages/CreateStudent.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import http from '../api/http';
import { useAuth } from '../context/authContext';
import './FormPage.css';

export default function CreateStudent() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    disability: '',
    learningStyle: '',
  });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const [success, setSuccess] = useState('');

  if (user?.role !== 'teacher') {
    return <div className="form-page"><p>Access denied</p></div>;
  }

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr('');
    setSuccess('');

    if (!form.username || !form.email || !form.password) {
      return setErr('Username, email and password are required.');
    }

    try {
      setLoading(true);
      await http.post('/api/teachers/students', form);
      setSuccess('✅ Student created successfully.');
      setTimeout(() => navigate('/app/teacher/dashboard'), 1200);
    } catch (error) {
      setErr(
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        'Failed to create student.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-page">
      <div className="form-card">
        <header className="form-header">
          <h1>Create Student</h1>
          <p>Teachers can add students under their supervision.</p>
        </header>

        {err && <div className="form-alert form-alert--error">{err}</div>}
        {success && <div className="form-alert form-alert--success">{success}</div>}

        <form className="form-body" onSubmit={onSubmit}>
          <div className="form-field">
            <label htmlFor="username">Username</label>
            <div className='input-pw'>
            <input id="username" name="username" placeholder="student001" value={form.username} onChange={onChange} required />
            </div>
          </div>

          <div className="form-field">
            <label htmlFor="email">Email</label>
            <div className='input-pw'>
            <input id="email" name="email" type="email" placeholder="student@school.org" value={form.email} onChange={onChange} required />
            </div>
          </div>

          <div className="form-field">
            <label htmlFor="password">Password</label>
            <div className='input-pw'>
            <input id="password" name="password" type="password" placeholder="••••••••" value={form.password} onChange={onChange} required />
            </div>
          </div>

          <div className="form-field">
            <label htmlFor="disability">Disability</label>
            <select id="disability" name="disability" value={form.disability} onChange={onChange}>
              <option value="">-- Select --</option>
              <option>Dyslexia</option>
              <option>Dysgraphia</option>
              <option>Dyscalculia</option>
              <option>ADHD</option>
              <option>Autism Spectrum Disorder</option>
              <option>Visual Impairment</option>
              <option>Hearing Impairment</option>
              <option>Dyspraxia (DCD)</option>
              <option>Nonverbal Learning Disorder</option>
              <option>Specific Learning Disorder</option>
            </select>
          </div>

          <div className="form-field">
            <label htmlFor="learningStyle">Learning Style</label>
            <select id="learningStyle" name="learningStyle" value={form.learningStyle} onChange={onChange}>
              <option value="">-- Select --</option>
              <option>Visual</option>
              <option>Auditory</option>
              <option>Kinesthetic</option>
              <option>Reading/Writing</option>
            </select>
          </div>

          <button className="form-submit" type="submit" disabled={loading}>
            {loading ? 'Creating…' : 'Create Student'}
          </button>
        </form>
      </div>
    </div>
  );
}