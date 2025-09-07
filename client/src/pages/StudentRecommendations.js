// src/pages/StudentRecommendations.jsx
import { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import http from '../api/http';
import './Dashboard.css';

export default function StudentRecommendations() {
  const { id } = useParams(); // studentId
  const [student, setStudent] = useState(null);
  const [matches, setMatches] = useState([]);     // [{ activityId, score }]
  const [activities, setActivities] = useState([]); // [{ id, title, difficulty, modality, tags }]
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedTop, setSavedTop] = useState(false);
  const [error, setError] = useState('');

  // Fetch student, live matches, and activities
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setError('');
        setLoading(true);

        const [s, m, a] = await Promise.all([
          http.get(`/api/students/${id}`),
          http.get(`/api/students/${id}/recommendations`),
          http.get(`/api/activities`)
        ]);

        if (cancelled) return;

        setStudent(s.data || null);
        // matches might be returned as raw array or wrapped in {data}
        const raw = Array.isArray(m.data) ? m.data : m.data?.data || [];
        setMatches(Array.isArray(raw) ? raw : []);

        // activities can be array or {data}
        const acts = Array.isArray(a.data) ? a.data : a.data?.data || [];
        setActivities(acts);
      } catch (e) {
        if (!cancelled) setError('Failed to load recommendations.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [id]);

  // Build a map of activityId -> activity
  const activityById = useMemo(() => {
    const map = new Map();
    activities.forEach(a => map.set(a.id, a));
    return map;
  }, [activities]);

  // Merge matches with activity details and sort by score desc
  const rows = useMemo(() => {
    const r = matches.map(m => {
      const a = activityById.get(m.activityId) || {};
      const tags = Array.isArray(a.tags)
        ? a.tags
        : (a.tags || '').split(',').map(t => t.trim()).filter(Boolean);
      return {
        key: `${m.activityId}-${m.score}`,
        activityId: m.activityId,
        score: m.score,
        title: a.title || `Activity #${m.activityId}`,
        difficulty: a.difficulty ?? '-',
        modality: a.modality || '-',
        tags
      };
    });
    return r.sort((x, y) => (y.score ?? 0) - (x.score ?? 0));
  }, [matches, activityById]);

  const topRow = rows[0];

  const saveTop = async () => {
    try {
      setSaving(true);
      setError('');
      // Your backend creates the TOP recommendation automatically
      // POST /api/students/:id/recommendations
        await http.post(`/api/students/${id}/recommendations`);
      // Optimistic: mark saved and optionally surface the matched activity
      setSavedTop(true);
      // You could also insert data.recommendation into a “saved” list if you add one later
    } catch (e) {
      setError(
        e?.response?.data?.message ||
        e?.response?.data?.error ||
        'Failed to save top recommendation.'
      );
    } finally {
      setSaving(false);
    }
  };

  const TitleBar = () => (
    <div className="db-header">
      <div>
        <h1 className="db-title">Recommendations</h1>
        <div className="db-subtitle">
          For&nbsp;
          <strong>{student?.user?.username || 'Student'}</strong>
          <span className="db-chip">Disability: {student?.disability || '-'}</span>
          <span className="db-chip">Style: {student?.learningStyle || '-'}</span>
          {rows.length > 0 && (
            <span className="db-chip db-chip--accent">
              Top score: {typeof rows[0].score === 'number' ? rows[0].score.toFixed(2) : rows[0].score}
            </span>
          )}
        </div>
      </div>
      <div className="db-actions">
        <Link to="/app/teacher/dashboard" className="db-btn">← Back</Link>
        <button
          className="db-btn db-btn--primary"
          onClick={saveTop}
          disabled={!topRow || saving || savedTop}
          title={!topRow ? 'No matches to save' : 'Save top recommendation'}
        >
          {savedTop ? 'Saved ✓' : saving ? 'Saving…' : 'Save Top Recommendation'}
        </button>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="db-root db-hasTop">
        <TitleBar />
        <div className="db-card">
          <div className="db-subtitle">Loading recommendations…</div>
        </div>
      </div>
    );
  }

  return (
    <div className="db-root db-hasTop">
      <TitleBar />

      {error && <div className="db-alert db-alert--error" style={{marginBottom:12}}>{error}</div>}

      {/* Top pick card */}
      <section className="db-card" style={{marginBottom:16}}>
        <div className="db-card__head">
          <h3 className="db-card__title">Top Match</h3>
        </div>
        {topRow ? (
          <div className="db-topmatch">
            <div className="db-topmatch__main">
              <div className="db-topmatch__title">{topRow.title}</div>
              <div className="db-topmatch__meta">
                <span className="db-tag">Score: {topRow.score.toFixed ? topRow.score.toFixed(2) : topRow.score}</span>
                <span className="db-tag">Difficulty: {topRow.difficulty}</span>
                {topRow.modality && <span className="db-tag">{topRow.modality}</span>}
              </div>
            </div>
            <div className="db-topmatch__tags">
              {topRow.tags.slice(0, 6).map(t => (
                <span className="db-tag" key={`${topRow.activityId}-${t}`}>{t}</span>
              ))}
            </div>
          </div>
        ) : (
          <div className="db-empty">No matches yet for this student.</div>
        )}
      </section>

      {/* All matches table */}
      <section className="db-card">
        <div className="db-card__head">
          <h3 className="db-card__title">All Matches</h3>
        </div>

        {rows.length ? (
          <div style={{ overflowX: 'auto' }}>
            <table className="db-table">
              <thead>
                <tr>
                  <th style={{width: '40%'}}>Activity</th>
                  <th>Difficulty</th>
                  <th>Score</th>
                  <th>Tags</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(r => (
                  <tr key={r.key}>
                    <td>{r.title}</td>
                    <td>{r.difficulty}</td>
                    <td>{typeof r.score === 'number' ? r.score.toFixed(2) : r.score}</td>
                    <td>
                      {r.tags.slice(0, 4).map(t => (
                        <span className="db-tag" key={`${r.activityId}-${t}`}>{t}</span>
                      ))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="db-empty">No matches to display.</div>
        )}
      </section>
    </div>
  );
}
