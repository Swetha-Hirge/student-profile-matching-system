// src/pages/admin/AdminDashboard.jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import http from '../../api/http';
import '../Dashboard.css';

export default function AdminDashboard(){
  const [users, setUsers] = useState([]);

  useEffect(()=>{
    let cancelled = false;
    (async ()=>{
      try{
        const { data } = await http.get('/api/admin/users');
        if(!cancelled) setUsers(data || []);
      } catch(e){ /* ignore */ }
    })();
    return ()=>{ cancelled = true; };
  },[]);

  const counts = users.reduce((acc,u)=>{
    acc[u.role] = (acc[u.role]||0)+1; return acc;
  },{});

  return (
    <div className="db-root">
      <div className="db-header">
        <div>
          <h1 className="db-title">Admin Dashboard</h1>
          <div className="db-subtitle">Manage users, teachers, and activities</div>
        </div>
        <div className="db-actions">
          <Link to="/app/admin/users" className="db-btn db-btn--primary">User List</Link>
          <Link to="/app/admin/teachers" className="db-btn">Teachers</Link>
          <Link to="/app/admin/activities" className="db-btn">Activities</Link>
        </div>
      </div>

      <div className="db-grid">
        <section className="db-card db-card--half">
          <div className="db-card__head"><h3 className="db-card__title">Overview</h3></div>
          <div className="db-kpis">
            <div className="db-kpi"><div className="db-kpi__label">Total Users</div><div className="db-kpi__value">{users.length}</div></div>
            <div className="db-kpi"><div className="db-kpi__label">Teachers</div><div className="db-kpi__value">{counts.teacher||0}</div></div>
            <div className="db-kpi"><div className="db-kpi__label">Students</div><div className="db-kpi__value">{counts.student||0}</div></div>
          </div>
        </section>

        <section className="db-card db-card--half">
          <div className="db-card__head">
            <h3 className="db-card__title">Recent Users</h3>
            <Link to="/app/admin/users" className="db-btn">View All</Link>
          </div>
          {users.length ? (
            <table className="db-table">
              <thead><tr><th>ID</th><th>Username</th><th>Email</th><th>Role</th></tr></thead>
              <tbody>
                {users.slice(0,10).map(u=>(
                  <tr key={u.id}>
                    <td>{u.id}</td><td>{u.username}</td><td>{u.email}</td><td>{u.role}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : <div className="db-empty">No users available.</div>}
        </section>
      </div>
    </div>
  );
}
