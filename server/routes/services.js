const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getServices,
  getService,
  createService,
  updateService,
  deleteService,
  getServicesByCategory
} = require('../controllers/serviceController');

/**
 * @route   GET /api/services
 * @desc    Отримати всі послуги
 * @access  Public
 */
router.get('/', getServices);

/**
 * @route   GET /api/services/categories
 * @desc    Отримати послуги згруповані за категоріями
 * @access  Public
 */
router.get('/categories', getServicesByCategory);

/**
 * @route   GET /api/services/:id
 * @desc    Отримати послугу за ID
 * @access  Public
 */
router.get('/:id', getService);

/**
 * @route   POST /api/services
 * @desc    Створити нову послугу
 * @access  Private/Admin
 */
router.post('/', protect, authorize('admin'), createService);

/**
 * @route   PUT /api/services/:id
 * @desc    Оновити послугу
 * @access  Private/Admin
 */
router.put('/:id', protect, authorize('admin'), updateService);

/**
 * @route   DELETE /api/services/:id
 * @desc    Видалити послугу
 * @access  Private/Admin
 */
router.delete('/:id', protect, authorize('admin'), deleteService);

module.exports = router;
