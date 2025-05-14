import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5001/api',
  withCredentials: true // Important for cookies
});

// Add a request interceptor
api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const boxApi = {
  create: (data) => api.post('/box/create', data),
  update: (id, data) => api.put(`/box/update/${id}`, data),
  delete: (id) => api.delete(`/box/delete/${id}`),
  getAll: () => api.get('/public/boxes'),
  getById: (id) => api.get(`/public/boxes/${id}`),
};

export const bookingApi = {
  checkSlot: (data) => api.post('/booking/check-slot', data),
  create: (data) => api.post('/booking/create-checkout', data),
  getMyBookings: () => api.get('/booking/my-booking'),
  cancel: (id) => api.post(`/booking/cancel/${id}`),
};

export const authApi = {
  login: (data) => api.post('/auth/login', data),
  signup: (data) => api.post('/auth/signup', data),
  me: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
};

export const ownerApi = {
  blockTime: (data) => api.post('/owners/blocktime', data),
  getBookings: () => api.get('/owners/booking'),
};

export default api;