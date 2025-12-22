import axios from 'axios'

export const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://172.20.10.2:5001';

const api = axios.create({
  baseURL: `${BASE_URL}/api`,
})

// ✅ Automatically attach token from localStorage
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default api
