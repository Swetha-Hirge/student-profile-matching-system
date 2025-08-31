import { useState } from 'react';
import axios from '../utils/axiosInstance';
import { useNavigate, useParams } from 'react-router-dom';

const SubmitFeedback = () => {
  const { recommendationId } = useParams();
  const navigate = useNavigate();
  const [feedback, setFeedback] = useState({
    comment: '',
    score: ''
  });

  const handleChange = (e) => {
    setFeedback({ ...feedback, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/feedback', {
        recommendationId,
        ...feedback
      });
      alert('✅ Feedback submitted!');
      navigate('/student/dashboard');
    } catch (err) {
      console.error(err);
      alert('❌ Failed to submit feedback');
    }
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <h2 className="text-xl font-bold mb-4">📝 Submit Feedback</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <textarea
          name="comment"
          placeholder="Your feedback"
          value={feedback.comment}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          rows={4}
          required
        />
        <input
          type="number"
          step="0.1"
          name="score"
          placeholder="Rating (0-5)"
          value={feedback.score}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
        <button className="bg-green-600 text-white px-4 py-2 rounded">
          Submit
        </button>
      </form>
    </div>
  );
};

export default SubmitFeedback;
