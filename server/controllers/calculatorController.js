const Service = require('../models/Service');
const { asyncHandler } = require('../middleware/error');

/**
 * Коефіцієнти для калькулятора вартості ремонту
 */
const COEFFICIENTS = {
  // Коефіцієнти за маркою авто
  carBrand: {
    'economy': 1.0,      // Бюджетні марки
    'standard': 1.2,     // Стандартні марки
    'premium': 1.5,      // Преміум марки
    'luxury': 2.0        // Люксові марки
  },
  
  // Коефіцієнти за віком авто
  carAge: {
    'new': 1.0,          // До 3 років
    'medium': 1.1,       // 3-7 років
    'old': 1.2,          // 7-15 років
    'vintage': 1.4       // Більше 15 років
  },
  
  // Коефіцієнти терміновості
  urgency: {
    'normal': 1.0,       // Звичайна черга
    'priority': 1.3,     // Пріоритет
    'urgent': 1.5        // Терміново
  },
  
  // Знижки
  discounts: {
    'none': 0,
    'first-visit': 10,   // Перший візит
    'regular': 5,        // Постійний клієнт
    'package': 15        // Комплексне обслуговування
  }
};

/**
 * Карта марок авто до категорій
 */
const CAR_BRAND_CATEGORIES = {
  // Бюджетні
  'daewoo': 'economy', 'dacia': 'economy', 'lada': 'economy', 'zaz': 'economy',
  'chery': 'economy', 'geely': 'economy', 'great wall': 'economy',
  
  // Стандартні
  'volkswagen': 'standard', 'ford': 'standard', 'opel': 'standard', 
  'peugeot': 'standard', 'renault': 'standard', 'skoda': 'standard',
  'hyundai': 'standard', 'kia': 'standard', 'toyota': 'standard',
  'honda': 'standard', 'mazda': 'standard', 'nissan': 'standard',
  'chevrolet': 'standard', 'mitsubishi': 'standard', 'suzuki': 'standard',
  'fiat': 'standard', 'citroen': 'standard', 'seat': 'standard',
  
  // Преміум
  'audi': 'premium', 'bmw': 'premium', 'mercedes-benz': 'premium',
  'mercedes': 'premium', 'lexus': 'premium', 'volvo': 'premium',
  'infiniti': 'premium', 'acura': 'premium', 'land rover': 'premium',
  'jaguar': 'premium', 'alfa romeo': 'premium', 'mini': 'premium',
  'cadillac': 'premium', 'lincoln': 'premium', 'tesla': 'premium',
  
  // Люкс
  'bentley': 'luxury', 'rolls-royce': 'luxury', 'porsche': 'luxury',
  'maserati': 'luxury', 'ferrari': 'luxury', 'lamborghini': 'luxury',
  'aston martin': 'luxury', 'maybach': 'luxury', 'bugatti': 'luxury'
};

/**
 * Визначення категорії авто за маркою
 */
const getCarBrandCategory = (brand) => {
  const normalizedBrand = brand.toLowerCase().trim();
  return CAR_BRAND_CATEGORIES[normalizedBrand] || 'standard';
};

/**
 * Визначення категорії віку авто
 */
const getCarAgeCategory = (year) => {
  const currentYear = new Date().getFullYear();
  const age = currentYear - year;
  
  if (age <= 3) return 'new';
  if (age <= 7) return 'medium';
  if (age <= 15) return 'old';
  return 'vintage';
};

/**
 * @desc    Розрахувати вартість ремонту
 * @route   POST /api/calculator
 * @access  Public
 */
