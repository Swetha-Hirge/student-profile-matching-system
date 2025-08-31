import { useContext, useEffect, useState } from 'react';
import http from '../api/http';
import { AuthContext } from '../context/authContext';
import { useNavigate } from 'react-router-dom';

export default function TeacherDashboard() {
  const { user } = useContext(AuthContext);
  const [students, setStudents] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;
    if (user.role !== 'teacher') {
      navigate('/student/dashboard');
      return;
    }
    (async () => {
      try {
        const { data } = await http.get('/api/students');
        setStudents(data);
      } catch (e) {
        // If unauthorized/forbidden, bounce to login
        if (e?.response?.status === 401 || e?.response?.status === 403) {
          navigate('/login');
        }
      }
    })();
  }, [user, navigate]);

  if (!user) return null;

  return (
    <div>
      <h1>Teacher Dashboard</h1>
      <ul>
        {students.map(s => (
          <li key={s.id}>{s.user?.username || 'Unnamed'} — {s.user?.email}</li>
        ))}
      </ul>
    </div>
  );
}
