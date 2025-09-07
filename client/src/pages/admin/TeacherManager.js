import { useEffect, useMemo, useState } from 'react';
import http from '../../api/http';
import './AdminTeachers.css';

export default function TeacherManager() {
  const [rows, setRows] = useState([]);
  const [q, setQ] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  // add form state
  const [form, setForm] = useState({ username: '', email: '', subject: '', password: '' });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setErr('');
      try {
        const { data } = await http.get('/api/teachers');
        if (!cancelled) setRows(Array.isArray(data) ? data : []);
      } catch (e) {
        if (!cancelled) setErr(e?.response?.data?.error || 'Failed to load teachers');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const subjects = useMemo(() => {
    const s = new Set();
    rows.forEach(r => r.subject && s.add(r.subject));
    return ['All', ...Array.from(s)];
  }, [rows]);

  const list = useMemo(() => {
    let out = rows;
    if (q.trim()) {
      const qq = q.trim().toLowerCase();
      out = out.filter(t =>
        String(t.id).includes(qq) ||
        t.subject?.toLowerCase().includes(qq) ||
        t.user?.username?.toLowerCase().includes(qq) ||
        t.user?.email?.toLowerCase().includes(qq)
      );
    }
    if (subjectFilter !== 'All') out = out.filter(t => t.subject === subjectFilter);
    // newest first
    return [...out].sort((a,b)=> new Date(b.createdAt) - new Date(a.createdAt));
  }, [rows, q, subjectFilter]);

  const onFormChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const submitCreate = async (e) => {
    e.preventDefault();
    setErr('');
    if (!form.username || !form.email || !form.password || !form.subject) {
      return setErr('Please fill all fields.');
    }
    try {
      setCreating(true);
      // Admin creates a teacher user + teacher profile
      const payload = {
        username: form.username.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        subject: form.subject.trim(),
      };
      const { data } = await http.post('/api/teachers', payload, {
        headers: { 'Content-Type': 'application/json' },
      });
      // Optimistic add
      setRows(r => [data, ...r]);
      setForm({ username: '', email: '', subject: '', password: '' });
    } catch (e) {
      setErr(
        e?.response?.data?.error ||
        e?.response?.data?.message ||
        'Failed to create teacher'
      );
    } finally {
      setCreating(false);
    }
  };

  const removeTeacher = async (id) => {
    if (!window.confirm('Delete this teacher (and linked user)?')) return;
    try {
      await http.delete(`/api/teachers/${id}`);
      setRows(r => r.filter(x => x.id !== id));
    } catch (e) {
      alert(e?.response?.data?.error || 'Delete failed');
    }
  };

  return (
    <div className="tman-wrap">
      <header className="tman-header">
        <div>
          <h1 className="tman-title">📚 Teachers</h1>
          <p className="tman-subtitle">
            Manage teacher accounts, filter by subject, and review student load.
          </p>
        </div>
        <div className="tman-stats">
          <div className="stat">
            <div className="stat-k">{rows.length}</div>
            <div className="stat-l">Total Teachers</div>
          </div>
          <div className="stat">
            <div className="stat-k">
              {rows.reduce((acc, t) => acc + (t.students?.length || 0), 0)}
            </div>
            <div className="stat-l">Total Students</div>
          </div>
        </div>
      </header>

      {err ? <div className="tman-alert">{err}</div> : null}

      {/* Create form */}
      <section className="tman-card">
        <h3 className="card-title">➕ Add Teacher</h3>
        <form className="tman-form" onSubmit={submitCreate}>
          <input
            name="username" placeholder="Full name / Username"
            value={form.username} onChange={onFormChange}
          />
          <input
            type="email" name="email" placeholder="Email"
            value={form.email} onChange={onFormChange}
          />
          <input
            name="subject" placeholder="Subject (e.g., Math)"
            value={form.subject} onChange={onFormChange}
          />
          <input
            type="password" name="password" placeholder="Temp Password"
            value={form.password} onChange={onFormChange}
          />
          <button className="btn btn--primary" disabled={creating}>
            {creating ? 'Creating…' : 'Add Teacher'}
          </button>
        </form>
      </section>

      {/* Toolbar */}
      <div className="tman-toolbar">
        <div className="input-wrap">
          <input
            placeholder="Search by name, email, subject, or ID…"
            value={q} onChange={(e)=>setQ(e.target.value)}
          />
        </div>
        <select value={subjectFilter} onChange={(e)=>setSubjectFilter(e.target.value)}>
          {subjects.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Table */}
      <section className="tman-card">
        <div className="table-wrap">
          <table className="tbl">
            <thead>
              <tr>
                <th style={{width:70}}>ID</th>
                <th>Teacher</th>
                <th>Email</th>
                <th>Subject</th>
                <th style={{width:140}}>Students</th>
                <th style={{width:160}}>Created</th>
                <th style={{width:120}}></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({length:5}).map((_,i)=>(
                  <tr key={`sk-${i}`} className="skeleton-row">
                    <td><div className="sk sk--sm"/></td>
                    <td><div className="sk"/></td>
                    <td><div className="sk"/></td>
                    <td><div className="sk sk--sm"/></td>
                    <td><div className="sk sk--sm"/></td>
                    <td><div className="sk sk--sm"/></td>
                    <td><div className="sk sk--sm"/></td>
                  </tr>
                ))
              ) : list.length ? (
                list.map(t => (
                  <tr key={t.id}>
                    <td className="mono">#{t.id}</td>
                    <td className="strong">{t.user?.username || '-'}</td>
                    <td>{t.user?.email || '-'}</td>
                    <td><span className="pill">{t.subject || '-'}</span></td>
                    <td>
                      <span className="pill pill--count">{t.students?.length || 0}</span>
                    </td>
                    <td className="muted">
                      {new Date(t.createdAt).toLocaleDateString()}
                    </td>
                    <td>
                      <div className="row-actions">
                        {/* You can add edit later */}
                        <button className="btn btn--danger" onClick={()=>removeTeacher(t.id)}>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={7}><div className="tman-empty">No teachers found.</div></td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