const calculateRepairCost = asyncHandler(async (req, res) => {
  const {
    services: selectedServices,
    carBrand,
    carYear,
    urgency = 'normal',
    discountType = 'none',
    mileage
  } = req.body;

  // Валідація
  if (!selectedServices || !selectedServices.length) {
    return res.status(400).json({
      success: false,
      message: 'Будь ласка, виберіть хоча б одну послугу'
    });
  }

  if (!carBrand || !carYear) {
    return res.status(400).json({
      success: false,
      message: 'Будь ласка, вкажіть марку та рік авто'
    });
  }

  // Отримуємо інформацію про послуги
  const serviceIds = selectedServices.map(s => s.serviceId);
  const servicesData = await Service.find({ 
    _id: { $in: serviceIds },
    isActive: true
  });

  if (!servicesData.length) {
    return res.status(404).json({
      success: false,
      message: 'Послуги не знайдено'
    });
  }

  // Визначаємо коефіцієнти
  const brandCategory = getCarBrandCategory(carBrand);
  const ageCategory = getCarAgeCategory(carYear);
  
  const brandCoeff = COEFFICIENTS.carBrand[brandCategory];
  const ageCoeff = COEFFICIENTS.carAge[ageCategory];
  const urgencyCoeff = COEFFICIENTS.urgency[urgency];
  const discountPercent = COEFFICIENTS.discounts[discountType];

  // Розраховуємо вартість кожної послуги
  const breakdown = [];
  let subtotal = 0;

  for (const selected of selectedServices) {
    const service = servicesData.find(s => s._id.toString() === selected.serviceId);
    if (!service) continue;

    const quantity = selected.quantity || 1;
    const basePrice = service.basePrice * quantity;
    
    // Застосовуємо коефіцієнти
    const adjustedPrice = basePrice * brandCoeff * ageCoeff;
    const withUrgency = adjustedPrice * urgencyCoeff;
    
    breakdown.push({
      service: {
        id: service._id,
        name: service.name,
        category: service.category,
        duration: service.duration
      },
      quantity,
      basePrice: service.basePrice,
      adjustedPrice: Math.round(withUrgency),
      coefficients: {
        brand: brandCoeff,
        age: ageCoeff,
        urgency: urgencyCoeff
      }
    });
    
    subtotal += withUrgency;
  }

  // Розраховуємо знижку
  const discountAmount = Math.round(subtotal * (discountPercent / 100));
  const totalPrice = Math.round(subtotal - discountAmount);

  // Розраховуємо загальну тривалість
  const totalDuration = breakdown.reduce((sum, item) => {
    return sum + (item.service.duration * item.quantity);
  }, 0);

  // Формуємо результат
  const result = {
    carInfo: {
      brand: carBrand,
      year: carYear,
      category: brandCategory,
      ageCategory
    },
    services: breakdown,
    pricing: {
      subtotal: Math.round(subtotal),
      discount: {
        type: discountType,
        percent: discountPercent,
        amount: discountAmount
      },
      total: totalPrice
    },
    estimatedDuration: totalDuration,
    urgency,
    coefficients: {
      brand: { category: brandCategory, value: brandCoeff },
      age: { category: ageCategory, value: ageCoeff },
      urgency: { type: urgency, value: urgencyCoeff }
    },
    recommendations: generateRecommendations(selectedServices, servicesData, mileage)
  };

  res.status(200).json({
    success: true,
    data: result
  });
});

/**
 * Генерація рекомендацій на основі обраних послуг
 */
const generateRecommendations = (selectedServices, servicesData, mileage) => {
  const recommendations = [];
  const selectedCategories = new Set();

  // Збираємо категорії обраних послуг
  selectedServices.forEach(selected => {
    const service = servicesData.find(s => s._id.toString() === selected.serviceId);
    if (service) {
      selectedCategories.add(service.category);
    }
  });

  // Рекомендації на основі категорій
  if (selectedCategories.has('oil-change') && !selectedCategories.has('diagnostics')) {
    recommendations.push({
      type: 'suggestion',
      message: 'Рекомендуємо пройти діагностику двигуна разом із заміною масла',
      category: 'diagnostics'
    });
  }

  if (selectedCategories.has('brakes') && !selectedCategories.has('suspension')) {
    recommendations.push({
      type: 'suggestion',
      message: 'Перевірте стан підвіски разом із гальмівною системою',
      category: 'suspension'
    });
  }

  // Рекомендації на основі пробігу
  if (mileage) {
    if (mileage > 100000 && !selectedCategories.has('engine')) {
      recommendations.push({
        type: 'maintenance',
        message: 'При пробігу понад 100 000 км рекомендуємо перевірити двигун',
        category: 'engine'
      });
    }
    
    if (mileage > 60000 && !selectedCategories.has('transmission')) {
      recommendations.push({
        type: 'maintenance',
        message: 'Рекомендуємо перевірити стан коробки передач',
        category: 'transmission'
      });
    }
  }

  return recommendations;
};

