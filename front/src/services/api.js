import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000',
  timeout: 10000,
});

export const apiUtils = {
  healthCheck: () => api.get('/'),
  
  handleError: (error) => {
    if (error.response) {
      return {
        message: error.response.data?.error || 'Erro no servidor',
        status: error.response.status,
      };
    }
    return {
      message: 'Erro de conexão',
      status: 0,
    };
  }
};

export const userService = {
  getAll: () => api.get('/users'),
  getById: (id) => api.get(`/users/${id}`),
};

export const stockService = {
  getUserStock: (userId) => api.get(`/stock/${userId}`),
  getExpiring: (userId, days = 3) => api.get(`/stock/${userId}/expiring?days=${days}`),
};

export const recipeService = {
  getAll: () => api.get('/recipes'),
  getCanMake: (userId) => api.get(`/recipes/can-make/${userId}`),
};

export default api;