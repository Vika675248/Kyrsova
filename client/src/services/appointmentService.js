import api from './api';

/**
 * Сервіс для роботи з записами на ремонт
 */
const appointmentService = {
  /**
   * Отримати записи користувача
   */
  getAll: async (params = {}) => {
    const response = await api.get('/appointments', { params });
    return response.data;
  },

  /**
   * Отримати мої записи
   */
  getMyAppointments: async (params = {}) => {
    const response = await api.get('/appointments/my', { params });
    return response.data;
  },

  /**
   * Отримати запис за ID
   */
  getById: async (id) => {
    const response = await api.get(`/appointments/${id}`);
    return response.data;
  },

  /**
   * Створити новий запис
   */
  create: async (data) => {
    const response = await api.post('/appointments', data);
    return response.data;
  },

  /**
   * Оновити запис
   */
  update: async (id, data) => {
    const response = await api.put(`/appointments/${id}`, data);
    return response.data;
  },

  /**
   * Скасувати запис
   */
  cancel: async (id) => {
    const response = await api.delete(`/appointments/${id}`);
    return response.data;
  },

  /**
   * Додати фото до запису
   */
  addPhotos: async (id, formData) => {
    const response = await api.post(`/appointments/${id}/photos`, formData);
    return response.data;
  },

  /**
   * Видалити фото
   */
  deletePhoto: async (appointmentId, photoId) => {
    const response = await api.delete(`/appointments/${appointmentId}/photos/${photoId}`);
    return response.data;
  },

  /**
   * Додати оцінку
   */
  addRating: async (id, data) => {
    const response = await api.post(`/appointments/${id}/rating`, data);
    return response.data;
  },

  /**
   * Додати відгук
   */
  addReview: async (id, data) => {
    const response = await api.post(`/appointments/${id}/review`, data);
    return response.data;
  },

  /**
   * Завантажити фото
   */
  uploadPhotos: async (id, formData) => {
    const response = await api.post(`/appointments/${id}/photos`, formData);
    return response.data;
  },

  /**
   * Отримати історію ремонтів авто
   */
  getCarHistory: async (licensePlate) => {
    const response = await api.get(`/appointments/history/${encodeURIComponent(licensePlate)}`);
    return response.data;
  },

  /**
   * Отримати історію за держ. номером
   */
  getHistory: async (licensePlate) => {
    const response = await api.get(`/appointments/history/${encodeURIComponent(licensePlate)}`);
    return response.data;
  },

  /**
   * Отримати доступні слоти на дату
   */
  getAvailableSlots: async (date) => {
    const response = await api.get(`/appointments/slots/${date}`);
    return response.data;
  }
};

export default appointmentService;
