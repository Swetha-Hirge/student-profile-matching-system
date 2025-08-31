import { useEffect, useState } from 'react';
import axios from '../../utils/axiosInstance';

const ActivityManager = () => {
  const [activities, setActivities] = useState([]);
  const [form, setForm] = useState({ title: '', description: '', difficulty: '' });

  const loadActivities = async () => {
    const res = await axios.get('/api/activities');
    setActivities(res.data);
  };

  const createActivity = async () => {
    try {
      await axios.post('/api/activities', form);
      setForm({ title: '', description: '', difficulty: '' });
      loadActivities();
    } catch (err) {
      alert('❌ Failed to create activity');
    }
  };

  useEffect(() => {
    loadActivities();
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">⚙️ Activities</h2>

      <div className="mb-4 space-y-2">
        <input placeholder="Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="border p-2 w-full" />
        <textarea placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="border p-2 w-full" />
        <input placeholder="Difficulty" value={form.difficulty} onChange={e => setForm({ ...form, difficulty: e.target.value })} className="border p-2 w-full" />
        <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={createActivity}>Add Activity</button>
      </div>

      <ul className="space-y-2">
        {activities.map(a => (
          <li key={a.id} className="border p-2 rounded">{a.title} - {a.difficulty}</li>
        ))}
      </ul>
    </div>
  );
};

export default ActivityManager;
