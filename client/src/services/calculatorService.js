import api from './api';

/**
 * Сервіс калькулятора вартості ремонту
 */
const calculatorService = {
  /**
   * Розрахувати вартість ремонту
   */
  calculate: async (data) => {
    const response = await api.post('/calculator', data);
    return response.data;
  },

  /**
   * Отримати коефіцієнти калькулятора
   */
  getCoefficients: async () => {
    const response = await api.get('/calculator/coefficients');
    return response.data;
  },

  /**
   * Швидкий розрахунок для однієї послуги
   */
  quickCalculate: async (params) => {
    const response = await api.get('/calculator/quick', { params });
    return response.data;
  }
};

export default calculatorService;
