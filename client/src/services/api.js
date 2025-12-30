import axios from 'axios';

/**
 * Налаштування Axios для API запитів
 */
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000
});

// Інтерцептор запитів
api.interceptors.request.use(
  (config) => {
    // Додаємо токен з localStorage, якщо є
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Інтерцептор відповідей
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Обробка помилок
    if (error.response) {
      // Помилка 401 - невалідний токен
      if (error.response.status === 401) {
        localStorage.removeItem('token');
        // Перенаправлення на логін (опціонально)
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
