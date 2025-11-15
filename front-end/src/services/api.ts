import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authService = {
  login: async (email: string, password: string) => {
    const response = await api.post('/api/auth/login', { email, password });
    return response.data;
  },

  register: async (name: string, email: string, password: string) => {
    const response = await api.post('/api/auth/register', { name, email, password });
    return response.data;
  },

  getMe: async () => {
    const response = await api.get('/api/auth/me');
    return response.data.user;
  }
};

export const transactionService = {
  getTransactions: async () => {
    const response = await api.get('/api/transactions');
    return response.data.transactions;
  },

  createTransaction: async (data: any) => {
    const response = await api.post('/api/transactions', data);
    return response.data.transaction;
  },

  updateTransaction: async (id: string, data: any) => {
    const response = await api.put(`/api/transactions/${id}`, data);
    return response.data.transaction;
  },

  deleteTransaction: async (id: string) => {
    await api.delete(`/api/transactions/${id}`);
  }
};

export const aiService = {
  classifyTransaction: async (description: string, amount: number) => {
    const response = await api.post('/api/ai/classify', { description, amount });
    return response.data.classification;
  },

  getMonthSummary: async (year: number, month: number) => {
    const response = await api.get(`/api/ai/month-summary/${year}/${month}`);
    return response.data.summary;
  }
};

export default api;