// src/api/http.js
import axios from 'axios';

const http = axios.create({
  baseURL: process.env.REACT_APP_API_BASE || 'http://localhost:5000',
  withCredentials: true,
});

// attach token if present
http.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default http;
