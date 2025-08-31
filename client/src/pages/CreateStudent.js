import { useState } from 'react';
import axios from '../utils/axiosInstance';
import { useNavigate } from 'react-router-dom';

const CreateStudent = () => {
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    disability: '',
    learningStyle: ''
  });

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/teachers/students', form);
      alert('Student created!');
      navigate('/dashboard');
    } catch (err) {
      console.error('Create error:', err);
      alert('Failed to create student');
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">➕ Create Student</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        {Object.keys(form).map(key => (
          <input
            key={key}
            placeholder={key}
            value={form[key]}
            onChange={e => setForm({ ...form, [key]: e.target.value })}
            className="w-full p-2 border rounded"
          />
        ))}
        <button className="bg-green-600 text-white px-4 py-2 rounded">Submit</button>
      </form>
    </div>
  );
};

export default CreateStudent;
