const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { uploadMultiple, handleUploadError } = require('../middleware/upload');
const {
  getAppointments,
  getMyAppointments,
  getAppointment,
  createAppointment,
  updateAppointment,
  cancelAppointment,
  addPhotos,
  deletePhoto,
  addRating,
  addReview,
  getCarHistory,
  getAvailableSlots,
  updateStatus
} = require('../controllers/appointmentController');

/**
 * @route   GET /api/appointments/slots/:date
 * @desc    Отримати доступні слоти на дату
 * @access  Public
 */
router.get('/slots/:date', getAvailableSlots);

/**
 * @route   GET /api/appointments/history/:licensePlate
 * @desc    Отримати історію ремонтів авто
 * @access  Public
 */
router.get('/history/:licensePlate', getCarHistory);

/**
 * @route   GET /api/appointments/my
 * @desc    Отримати записи поточного користувача
 * @access  Private
 */
router.get('/my', protect, getMyAppointments);

/**
 * @route   GET /api/appointments
 * @desc    Отримати записи (адмін - всі, користувач - свої)
 * @access  Private
 */
router.get('/', protect, getAppointments);

/**
 * @route   GET /api/appointments/:id
 * @desc    Отримати запис за ID
 * @access  Private
 */
router.get('/:id', protect, getAppointment);

/**
 * @route   POST /api/appointments
 * @desc    Створити запис на ремонт
 * @access  Private
 */
router.post('/', protect, createAppointment);

/**
 * @route   PUT /api/appointments/:id
 * @desc    Оновити запис
 * @access  Private
 */
router.put('/:id', protect, updateAppointment);

/**
 * @route   PUT /api/appointments/:id/status
 * @desc    Оновити статус запису
 * @access  Private/Admin
 */
router.put('/:id/status', protect, authorize('admin'), updateStatus);

/**
 * @route   DELETE /api/appointments/:id
 * @desc    Скасувати запис
 * @access  Private
 */
router.delete('/:id', protect, cancelAppointment);

/**
 * @route   POST /api/appointments/:id/photos
 * @desc    Додати фото до запису
 * @access  Private
 */
router.post('/:id/photos', protect, uploadMultiple, handleUploadError, addPhotos);

/**
 * @route   DELETE /api/appointments/:id/photos/:photoId
 * @desc    Видалити фото
 * @access  Private
 */
router.delete('/:id/photos/:photoId', protect, deletePhoto);

/**
 * @route   POST /api/appointments/:id/rating
 * @desc    Додати оцінку
 * @access  Private
 */
router.post('/:id/rating', protect, addRating);

/**
 * @route   POST /api/appointments/:id/review
 * @desc    Додати відгук
 * @access  Private
 */
router.post('/:id/review', protect, addReview);

module.exports = router;
