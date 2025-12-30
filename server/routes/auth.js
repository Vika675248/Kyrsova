const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  register,
  login,
  getMe,
  updateProfile,
  updatePassword,
  addCar,
  removeCar
} = require('../controllers/authController');

/**
 * @route   POST /api/auth/register
 * @desc    Реєстрація нового користувача
 * @access  Public
 */
router.post('/register', register);

/**
 * @route   POST /api/auth/login
 * @desc    Авторизація користувача
 * @access  Public
 */
router.post('/login', login);

/**
 * @route   GET /api/auth/me
 * @desc    Отримати поточного користувача
 * @access  Private
 */
router.get('/me', protect, getMe);

/**
 * @route   PUT /api/auth/me
 * @desc    Оновити профіль
 * @access  Private
 */
router.put('/me', protect, updateProfile);

/**
 * @route   PUT /api/auth/password
 * @desc    Змінити пароль
 * @access  Private
 */
router.put('/password', protect, updatePassword);

/**
 * @route   POST /api/auth/cars
 * @desc    Додати автомобіль
 * @access  Private
 */
router.post('/cars', protect, addCar);

/**
 * @route   DELETE /api/auth/cars/:carId
 * @desc    Видалити автомобіль
 * @access  Private
 */
router.delete('/cars/:carId', protect, removeCar);

module.exports = router;
