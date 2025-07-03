import axios from 'axios';

const api = axios.create({
  baseURL: 'https://box-cricket-rd1r.onrender.com/api',
  withCredentials: true // Important for cookies
});



export default api;