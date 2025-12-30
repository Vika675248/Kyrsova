import api from './api';

/**
 * Сервіс адміністрування
 */
const adminService = {
  /**
   * ===========================================
   * УПРАВЛІННЯ КОРИСТУВАЧАМИ
   * ===========================================
   */
  
  // Отримати всіх користувачів
  getAllUsers: async (params) => {
    const response = await api.get('/admin/users', { params });
    return response.data;
  },

  // Отримати одного користувача
  getUser: async (id) => {
    const response = await api.get(`/admin/users/${id}`);
    return response.data;
  },

  // Оновити користувача
  updateUser: async (id, data) => {
    const response = await api.put(`/admin/users/${id}`, data);
    return response.data;
  },

  // Видалити користувача
  deleteUser: async (id) => {
    const response = await api.delete(`/admin/users/${id}`);
    return response.data;
  },

  /**
   * ===========================================
   * УПРАВЛІННЯ ПОСЛУГАМИ
   * ===========================================
   */

  // Отримати всі послуги (адмін)
  getAllServices: async (params = {}) => {
    const response = await api.get('/admin/services', { params });
    return response.data;
  },

  // Створити послугу
  createService: async (data) => {
    const response = await api.post('/admin/services', data);
    return response.data;
  },

  // Оновити послугу
  updateService: async (id, data) => {
    const response = await api.put(`/admin/services/${id}`, data);
    return response.data;
  },

  // Видалити послугу
  deleteService: async (id) => {
    const response = await api.delete(`/admin/services/${id}`);
    return response.data;
  },

  // Деактивувати/активувати послугу
  toggleService: async (id) => {
    const response = await api.patch(`/admin/services/${id}/toggle`);
    return response.data;
  },

  /**
   * ===========================================
   * УПРАВЛІННЯ ЗАПИСАМИ
   * ===========================================
   */

  // Отримати всі записи
  getAllAppointments: async (params) => {
    const response = await api.get('/admin/appointments', { params });
    return response.data;
  },

  // Оновити статус запису
  updateAppointmentStatus: async (id, status) => {
    const response = await api.patch(`/admin/appointments/${id}/status`, { status });
    return response.data;
  },

  // Видалити запис
  deleteAppointment: async (id) => {
    const response = await api.delete(`/admin/appointments/${id}`);
    return response.data;
  },

  /**
   * ===========================================
   * СТАТИСТИКА
   * ===========================================
   */

  // Отримати статистику
  getStatistics: async () => {
    const response = await api.get('/admin/statistics');
    return response.data;
  }
};

export default adminService;
