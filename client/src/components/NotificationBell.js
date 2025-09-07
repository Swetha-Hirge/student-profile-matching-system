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
        // ✅ Make sure it's always an array
        setItems(Array.isArray(data) ? data : []);
      } catch (e) {
        console.warn('Error fetching notifications', e);
        setItems([]); // fallback
      }
    };
    fetchNotifications();
    t = setInterval(fetchNotifications, 30000);
    return () => clearInterval(t);
  }, [user]);

  if (!user) return null;

  const unreadCount = Array.isArray(items)
    ? items.filter((n) => !n.isRead).length
    : 0;

  return (
    <button className="notif-bell" type="button">
      🔔 {unreadCount}
    </button>
  );
}
