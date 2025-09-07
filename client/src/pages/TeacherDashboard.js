// src/pages/TeacherDashboard.jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import http from '../api/http';
import { useAuth } from '../context/authContext';
import './Dashboard.css';

export default function TeacherDashboard() {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [activities, setActivities] = useState([]);
  const [recs, setRecs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hint, setHint] = useState(''); // shows soft errors like 404 on a single endpoint

  const asArray = (x) => (Array.isArray(x) ? x : (x && Array.isArray(x.data) ? x.data : []));

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      setHint('');
      const [s, a, r] = await Promise.allSettled([
        http.get('/api/students'),
        http.get('/api/activities?limit=50'),
        http.get('/api/recommendations?limit=50'),
      ]);

      if (cancelled) return;

      // students
      if (s.status === 'fulfilled') setStudents(asArray(s.value.data));
      else {
        setStudents([]);
        setHint((h) => h || 'Could not load students.');
      }

      // activities
      if (a.status === 'fulfilled') setActivities(asArray(a.value.data));
      else {
        setActivities([]);
        setHint((h) => h || 'Could not load activities.');
      }

      // recommendations
      if (r.status === 'fulfilled') setRecs(asArray(r.value.data));
      else {
        setRecs([]);
        // common case: route not mounted → 404
        const code = r.reason?.response?.status;
        const msg = code === 404
          ? 'Recommendations API not found (404). Check your /api/recommendations route.'
          : 'Could not load recommendations.';
        setHint((h) => h || msg);
      }

      setLoading(false);
    })();

    return () => { cancelled = true; };
  }, []);

  // Normalize recommendation fields from either eager-loaded association names
  const recStudent = (r) => r.student?.user?.username || r.Student?.user?.username || r.studentId;
  const recActivity = (r) => r.activity?.title || r.Activity?.title || r.activityId;
  const recScore = (r) => {
    const n = typeof r.score === 'number' ? r.score : Number(r.score);
    return Number.isFinite(n) ? n.toFixed(2) : r.score ?? '-';
    };

  return (
    <div className="db-root db-hasTop">
      <div className="db-header">
        <div>
          <h1 className="db-title">Teacher Dashboard</h1>
          <div className="db-subtitle">Welcome, {user?.username}</div>
        </div>
        <div className="db-actions">
          <Link to="/app/teacher/students/create" className="db-btn db-btn--primary">Add Student</Link>
        </div>
      </div>

      {hint && <div className="db-empty" style={{ marginBottom: 10 }}>{hint}</div>}

      <div className="db-grid">
        {/* Overview */}
        <section className="db-card db-card--half">
          <div className="db-card__head"><h3 className="db-card__title">Overview</h3></div>
          <div className="db-kpis">
            <div className="db-kpi"><div className="db-kpi__label">Students</div><div className="db-kpi__value">{students.length}</div></div>
            <div className="db-kpi"><div className="db-kpi__label">Activities</div><div className="db-kpi__value">{activities.length}</div></div>
            <div className="db-kpi"><div className="db-kpi__label">Recommendations</div><div className="db-kpi__value">{recs.length}</div></div>
          </div>
        </section>

        {/* Students */}
        <section className="db-card db-card--half">
          <div className="db-card__head">
            <h3 className="db-card__title">My Students</h3>
            {/* Keep only one Add button overall (header). */}
          </div>
          {students.length ? (
            <div style={{ overflowX: 'auto' }}>
              <table className="db-table">
                <thead>
                  <tr><th>Name</th><th>Email</th><th>Disability</th><th>Style</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {students.map((s) => (
                    <tr key={s.id}>
                      <td>{s.user?.username || '-'}</td>
                      <td>{s.user?.email || '-'}</td>
                      <td>{s.disability || '-'}</td>
                      <td>{s.learningStyle || '-'}</td>
                      <td>
                        <Link className="db-btn" to={`/app/teacher/students/${s.id}/recommendations`}>Recommend</Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : <div className="db-empty">No students yet.</div>}
        </section>

        {/* Recommendations */}
        <section className="db-card db-card--half">
          <div className="db-card__head"><h3 className="db-card__title">Recent Recommendations</h3></div>
          {recs.length ? (
            <div style={{ overflowX: 'auto' }}>
              <table className="db-table">
                <thead>
                  <tr><th>Student</th><th>Activity</th><th>Score</th></tr>
                </thead>
                <tbody>
                  {recs.slice(0, 10).map((r) => (
                    <tr key={r.id}>
                      <td>{recStudent(r)}</td>
                      <td>{recActivity(r)}</td>
                      <td>{recScore(r)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : <div className="db-empty">No recommendations yet.</div>}
        </section>

        {/* Activities */}
        <section className="db-card db-card--half">
          <div className="db-card__head"><h3 className="db-card__title">Activities</h3></div>
          {activities.length ? (
            <div style={{ overflowX: 'auto' }}>
              <table className="db-table">
                <thead>
                  <tr><th>Title</th><th>Difficulty</th><th>Modality</th><th>Tags</th></tr>
                </thead>
                <tbody>
                  {activities.slice(0, 10).map((a) => {
                    const tagsArr = Array.isArray(a.tags)
                      ? a.tags
                      : (a.tags || '').split(',').map((t) => t.trim()).filter(Boolean);
                    return (
                      <tr key={a.id}>
                        <td>{a.title}</td>
                        <td>{a.difficulty}</td>
                        <td>{a.modality || '-'}</td>
                        <td>{tagsArr.slice(0, 3).map((t) => <span className="db-tag" key={`${a.id}-${t}`}>{t}</span>)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : <div className="db-empty">No activities found.</div>}
        </section>
      </div>

      {loading && <div className="db-subtitle" style={{ marginTop: 10 }}>Loading…</div>}
    </div>
  );
}
