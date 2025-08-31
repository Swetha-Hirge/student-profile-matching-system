import { useContext, useEffect, useState } from 'react';
import http from '../api/http';
import { AuthContext } from '../context/authContext';

export default function NotificationBell() {
  const { user } = useContext(AuthContext);
  const [items, setItems] = useState([]);

  useEffect(() => {
    if (!user) return;
    let t;
    const fetchNotifications = async () => {
      try {
        const { data } = await http.get('/api/notifications');
        setItems(data);
      } catch (e) {
        // console.log('Error fetching notifications', e);
      }
    };
    fetchNotifications();
    t = setInterval(fetchNotifications, 30000);
    return () => clearInterval(t);
  }, [user]);

  if (!user) return null;

  return (
    <button className="notif-bell">
      🔔 {items.filter(n => !n.isRead).length}
    </button>
  );
}
