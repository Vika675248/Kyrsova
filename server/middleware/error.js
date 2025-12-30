/**
 * Middleware: Обробка помилок
 * Централізована обробка всіх помилок в додатку
 */
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Логування помилки в консоль (для розробки)
  if (process.env.NODE_ENV === 'development') {
    console.error('❌ Error:', err);
  }

  // Помилка невірного ObjectId MongoDB
  if (err.name === 'CastError') {
    const message = 'Ресурс не знайдено';
    error = { message, statusCode: 404 };
  }

  // Помилка дублікату ключа MongoDB
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const message = `${field} вже використовується`;
    error = { message, statusCode: 400 };
  }

  // Помилка валідації Mongoose
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message);
    error = { message, statusCode: 400 };
  }

  // Помилка JWT
  if (err.name === 'JsonWebTokenError') {
    const message = 'Недійсний токен авторизації';
    error = { message, statusCode: 401 };
  }

  // Помилка закінчення терміну дії JWT
  if (err.name === 'TokenExpiredError') {
    const message = 'Термін дії токена закінчився';
    error = { message, statusCode: 401 };
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Внутрішня помилка сервера',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

/**
 * Middleware: Обробка async/await помилок
 * Обгортка для асинхронних функцій
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = {
  errorHandler,
  asyncHandler
};
