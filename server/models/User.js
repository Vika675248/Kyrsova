const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config');

/**
 * Схема користувача
 * Використовується для зберігання даних про користувачів системи
 */
const UserSchema = new mongoose.Schema({
  // Ім'я користувача
  name: {
    type: String,
    required: [true, 'Будь ласка, введіть ім\'я'],
    trim: true,
    maxlength: [50, 'Ім\'я не може бути довшим за 50 символів']
  },
  
  // Email користувача (унікальний)
  email: {
    type: String,
    required: [true, 'Будь ласка, введіть email'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Будь ласка, введіть коректний email'
    ]
  },
  
  // Телефон користувача
  phone: {
    type: String,
    required: [true, 'Будь ласка, введіть номер телефону'],
    match: [
      /^[+]?[0-9\s\-\(\)]{9,20}$/,
      'Будь ласка, введіть коректний номер телефону (мінімум 9 цифр)'
    ]
  },
  
  // Пароль (хешований)
  password: {
    type: String,
    required: [true, 'Будь ласка, введіть пароль'],
    minlength: [6, 'Пароль повинен містити мінімум 6 символів'],
    select: false // Не повертати пароль за замовчуванням
  },
  
  // Роль користувача
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  
  // Автомобілі користувача
  cars: [{
    brand: {
      type: String,
      required: true
    },
    model: {
      type: String,
      required: true
    },
    year: {
      type: Number,
      required: true
    },
    licensePlate: {
      type: String,
      required: true
    }
  }],
  
  // Дата створення акаунту
  createdAt: {
    type: Date,
    default: Date.now
  },
  
  // Дата останнього оновлення
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

/**
 * Middleware: Хешування пароля перед збереженням
 */
UserSchema.pre('save', async function(next) {
  // Оновлюємо дату модифікації
  this.updatedAt = Date.now();
  
  // Якщо пароль не змінювався, пропускаємо хешування
  if (!this.isModified('password')) {
    return next();
  }
  
  // Генеруємо сіль та хешуємо пароль
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

/**
 * Метод: Порівняння паролів
 * @param {string} enteredPassword - Введений пароль
 * @returns {Promise<boolean>} Результат порівняння
 */
UserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

/**
 * Метод: Генерація JWT токена
 * @returns {string} JWT токен
 */
UserSchema.methods.getSignedJwtToken = function() {
  return jwt.sign(
    { id: this._id, role: this.role },
    config.jwtSecret,
    { expiresIn: config.jwtExpire }
  );
};

module.exports = mongoose.model('User', UserSchema);
