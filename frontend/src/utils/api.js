import axios from 'axios';




const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api` || "http://localhost:5001/api",
  withCredentials: true // Important for cookies
});



export default api;