/**
 * @desc    Отримати коефіцієнти калькулятора
 * @route   GET /api/calculator/coefficients
 * @access  Public
 */
const getCoefficients = asyncHandler(async (req, res) => {
  // Перетворюємо марки авто на об'єкт з коефіцієнтами
  const carBrands = {};
  Object.entries(CAR_BRAND_CATEGORIES).forEach(([brand, category]) => {
    carBrands[brand] = COEFFICIENTS.carBrand[category];
  });

  res.status(200).json({
    success: true,
    data: {
      carBrands,
      carAge: {
        perYear: 0.02,
        maxYears: 30
      },
      urgency: {
        coefficient: COEFFICIENTS.urgency.urgent
      }
    }
  });
});

/**
 * @desc    Швидкий розрахунок вартості
 * @route   GET /api/calculator/quick
 * @access  Public
 */
const quickCalculate = asyncHandler(async (req, res) => {
  const { serviceId, carBrand, carYear } = req.query;

  if (!serviceId) {
    return res.status(400).json({
      success: false,
      message: 'Вкажіть ID послуги'
    });
  }

  const service = await Service.findById(serviceId);
  
  if (!service) {
    return res.status(404).json({
      success: false,
      message: 'Послугу не знайдено'
    });
  }

  let price = service.basePrice;

  // Застосовуємо коефіцієнти, якщо вказані дані авто
  if (carBrand) {
    const brandCategory = getCarBrandCategory(carBrand);
    price *= COEFFICIENTS.carBrand[brandCategory];
  }

  if (carYear) {
    const ageCategory = getCarAgeCategory(parseInt(carYear));
    price *= COEFFICIENTS.carAge[ageCategory];
  }

  res.status(200).json({
    success: true,
    data: {
      service: {
        id: service._id,
        name: service.name,
        category: service.category
      },
      basePrice: service.basePrice,
      calculatedPrice: Math.round(price),
      duration: service.duration
    }
  });
});

/**
 * @desc    Розрахунок для фронтенд калькулятора (спрощений)
 * @route   POST /api/calculator/calculate
 * @access  Public
 */
const calculate = asyncHandler(async (req, res) => {
  const { serviceId, carBrand, carYear, isUrgent } = req.body;

  // Валідація
  if (!serviceId || !carBrand || !carYear) {
    return res.status(400).json({
      success: false,
      message: 'Будь ласка, заповніть всі поля'
    });
  }

  // Отримуємо послугу
  const service = await Service.findById(serviceId);
  
  if (!service) {
    return res.status(404).json({
      success: false,
      message: 'Послугу не знайдено'
    });
  }

  // Розраховуємо коефіцієнти
  const brandCategory = getCarBrandCategory(carBrand);
  const ageCategory = getCarAgeCategory(parseInt(carYear));
  
  const brandCoeff = COEFFICIENTS.carBrand[brandCategory];
  const ageCoeff = COEFFICIENTS.carAge[ageCategory];
  const urgencyCoeff = isUrgent ? COEFFICIENTS.urgency['urgent'] : COEFFICIENTS.urgency['normal'];

  // Розраховуємо вартість
  const basePrice = service.basePrice;
  let finalPrice = basePrice * brandCoeff * ageCoeff * urgencyCoeff;
  finalPrice = Math.round(finalPrice);

  res.status(200).json({
    success: true,
    data: {
      service: {
        _id: service._id,
        name: service.name,
        category: service.category
      },
      carBrand,
      carYear: parseInt(carYear),
      isUrgent,
      basePrice,
      finalPrice,
      breakdown: {
        brandCoefficient: brandCoeff,
        ageCoefficient: ageCoeff,
        urgencyCoefficient: urgencyCoeff
      }
    }
  });
});

module.exports = {
  calculateRepairCost,
  getCoefficients,
  quickCalculate,
  calculate
};
