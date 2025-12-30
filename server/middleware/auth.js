const jwt = require('jsonwebtoken');
const config = require('../config');
const User = require('../models/User');

/**
 * Middleware: Захист маршрутів (авторизація)
 * Перевіряє наявність та валідність JWT токена
 */
const protect = async (req, res, next) => {
  let token;

  // Перевіряємо наявність токена в заголовках
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    // Отримуємо токен з заголовка
    token = req.headers.authorization.split(' ')[1];
  }

  // Перевіряємо наявність токена
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Доступ заборонено. Необхідна авторизація.'
    });
  }

  try {
    // Верифікуємо токен
    const decoded = jwt.verify(token, config.jwtSecret);

    // Шукаємо користувача за ID з токена
    req.user = await User.findById(decoded.id);

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Користувача не знайдено'
      });
    }

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Недійсний токен авторизації'
    });
  }
};

/**
 * Middleware: Перевірка ролі користувача
 * @param {...string} roles - Дозволені ролі
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Роль '${req.user.role}' не має доступу до цього ресурсу`
      });
    }
    next();
  };
};

/**
 * Middleware: Опціональна авторизація
 * Додає користувача до запиту, якщо токен валідний
 */
const optionalAuth = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, config.jwtSecret);
      req.user = await User.findById(decoded.id);
    } catch (error) {
      // Токен невалідний, продовжуємо без користувача
      req.user = null;
    }
  }

  next();
};

module.exports = {
  protect,
  authorize,
  optionalAuth
};
