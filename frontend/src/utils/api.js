import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();



const api = axios.create({
  baseURL: process.env.BASE_URL || 'http://localhost:5001/api',
  withCredentials: true // Important for cookies
});



export default api;