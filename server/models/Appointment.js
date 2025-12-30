const mongoose = require('mongoose');

/**
 * Схема запису на ремонт
 * Використовується для управління записами клієнтів
 */
const AppointmentSchema = new mongoose.Schema({
  // Користувач, який створив запис
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Вибрані послуги
  services: [{
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
      required: true
    },
    quantity: {
      type: Number,
      default: 1,
      min: 1
    },
    price: {
      type: Number,
      required: true
    }
  }],
  
  // Інформація про автомобіль
  car: {
    brand: {
      type: String,
      required: [true, 'Будь ласка, введіть марку авто']
    },
    model: {
      type: String,
      required: [true, 'Будь ласка, введіть модель авто']
    },
    year: {
      type: Number,
      required: [true, 'Будь ласка, введіть рік випуску'],
      min: [1900, 'Некоректний рік випуску'],
      max: [new Date().getFullYear() + 1, 'Некоректний рік випуску']
    },
    licensePlate: {
      type: String,
      required: [true, 'Будь ласка, введіть номерний знак']
    },
    vin: {
      type: String
    },
    mileage: {
      type: Number,
      min: 0
    }
  },
  
  // Дата та час запису
  appointmentDate: {
    type: Date,
    required: [true, 'Будь ласка, виберіть дату запису']
  },
  
  // Часовий слот
  timeSlot: {
    type: String,
    required: [true, 'Будь ласка, виберіть час'],
    enum: [
      '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
      '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
      '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
      '17:00', '17:30', '18:00'
    ]
  },
  
  // Статус запису
  status: {
    type: String,
    enum: [
      'pending',      // Очікує підтвердження
      'confirmed',    // Підтверджено
      'in-progress',  // В роботі
      'completed',    // Завершено
      'cancelled'     // Скасовано
    ],
    default: 'pending'
  },
  
  // Загальна вартість
  totalPrice: {
    type: Number,
    required: true,
    min: 0
  },
  
  // Знижка (у відсотках)
  discount: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  
  // Фінальна вартість
  finalPrice: {
    type: Number,
    required: true,
    min: 0
  },
  
  // Коментар клієнта
  customerNote: {
    type: String,
    maxlength: [500, 'Коментар не може бути довшим за 500 символів']
  },
  
  // Коментар майстра
  mechanicNote: {
    type: String,
    maxlength: [1000, 'Коментар не може бути довшим за 1000 символів']
  },
  
  // Фотографії
  photos: [{
    url: {
      type: String,
      required: true
    },
    description: {
      type: String
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    },
    type: {
      type: String,
      enum: ['before', 'after', 'damage', 'other'],
      default: 'other'
    }
  }],
  
  // Терміновість
  isUrgent: {
    type: Boolean,
    default: false
  },
  
  // Дата завершення ремонту
  completedAt: {
    type: Date
  },
  
  // Оцінка клієнта
  rating: {
    score: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      maxlength: 500
    },
    createdAt: {
      type: Date
    }
  },
  
  // Дата створення запису
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

// Індекси
AppointmentSchema.index({ user: 1, appointmentDate: -1 });
AppointmentSchema.index({ status: 1, appointmentDate: 1 });
AppointmentSchema.index({ 'car.licensePlate': 1 });

/**
 * Middleware: Оновлення дати модифікації
 */
AppointmentSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // Розрахунок фінальної ціни
  if (this.isModified('totalPrice') || this.isModified('discount')) {
    this.finalPrice = this.totalPrice * (1 - this.discount / 100);
  }
  
  next();
});

/**
 * Middleware: Популяція послуг при запитах
 */
AppointmentSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'services.service',
    select: 'name category basePrice duration'
  });
  next();
});

/**
 * Статичний метод: Отримати статистику по записах
 */
AppointmentSchema.statics.getStats = async function(userId) {
  const stats = await this.aggregate([
    { $match: { user: userId } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalSpent: { $sum: '$finalPrice' }
      }
    }
  ]);
  
  return stats;
};

/**
 * Віртуальне поле: Тривалість всіх послуг
 */
AppointmentSchema.virtual('estimatedDuration').get(function() {
  if (!this.services || !this.services.length) return 0;
  
  return this.services.reduce((total, item) => {
    if (item.service && item.service.duration) {
      return total + (item.service.duration * item.quantity);
    }
    return total;
  }, 0);
});

// Включаємо віртуальні поля в JSON
AppointmentSchema.set('toJSON', { virtuals: true });
AppointmentSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Appointment', AppointmentSchema);
