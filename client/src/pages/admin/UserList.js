// src/pages/admin/UserList.jsx
import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../context/authContext';
import http from '../../api/http';
import './AdminUsers.css';

const ROLES = ['all', 'admin', 'teacher', 'student'];

export default function UserList() {
  const { user } = useAuth();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  // UI state
  const [q, setQ] = useState('');
  const [role, setRole] = useState('all');
  const [sortBy, setSortBy] = useState('id');
  const [dir, setDir] = useState('desc'); // 'asc' | 'desc'
  const [page, setPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setErr('');
      try {
        const { data } = await http.get('/api/admin/users');
        if (!cancelled) setRows(Array.isArray(data) ? data : []);
      } catch (e) {
        if (!cancelled) setErr('Failed to load users.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const filtered = useMemo(() => {
    let x = rows;
    if (role !== 'all') x = x.filter(r => r.role === role);
    if (q.trim()) {
      const s = q.trim().toLowerCase();
      x = x.filter(r =>
        String(r.id).includes(s) ||
        r.username?.toLowerCase().includes(s) ||
        r.email?.toLowerCase().includes(s) ||
        r.role?.toLowerCase().includes(s)
      );
    }
    x = [...x].sort((a,b) => {
      const A = a[sortBy];
      const B = b[sortBy];
      if (A === B) return 0;
      if (dir === 'asc') return A > B ? 1 : -1;
      return A < B ? 1 : -1;
    });
    return x;
  }, [rows, q, role, sortBy, dir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageSafe = Math.min(page, totalPages);
  const sliced = filtered.slice((pageSafe - 1) * pageSize, pageSafe * pageSize);

  const toggleSort = (key) => {
    if (sortBy === key) {
      setDir(d => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(key);
      setDir('asc');
    }
  };

  if (user?.role !== 'admin') {
    return (
      <div className="admin-wrap">
        <div className="admin-header">
          <h1 className="admin-title">Users</h1>
        </div>
        <div className="admin-card">
          <div className="admin-empty">You don’t have access to this page.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-wrap">
      <div className="admin-header">
        <div>
          <h1 className="admin-title">👥 All Users</h1>
          <p className="admin-subtitle">Manage org users, filter by role, and search quickly.</p>
        </div>
        <div className="admin-actions">
          {/* If you have a Create Admin or Create Teacher flow, link buttons here */}
          {/* <Link to="/app/admin/teachers/create" className="btn btn--primary">+ Create Teacher</Link> */}
        </div>
      </div>

      <div className="admin-toolbar">
        <div className="input-wrap mr26">
          <input
            placeholder="Search by ID, username, email, or role…"
            value={q}
            onChange={(e)=>{ setPage(1); setQ(e.target.value); }}
          />
        </div>
        <div className="filters">
          <select value={role} onChange={e=>{ setPage(1); setRole(e.target.value); }}>
            {ROLES.map(r => <option key={r} value={r}>{r[0].toUpperCase()+r.slice(1)}</option>)}
          </select>

          <div className="sorter">
            <label>Sort</label>
            <button className={`chip ${sortBy==='id'?'chip--active':''}`} onClick={()=>toggleSort('id')}>
              ID {sortBy==='id' ? (dir==='asc'?'▲':'▼') : ''}
            </button>
            <button className={`chip ${sortBy==='username'?'chip--active':''}`} onClick={()=>toggleSort('username')}>
              Username {sortBy==='username' ? (dir==='asc'?'▲':'▼') : ''}
            </button>
            <button className={`chip ${sortBy==='email'?'chip--active':''}`} onClick={()=>toggleSort('email')}>
              Email {sortBy==='email' ? (dir==='asc'?'▲':'▼') : ''}
            </button>
            <button className={`chip ${sortBy==='role'?'chip--active':''}`} onClick={()=>toggleSort('role')}>
              Role {sortBy==='role' ? (dir==='asc'?'▲':'▼') : ''}
            </button>
          </div>
        </div>
      </div>

      <div className="admin-card">
        {err && <div className="alert alert--error">{err}</div>}
        {loading ? (
          <SkeletonTable />
        ) : filtered.length === 0 ? (
          <div className="admin-empty">
            No users found. Try clearing filters or search.
          </div>
        ) : (
          <>
            <div className="table-wrap">
              <table className="tbl">
                <thead>
                  <tr>
                    <th style={{width:80}}>ID</th>
                    <th>Username</th>
                    <th>Email</th>
                    <th style={{width:140}}>Role</th>
                  </tr>
                </thead>
                <tbody>
                  {sliced.map(r => (
                    <tr key={r.id}>
                      <td className="mono">{r.id}</td>
                      <td>{r.username}</td>
                      <td className="muted">{r.email}</td>
                      <td>
                        <span className={`badge badge--${r.role}`}>
                          {r.role}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Pager
              page={pageSafe}
              totalPages={totalPages}
              onPrev={()=> setPage(p => Math.max(1, p-1))}
              onNext={()=> setPage(p => Math.min(totalPages, p+1))}
              onJump={(n)=> setPage(n)}
            />
          </>
        )}
      </div>
    </div>
  );
}

function Pager({ page, totalPages, onPrev, onNext, onJump }) {
  const pages = [];
  for (let i = 1; i <= totalPages; i++) pages.push(i);
  return (
    <div className="pager">
      <button className="btn mr5" onClick={onPrev} disabled={page<=1}>Prev</button>
      <div className="pager-pages">
        {pages.map(n=>(
          <button
            key={n}
            className={`pg ${n===page?'pg--active':''}`}
            onClick={()=> onJump(n)}
          >{n}</button>
        ))}
      </div>
      <button className="btn ml5" onClick={onNext} disabled={page>=totalPages}>Next</button>
    </div>
  );
}

function SkeletonTable() {
  return (
    <div className="table-wrap">
      <table className="tbl">
        <thead>
          <tr><th>ID</th><th>Username</th><th>Email</th><th>Role</th></tr>
        </thead>
        <tbody>
          {Array.from({length:8}).map((_,i)=>(
            <tr key={i} className="skeleton-row">
              <td><div className="sk sk--sm" /></td>
              <td><div className="sk" /></td>
              <td><div className="sk" /></td>
              <td><div className="sk sk--tag" /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
