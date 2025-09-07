// src/pages/StudentDashboard.jsx
import { useContext, useEffect, useMemo, useState } from 'react';
import http from '../api/http';
import { AuthContext } from '../context/authContext';
import './Dashboard.css';

export default function StudentDashboard() {
  const { user } = useContext(AuthContext);
  const [myStudentId, setMyStudentId] = useState(null);
  const [recs, setRecs] = useState([]);
  const [activityMap, setActivityMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  // Load my id + my recs
  const fetchMine = async () => {
    try {
      setLoading(true);
      setErr('');

      // 1) who am I?
      const meRes = await http.get('/api/students/me');
      // support both { id, ... } and { data: { id, ... } }
      const sid = meRes?.data?.data?.id ?? meRes?.data?.id;
      if (!sid) {
        setErr('Student profile not found.');
        setRecs([]);
        setLoading(false);
        return;
      }
      setMyStudentId(sid);

      // 2) load minimal recommendations
      const recRes = await http.get(`/api/students/${sid}/recommendations`);
      const list = Array.isArray(recRes?.data) ? recRes.data : recRes?.data?.data || [];
      setRecs(list);

      // 3) fetch activity details for titles (best-effort)
      const ids = [...new Set(list.map(r => r.activityId))];
      if (ids.length) {
        try {
          // Prefer a batched lookup if your API supports it
          const actRes = await http.get('/api/activities', { params: { ids: ids.join(',') } });
          const arr = Array.isArray(actRes?.data?.data)
            ? actRes.data.data
            : Array.isArray(actRes?.data)
              ? actRes.data
              : [];
          const map = {};
          for (const a of arr) map[a.id] = a;
          setActivityMap(map);
        } catch {
          // If your API has no batch endpoint, you could optionally loop one-by-one here.
          setActivityMap({});
        }
      } else {
        setActivityMap({});
      }
    } catch (e) {
      setErr(e?.response?.data?.error || 'Failed to load recommendations.');
      setRecs([]);
      setActivityMap({});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMine(); }, []);

  // Enrich recs with titles if we have them
  const shown = useMemo(() => {
    return recs.map(r => {
      const a = activityMap[r.activityId];
      return {
        ...r,
        title: r.matchedActivity?.title || r.activity?.title || a?.title || `Activity #${r.activityId}`,
      };
    });
  }, [recs, activityMap]);

  return (
    <div className="db-root">
      <div className="db-header">
        <div>
          <h1 className="db-title">Student Dashboard</h1>
          <div className="db-subtitle">Welcome, {user?.username}</div>
        </div>
      </div>

      <div className="db-grid">
        {/* My ID card */}
        <section className="db-card db-card--third">
          <div className="db-card__head"><h3 className="db-card__title">Your ID</h3></div>
          <div className="db-kpis">
            <div className="db-kpi">
              <div className="db-kpi__label">Student ID</div>
              <div className="db-kpi__value">{myStudentId ?? '—'}</div>
            </div>
          </div>
          <div className="db-meta" style={{ marginTop: 8 }}>
            Ask your teacher if you don't know this ID.
          </div>
        </section>

        {/* Recommendations */}
        <section className="db-card db-card--half">
          <div className="db-card__head">
            <h3 className="db-card__title">Your Recommendations</h3>
          </div>

          {err && <div className="db-alert db-alert--error">{err}</div>}

          {loading ? (
            <div className="db-empty">Loading...</div>
          ) : !shown.length ? (
            <div className="db-empty">No recommendations yet.</div>
          ) : (
            <table className="db-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Activity</th>
                  <th>Score</th>
                </tr>
              </thead>
              <tbody>
                {shown.map((r, i) => (
                  <tr key={`${r.activityId}-${i}`}>
                    <td>{i + 1}</td>
                    <td>{r.title}</td>
                    <td>{typeof r.score === 'number' ? r.score.toFixed(2) : r.score}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </div>
    </div>
  );
}
