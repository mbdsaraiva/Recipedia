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
  getAll: () => api.get('/api/users'),
  getById: (id) => api.get(`/api/users/${id}`),
};

export const stockService = {
  getUserStock: (userId) => api.get(`/api/stock/${userId}`),
  getExpiring: (userId, days = 3) => api.get(`/api/stock/${userId}/expiring?days=${days}`),
  addToStock: (userId, data) => api.post(`/api/stock/${userId}`, data),
  removeItem: (userId, ingredientId) => api.delete(`/api/stock/${userId}/${ingredientId}`),
  consumeIngredient: (userId, ingredientId, quantidade) => 
    api.patch(`/api/stock/${userId}/${ingredientId}/consume`, { quantidade }),
};

export const recipeService = {
  getAll: () => api.get('/api/recipes'),
  getCanMake: (userId) => api.get(`/api/recipes/can-make/${userId}`),
};

export const ingredientService = {
  getAll: () => api.get('/api/ingredients'),
  getById: (id) => api.get(`/api/ingredients/${id}`),
  create: (data) => api.post('/api/ingredients', data),
  update: (id, data) => api.put(`/api/ingredients/${id}`, data),
  delete: (id) => api.delete(`/api/ingredients/${id}`),
  search: (query) => api.get(`/api/ingredients/search?q=${encodeURIComponent(query)}`),
  getStats: () => api.get('/api/ingredients/stats'),
};

export default api;