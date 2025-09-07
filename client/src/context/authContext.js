import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import http from '../api/http';

export const AuthContext = createContext({
  user: null,
  loading: true,
  setUser: () => {},
  login: () => {},
  logout: () => {}
});
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On load: try /api/auth/me using token (if present)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await http.get('/api/auth/me');
        if (!cancelled) setUser(data.user || null);
      } catch {
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Called after successful /api/auth/login
  const login = useCallback((payload) => {
    const token = payload?.token;
    if (token) localStorage.setItem('access_token', token);
    // prefer backend's user object
    if (payload?.user) setUser(payload.user);
  }, []);

  const logout = useCallback(async () => {
    try { await http.post('/api/auth/logout'); } catch {}
    localStorage.removeItem('access_token');
    setUser(null);
    window.location.href = '/login';
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
