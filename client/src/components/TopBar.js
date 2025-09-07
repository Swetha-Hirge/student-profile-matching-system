import { Link, useLocation } from 'react-router-dom';
import NotificationBell from './NotificationBell';
import { useAuth } from '../context/authContext';
import './TopBar.css';

export default function TopBar() {
  const { logout, user } = useAuth();
  const location = useLocation();

  return (
    <header className="tb-root">
      <div className="tb-left">
        <Link to="/app/dashboard" className="tb-brand">🧠 Learning System</Link>
        <nav className="tb-nav">
          {user?.role === 'teacher' && (
            <>
              <Link to="/app/teacher/dashboard" className={`tb-link${location.pathname.startsWith('/app/teacher') ? ' is-active' : ''}`}>Students</Link>
              <Link to="/app/teacher/students/create" className="tb-btn">Add Student</Link>
            </>
          )}
          {user?.role === 'admin' && (
            <>
              <Link to="/app/admin/users" className="tb-link">Users</Link>
              <Link to="/app/admin/activities" className="tb-link">Activities</Link>
            </>
          )}
          {user?.role === 'student' && (
            <Link to="/app/student/dashboard" className={`tb-link${location.pathname.startsWith('/app/student') ? ' is-active' : ''}`}>My Dashboard</Link>
          )}
        </nav>
      </div>

      <div className="tb-right">
        <NotificationBell />
        <button type="button" className="tb-btn tb-btn--ghost" onClick={logout}>Logout</button>
      </div>
    </header>
  );
}
