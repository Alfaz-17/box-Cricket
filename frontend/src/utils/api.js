import axios from 'axios';

const api = axios.create({
  baseURL:`${import.meta.env.VITE_API_BASE_URL}/api` || "http://172.20.10.2:5001/api"
});

// ✅ Automatically attach token from localStorage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
