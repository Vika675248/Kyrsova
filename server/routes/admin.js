const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  // Користувачі
  getAllUsers,
  getUser,
  updateUser,
  deleteUser,
  
  // Послуги
  getAllServices,
  createService,
  updateService,
  deleteService,
  toggleServiceStatus,
  
  // Записи
  getAllAppointments,
  updateAppointmentStatus,
  deleteAppointment,
  
  // Статистика
  getStatistics
} = require('../controllers/adminController');

// Всі маршрути захищені та доступні тільки адміністраторам
router.use(protect);
router.use(authorize('admin'));

/**
 * ===========================================
 * МАРШРУТИ ДЛЯ УПРАВЛІННЯ КОРИСТУВАЧАМИ
 * ===========================================
 */

// GET /api/admin/users - Отримати всіх користувачів
router.get('/users', getAllUsers);

// GET /api/admin/users/:id - Отримати одного користувача
router.get('/users/:id', getUser);

// PUT /api/admin/users/:id - Оновити користувача
router.put('/users/:id', updateUser);

// DELETE /api/admin/users/:id - Видалити користувача
router.delete('/users/:id', deleteUser);

/**
 * ===========================================
 * МАРШРУТИ ДЛЯ УПРАВЛІННЯ ПОСЛУГАМИ
 * ===========================================
 */

// GET /api/admin/services - Отримати всі послуги (включно з неактивними)
router.get('/services', getAllServices);

// POST /api/admin/services - Створити послугу
router.post('/services', createService);

// PUT /api/admin/services/:id - Оновити послугу
router.put('/services/:id', updateService);

// DELETE /api/admin/services/:id - Видалити послугу
router.delete('/services/:id', deleteService);

// PATCH /api/admin/services/:id/toggle - Деактивувати/активувати послугу
router.patch('/services/:id/toggle', toggleServiceStatus);

/**
 * ===========================================
 * МАРШРУТИ ДЛЯ УПРАВЛІННЯ ЗАПИСАМИ
 * ===========================================
 */

// GET /api/admin/appointments - Отримати всі записи
router.get('/appointments', getAllAppointments);

// PATCH /api/admin/appointments/:id/status - Оновити статус запису
router.patch('/appointments/:id/status', updateAppointmentStatus);

// DELETE /api/admin/appointments/:id - Видалити запис
router.delete('/appointments/:id', deleteAppointment);

/**
 * ===========================================
 * МАРШРУТИ ДЛЯ СТАТИСТИКИ
 * ===========================================
 */

// GET /api/admin/statistics - Отримати загальну статистику
router.get('/statistics', getStatistics);

module.exports = router;
