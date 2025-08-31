import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/authContext';
import axios from '../utils/axiosInstance';

const StudentDashboard = () => {
  const { user } = useContext(AuthContext);
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await axios.get(`/api/students/${user?.id}/recommendations`);
        setRecommendations(res.data);
      } catch (err) {
        console.error('Failed to load recommendations');
      }
    };
    if (user?.role === 'student') fetch();
  }, [user]);

  if (!user || user.role !== 'student') {
    return <div className="p-4">Access Denied</div>;
  }

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">📚 Your Activity Recommendations</h2>

      {recommendations.length === 0 ? (
        <p>No recommendations yet</p>
      ) : (
        <ul className="space-y-2">
          {recommendations.map((r, index) => (
            <li key={index} className="p-4 border rounded">
                <p><strong>Activity:</strong> {r.Activity?.title}</p>
                <p><strong>Score:</strong> {r.score.toFixed(2)}</p>
                <p><strong>Description:</strong> {r.Activity?.description}</p>
                <a
                href={`/feedback/${r.id}`}
                className="text-blue-600 underline mt-2 inline-block">
                    📝 Submit Feedback
                    </a>
            </li>
             ))}
        </ul>
      )}
    </div>
  );
};

export default StudentDashboard;
