import { useEffect, useMemo, useState } from 'react';
import http from '../../api/http';
import './AdminActivities.css';

const toArray = (payload) => {
  // Accept: [ ... ] OR { data:[...] } OR { rows:[...] } OR { items:[...] }
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.rows)) return payload.rows;
  if (Array.isArray(payload?.items)) return payload.items;
  // Some backends wrap again: { data: { data:[...] } }
  if (payload?.data && Array.isArray(payload.data?.data)) return payload.data.data;
  return [];
};

export default function ActivityManager() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [q, setQ] = useState('');
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    difficulty: '',     // number or string; backend expects INTEGER
    modality: '',       // optional — your model may not have this but we render it if present
    tags: '',           // comma-separated; backend may store as string
  });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setErr('');
      try {
        const { data } = await http.get('/api/activities');
        if (!cancelled) setActivities(toArray(data));
      } catch (e) {
        if (!cancelled) setErr(e?.response?.data?.error || 'Failed to load activities');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const filtered = useMemo(() => {
    const list = toArray(activities);
    const qq = q.trim().toLowerCase();
    if (!qq) return list;
    return list.filter(a =>
      String(a.id).includes(qq) ||
      a.title?.toLowerCase().includes(qq) ||
      a.description?.toLowerCase().includes(qq) ||
      (a.modality || '').toLowerCase().includes(qq) ||
      (Array.isArray(a.tags) ? a.tags.join(',') : (a.tags || '')).toLowerCase().includes(qq)
    );
  }, [activities, q]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const createActivity = async (e) => {
    e.preventDefault();
    setErr('');
    if (!form.title || !form.difficulty) {
      return setErr('Title and difficulty are required.');
    }
    // Difficulty: ensure number (your DB column is INTEGER)
    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      difficulty: Number(form.difficulty), // important
    };
    // Optional fields if your model supports them
    if (form.modality) payload.modality = form.modality.trim();
    if (form.tags) payload.tags = form.tags.trim(); // string "a,b,c" is fine

    try {
      setCreating(true);
      const { data } = await http.post('/api/activities', payload, {
        headers: { 'Content-Type': 'application/json' },
      });
      setActivities(prev => [data, ...toArray(prev)]);
      setForm({ title: '', description: '', difficulty: '', modality: '', tags: '' });
    } catch (e) {
      setErr(e?.response?.data?.error || e?.message || 'Create failed');
    } finally {
      setCreating(false);
    }
  };

  const removeActivity = async (id) => {
    if (!window.confirm('Delete this activity?')) return;
    try {
      await http.delete(`/api/activities/${id}`);
      setActivities(prev => toArray(prev).filter(a => a.id !== id));
    } catch (e) {
      alert(e?.response?.data?.error || 'Delete failed');
    }
  };

  return (
    <div className="acts-wrap">
      <header className="acts-header">
        <div>
          <h1 className="acts-title">⚙️ Activities</h1>
          <p className="acts-subtitle">Create and manage learning activities.</p>
        </div>
        <div className="acts-stats">
          <div className="stat">
            <div className="stat-k">{toArray(activities).length}</div>
            <div className="stat-l">Total</div>
          </div>
        </div>
      </header>

      {err ? <div className="acts-alert">{err}</div> : null}

      {/* Create */}
      <section className="acts-card">
        <h3 className="card-title">➕ New Activity</h3>
        <form className="acts-form" onSubmit={createActivity}>
          <input
            name="title" placeholder="Title *"
            value={form.title} onChange={onChange}
          />
          <input
            name="difficulty" type="number" min="1" max="5"
            placeholder="Difficulty (1–5) *"
            value={form.difficulty} onChange={onChange}
          />
          <input
            name="modality" placeholder="Modality (e.g., visual, auditory)"
            value={form.modality} onChange={onChange}
          />
          <input
            name="tags" placeholder="Tags (comma-separated)"
            value={form.tags} onChange={onChange}
          />
          <textarea
            name="description" placeholder="Description"
            value={form.description} onChange={onChange}
            rows={3}
          />
          <button className="btn btn--primary" disabled={creating}>
            {creating ? 'Saving…' : 'Create'}
          </button>
        </form>
      </section>

      {/* Toolbar */}
      <div className="acts-toolbar">
        <div className="input-wrap">
          <input
            placeholder="Search by title, tags, modality, description, or ID…"
            value={q} onChange={(e)=>setQ(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <section className="acts-card">
        <div className="table-wrap">
          <table className="tbl">
            <thead>
              <tr>
                <th style={{width:70}}>ID</th>
                <th>Title</th>
                <th style={{width:110}}>Difficulty</th>
                <th style={{width:140}}>Modality</th>
                <th>Tags</th>
                <th>Description</th>
                <th style={{width:110}}></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({length:5}).map((_,i)=>(
                  <tr key={`sk-${i}`} className="skeleton-row">
                    <td><div className="sk sk--sm"/></td>
                    <td><div className="sk"/></td>
                    <td><div className="sk sk--sm"/></td>
                    <td><div className="sk sk--sm"/></td>
                    <td><div className="sk"/></td>
                    <td><div className="sk"/></td>
                    <td><div className="sk sk--sm"/></td>
                  </tr>
                ))
              ) : filtered.length ? (
                filtered.map(a => {
                  const tagsArr = Array.isArray(a.tags) ? a.tags
                    : (a.tags || '').split(',').map(t=>t.trim()).filter(Boolean);
                  return (
                    <tr key={a.id}>
                      <td className="mono">{a.id}</td>
                      <td className="strong">{a.title}</td>
                      <td><span className="pill">{a.difficulty}</span></td>
                      <td>{a.modality || '-'}</td>
                      <td className="nowrap">
                        {tagsArr.length ? tagsArr.slice(0,5).map(t=>(
                          <span className="tag" key={`${a.id}-${t}`}>{t}</span>
                        )) : <span className="muted">—</span>}
                      </td>
                      <td className="muted">{a.description || '—'}</td>
                      <td className="row-actions">
                        <button className="btn btn--danger" onClick={()=>removeActivity(a.id)}>
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr><td colSpan={7}><div className="acts-empty">No activities found.</div></td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
