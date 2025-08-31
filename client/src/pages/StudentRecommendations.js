import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from '../utils/axiosInstance';

const StudentRecommendations = () => {
  const { id } = useParams();
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const res = await axios.get(`/api/students/${id}/recommendations`);
        setRecommendations(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchRecommendations();
  }, [id]);

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">📌 Recommendations</h2>
      {recommendations.length === 0 ? (
        <p>No matches found.</p>
      ) : (
        <ul className="list-disc ml-5">
          {recommendations.map(r => (
            <li key={r.activityId}>Activity ID: {r.activityId} – Score: {r.score.toFixed(2)}</li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default StudentRecommendations;
