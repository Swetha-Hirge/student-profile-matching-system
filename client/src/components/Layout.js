import { useContext } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { AuthContext } from '../context/authContext';
import NotificationBell from './NotificationBell';

const Layout = () => {
  const { user, logout } = useContext(AuthContext);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* Navbar */}
      <nav className="bg-blue-600 text-white px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">🧠 Learning System</h1>
        <div className="flex items-center space-x-4">
          {/* Links */}
          {user?.role === 'student' && (
            <Link to="/student/dashboard" className="hover:underline">My Activities</Link>
          )}
          {user?.role === 'teacher' && (
            <>
              <Link to="/teacher/dashboard" className="hover:underline">Students</Link>
              <Link to="/teacher/students/create" className="hover:underline">Add Student</Link>
            </>
          )}
          {user?.role === 'admin' && (
            <>
              <Link to="/admin" className="hover:underline">Dashboard</Link>
              <Link to="/admin/users" className="hover:underline">Users</Link>
              <Link to="/admin/teachers" className="hover:underline">Teachers</Link>
              <Link to="/admin/activities" className="hover:underline">Activities</Link>
            </>
          )}

          {/* 🔔 Notifications */}
          {user && <NotificationBell />}

          {/* 🔓 Logout/Login */}
          {user ? (
            <button onClick={logout} className="ml-4 bg-red-600 px-3 py-1 rounded">Logout</button>
          ) : (
            <Link to="/login" className="hover:underline">Login</Link>
          )}
        </div>
      </nav>

      {/* Page Content */}
      <main className="p-6">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
