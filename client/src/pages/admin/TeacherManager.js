import { useEffect, useState } from 'react';
import axios from '../../utils/axiosInstance';

const TeacherManager = () => {
  const [teachers, setTeachers] = useState([]);
  const [form, setForm] = useState({ name: '', email: '', subject: '' });

  const loadTeachers = async () => {
    const res = await axios.get('/api/teachers');
    setTeachers(res.data);
  };

  const createTeacher = async () => {
    try {
      await axios.post('/api/teachers', form);
      setForm({ name: '', email: '', subject: '' });
      loadTeachers();
    } catch (err) {
      alert('❌ Failed to create teacher');
    }
  };

  useEffect(() => {
    loadTeachers();
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">📚 Teachers</h2>

      <div className="mb-4 space-y-2">
        <input placeholder="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="border p-2 w-full" />
        <input placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="border p-2 w-full" />
        <input placeholder="Subject" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} className="border p-2 w-full" />
        <button className="bg-green-600 text-white px-4 py-2 rounded" onClick={createTeacher}>Add Teacher</button>
      </div>

      <ul className="space-y-2">
        {teachers.map(t => (
          <li key={t.id} className="border p-2 rounded">{t.name} - {t.subject}</li>
        ))}
      </ul>
    </div>
  );
};

export default TeacherManager;
