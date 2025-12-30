const express = require('express');
const cors = require('cors');
const path = require('path');
const config = require('./config');
const connectDB = require('./config/database');
const { errorHandler } = require('./middleware/error');

// Імпорт маршрутів
const {
  authRoutes,
  serviceRoutes,
  appointmentRoutes,
  calculatorRoutes,
  adminRoutes
} = require('./routes');

// Ініціалізація Express
const app = express();

// Підключення до бази даних
connectDB();

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Статичні файли (завантажені зображення)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API маршрути
app.use('/api/auth', authRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/calculator', calculatorRoutes);
app.use('/api/admin', adminRoutes);

// Головний маршрут API
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'Ласкаво просимо до API Автосервісу',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      services: '/api/services',
      appointments: '/api/appointments',
      calculator: '/api/calculator',
      admin: '/api/admin'
    }
  });
});

// Статичні файли для production (React build)
if (config.nodeEnv === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build/index.html'));
  });
}

// Обробка 404
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: 'Маршрут не знайдено'
  });
});

// Обробка помилок
app.use(errorHandler);

// Запуск сервера
const PORT = config.port;

const server = app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════╗
║                                                        ║
║   🚗 Автосервіс API Server                             ║
║                                                        ║
║   Сервер запущено в режимі: ${config.nodeEnv.padEnd(20)}       ║
║   Порт: ${PORT}                                           ║
║   URL: http://localhost:${PORT}                           ║
║                                                        ║
╚════════════════════════════════════════════════════════╝
  `);
});

// Обробка необроблених відхилень промісів
process.on('unhandledRejection', (err, promise) => {
  console.error(`❌ Unhandled Rejection: ${err.message}`);
  // Закриваємо сервер та виходимо з процесу
  server.close(() => process.exit(1));
});

// Обробка SIGTERM
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM отримано. Закриття сервера...');
  server.close(() => {
    console.log('✅ Сервер закрито');
    process.exit(0);
  });
});

module.exports = app;
