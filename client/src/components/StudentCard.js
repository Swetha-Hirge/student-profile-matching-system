import { Link } from 'react-router-dom';
import axios from 'axios';

const StudentCard = ({ student }) => {
  const handleGenerate = async () => {
    try {
      const res = await axios.post(`/api/students/${student.id}/recommendations`);
      alert(`✅ Recommendation created: ${res.data.matchedActivity?.title}`);
    } catch (err) {
      alert(err.response?.data?.message || '❌ Failed to generate recommendation');
    }
  };

  return (
    <div className="border p-4 rounded shadow-sm">
      <h3 className="text-lg font-semibold">{student.user?.username}</h3>
      <p>Disability: {student.disability}</p>
      <p>Learning Style: {student.learningStyle}</p>

      <div className="flex gap-4 mt-3">
        <Link
          to={`/teacher/students/${student.id}/recommendations`}
          className="text-blue-600 underline"
        >
          View Recommendations
        </Link>

        <button
          className="bg-purple-600 text-white px-3 py-1 rounded"
          onClick={handleGenerate}
        >
          🎯 Generate Match
        </button>
      </div>
    </div>
  );
};

export default StudentCard;
