const mongoose = require('mongoose');

/**
 * Схема послуги автосервісу
 * Використовується для зберігання інформації про послуги
 */
const ServiceSchema = new mongoose.Schema({
  // Назва послуги
  name: {
    type: String,
    required: [true, 'Будь ласка, введіть назву послуги'],
    trim: true,
    maxlength: [100, 'Назва не може бути довшою за 100 символів']
  },
  
  // Опис послуги
  description: {
    type: String,
    required: [true, 'Будь ласка, введіть опис послуги'],
    maxlength: [1000, 'Опис не може бути довшим за 1000 символів']
  },
  
  // Категорія послуги
  category: {
    type: String,
    required: [true, 'Будь ласка, виберіть категорію'],
    enum: [
      'diagnostics',      // Діагностика
      'engine',           // Двигун
      'transmission',     // Трансмісія
      'brakes',           // Гальма
      'suspension',       // Підвіска
      'electrical',       // Електрика
      'bodywork',         // Кузовні роботи
      'oil-change',       // Заміна масла
      'tire-service',     // Шиномонтаж
      'air-conditioning', // Кондиціонер
      'other'             // Інше
    ]
  },
  
  // Базова ціна послуги (в гривнях)
  basePrice: {
    type: Number,
    required: [true, 'Будь ласка, введіть базову ціну'],
    min: [0, 'Ціна не може бути від\'ємною']
  },
  
  // Максимальна ціна (для діапазону)
  maxPrice: {
    type: Number,
    min: [0, 'Ціна не може бути від\'ємною']
  },
  
  // Одиниця виміру ціни
  priceUnit: {
    type: String,
    enum: ['fixed', 'per-hour', 'per-item'],
    default: 'fixed'
  },
  
  // Тривалість виконання (в хвилинах)
  duration: {
    type: Number,
    required: [true, 'Будь ласка, введіть тривалість'],
    min: [15, 'Мінімальна тривалість - 15 хвилин']
  },
  
  // Зображення послуги
  image: {
    type: String,
    default: 'default-service.jpg'
  },
  
  // Чи активна послуга
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Популярність (для сортування)
  popularity: {
    type: Number,
    default: 0
  },
  
  // Коефіцієнти для калькулятора
  calculatorMultipliers: {
    // Коефіцієнт складності
    complexity: {
      type: Number,
      default: 1.0
    },
    // Коефіцієнт терміновості
    urgency: {
      type: Number,
      default: 1.5
    }
  },
  
  // Дата створення
  createdAt: {
    type: Date,
    default: Date.now
  },
  
  // Дата оновлення
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Індекси для пошуку
ServiceSchema.index({ name: 'text', description: 'text' });
ServiceSchema.index({ category: 1, isActive: 1 });

/**
 * Middleware: Оновлення дати модифікації
 */
ServiceSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

/**
 * Віртуальне поле: Відформатована ціна
 */
ServiceSchema.virtual('formattedPrice').get(function() {
  if (this.maxPrice && this.maxPrice > this.basePrice) {
    return `${this.basePrice} - ${this.maxPrice} грн`;
  }
  return `${this.basePrice} грн`;
});

// Включаємо віртуальні поля в JSON
ServiceSchema.set('toJSON', { virtuals: true });
ServiceSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Service', ServiceSchema);
