// import { createContext, useEffect, useMemo, useState, useCallback } from 'react';
// import http from '../api/http';

// export const AuthContext = createContext({
//   user: null,
//   setUser: () => {},
//   loading: true,
//   logout: () => {},
// });

// export const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);

//   const token = useMemo(() => localStorage.getItem('access_token') || null, []);

//   useEffect(() => {
//     if (token) {
//       http.defaults.headers.common.Authorization = `Bearer ${token}`;
//     } else {
//       delete http.defaults.headers.common.Authorization;
//     }
//   }, [token]);

//   useEffect(() => {
//     let cancelled = false;
//     const bootstrap = async () => {
//       try {
//         const { data } = await http.get('/api/auth/me');
//         if (!cancelled && data?.user) setUser(data.user);
//       } catch {
//         if (!cancelled) setUser(null);
//       } finally {
//         if (!cancelled) setLoading(false);
//       }
//     };
//     bootstrap();
//     return () => { cancelled = true; };
//   }, []);

//   const logout = useCallback(async () => {
//     try { await http.post('/api/auth/logout'); } catch {}
//     localStorage.removeItem('access_token');
//     delete http.defaults.headers.common.Authorization;
//     setUser(null);
//     window.location.href = '/login';
//   }, []);

//   return (
//     <AuthContext.Provider value={{ user, setUser, loading, logout }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

import { createContext, useState } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

