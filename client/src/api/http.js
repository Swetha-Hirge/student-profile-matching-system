import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_BASE || ''; // dev & prod ready

const http = axios.create({
  baseURL: API_BASE,
  withCredentials: true, // send/receive httpOnly cookie
  headers: { 'Content-Type': 'application/json' },
});

// Attach Bearer if stored
http.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default http;
