import { useContext } from 'react';
import { AuthContext } from '../context/authContext';

const Dashboard = () => {
  const { user } = useContext(AuthContext);

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold">Welcome, {user?.username}</h1>
      <p>Role: {user?.role}</p>
      {/* Buttons/Links to Teacher or Student panels */}
    </div>
  );
};

export default Dashboard;
