import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">🛠️ Admin Dashboard</h1>

      <ul className="space-y-3">
        <li>
          <Link to="/admin/users" className="text-blue-600 underline">👥 View All Users</Link>
        </li>
        <li>
          <Link to="/admin/teachers" className="text-blue-600 underline">📚 Manage Teachers</Link>
        </li>
        <li>
          <Link to="/admin/activities" className="text-blue-600 underline">⚙️ Manage Activities</Link>
        </li>
      </ul>
    </div>
  );
};

export default AdminDashboard;
