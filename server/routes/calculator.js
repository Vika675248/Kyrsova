const express = require('express');
const router = express.Router();
const {
  calculateRepairCost,
  getCoefficients,
  quickCalculate,
  calculate
} = require('../controllers/calculatorController');

/**
 * @route   POST /api/calculator
 * @desc    Розрахувати вартість ремонту
 * @access  Public
 */
router.post('/', calculateRepairCost);

/**
 * @route   POST /api/calculator/calculate
 * @desc    Розрахувати вартість (спрощений)
 * @access  Public
 */
router.post('/calculate', calculate);

/**
 * @route   GET /api/calculator/coefficients
 * @desc    Отримати коефіцієнти калькулятора
 * @access  Public
 */
router.get('/coefficients', getCoefficients);

/**
 * @route   GET /api/calculator/quick
 * @desc    Швидкий розрахунок
 * @access  Public
 */
router.get('/quick', quickCalculate);

module.exports = router;
