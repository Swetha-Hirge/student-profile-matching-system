// src/pages/Dashboard.jsx
import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/authContext';
import './Dashboard.css';

export default function Dashboard(){
  const { user } = useContext(AuthContext);

  return (
    <div className="db-root">
      <div className="db-header">
        <div>
          <h1 className="db-title">Welcome, {user?.username || 'User'}</h1>
          <div className="db-subtitle">Role: {user?.role}</div>
        </div>
        <div className="db-actions">
          {user?.role === 'teacher' && (
            <>
              <Link to="/app/teacher/dashboard" className="db-btn db-btn--primary">Teacher Dashboard</Link>
              <Link to="/app/teacher/students/create" className="db-btn">Add Student</Link>
            </>
          )}
          {user?.role === 'student' && (
            <Link to="/app/student/dashboard" className="db-btn db-btn--primary">Student Dashboard</Link>
          )}
          {user?.role === 'admin' && (
            <Link to="/app/admin" className="db-btn db-btn--primary">Admin Dashboard</Link>
          )}
        </div>
      </div>

      <div className="db-grid">
        <section className="db-card db-card--third">
          <div className="db-card__head">
            <h3 className="db-card__title">Quick links</h3>
          </div>
          <div style={{display:'grid', gap:10}}>
            <Link to="/app/dashboard" className="db-btn">Home</Link>
            {user?.role === 'teacher' && (
              <>
                <Link to="/app/teacher/students/create" className="db-btn">Create Student</Link>
                <Link to="/app/teacher/dashboard" className="db-btn">Manage Students</Link>
              </>
            )}
            {user?.role === 'admin' && (
              <>
                <Link to="/app/admin/users" className="db-btn">Users</Link>
                <Link to="/app/admin/activities" className="db-btn">Activities</Link>
              </>
            )}
          </div>
        </section>

        <section className="db-card db-card--half">
          <div className="db-card__head">
            <h3 className="db-card__title">About</h3>
          </div>
          <p>
            Student Matching System recommends activities based on student disability and learning style.
            Teachers can add students and generate recommendations; Admins manage users/activities; Students review their recommendations.
          </p>
        </section>
      </div>
    </div>
  );
}
