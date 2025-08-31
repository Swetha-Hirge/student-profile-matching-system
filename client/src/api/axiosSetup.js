// src/api/axiosSetup.js
import axios from 'axios';

// If you use a base URL via env, keep it here. Otherwise leave blank and rely on CRA proxy.
axios.defaults.baseURL = process.env.REACT_APP_API_BASE || '';
axios.defaults.headers.common['Content-Type'] = 'application/json';

// Always attach the latest token from localStorage on every request
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token'); // <-- we will save to this key after login
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    delete config.headers.Authorization;
  }
  return config;
});

export default axios; // optional export if you prefer importing this file as an axios instance
