import api from './api';

/**
 * Сервіс для роботи з послугами
 */
const serviceService = {
  /**
   * Отримати всі послуги
   */
  getAll: async (params = {}) => {
    const response = await api.get('/services', { params });
    return response.data;
  },

  /**
   * Отримати послугу за ID
   */
  getById: async (id) => {
    const response = await api.get(`/services/${id}`);
    return response.data;
  },

  /**
   * Отримати послуги згруповані за категоріями
   */
  getByCategories: async () => {
    const response = await api.get('/services/categories');
    return response.data;
  },

  /**
   * Створити послугу (для адміна)
   */
  create: async (data) => {
    const response = await api.post('/services', data);
    return response.data;
  },

  /**
   * Оновити послугу (для адміна)
   */
  update: async (id, data) => {
    const response = await api.put(`/services/${id}`, data);
    return response.data;
  },

  /**
   * Видалити послугу (для адміна)
   */
  delete: async (id) => {
    const response = await api.delete(`/services/${id}`);
    return response.data;
  }
};

export default serviceService;
