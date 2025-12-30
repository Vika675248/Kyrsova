import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

// Створення контексту
const AuthContext = createContext(null);

/**
 * Провайдер авторизації
 * Забезпечує доступ до даних користувача та функцій авторизації
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Завантаження даних користувача
   */
  const loadUser = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      const response = await api.get('/auth/me');
      setUser(response.data.data.user);
      setError(null);
    } catch (err) {
      console.error('Error loading user:', err);
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
      delete api.defaults.headers.common['Authorization'];
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Завантаження користувача при зміні токена
  useEffect(() => {
    loadUser();
  }, [loadUser]);

  /**
   * Реєстрація нового користувача
   */
  const register = async (userData) => {
    try {
      setError(null);
      const response = await api.post('/auth/register', userData);
      const { token: newToken, user: newUser } = response.data.data;

      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(newUser);
      api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;

      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || 'Помилка реєстрації';
      setError(message);
      return { success: false, message };
    }
  };

  /**
   * Авторизація користувача
   */
  const login = async (email, password) => {
    try {
      setError(null);
      const response = await api.post('/auth/login', { email, password });
      const { token: newToken, user: newUser } = response.data.data;

      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(newUser);
      api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;

      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || 'Помилка авторизації';
      setError(message);
      return { success: false, message };
    }
  };

  /**
   * Вихід з системи
   */
  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    delete api.defaults.headers.common['Authorization'];
  };

  /**
   * Оновлення профілю
   */
  const updateProfile = async (data) => {
    try {
      const response = await api.put('/auth/me', data);
      setUser(response.data.data.user);
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || 'Помилка оновлення профілю';
      return { success: false, message };
    }
  };

  /**
   * Додавання автомобіля
   */
  const addCar = async (carData) => {
    try {
      const response = await api.post('/auth/cars', carData);
      setUser(prev => ({ ...prev, cars: response.data.data.cars }));
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || 'Помилка додавання авто';
      return { success: false, message };
    }
  };

  /**
   * Видалення автомобіля
   */
  const removeCar = async (carId) => {
    try {
      const response = await api.delete(`/auth/cars/${carId}`);
      setUser(prev => ({ ...prev, cars: response.data.data.cars }));
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || 'Помилка видалення авто';
      return { success: false, message };
    }
  };

  // Значення контексту
  const value = {
    user,
    token,
    loading,
    error,
    isAuthenticated: !!user,
    register,
    login,
    logout,
    updateProfile,
    addCar,
    removeCar,
    loadUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Хук для використання контексту авторизації
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
