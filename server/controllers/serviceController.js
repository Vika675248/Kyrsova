const Service = require('../models/Service');
const { asyncHandler } = require('../middleware/error');

/**
 * @desc    Отримати всі послуги
 * @route   GET /api/services
 * @access  Public
 */
const getServices = asyncHandler(async (req, res) => {
  // Параметри запиту
  const { category, search, sort, page = 1, limit = 20, active } = req.query;

  // Будуємо фільтр
  const filter = {};
  
  // Фільтр за категорією
  if (category) {
    filter.category = category;
  }
  
  // Фільтр за активністю
  if (active !== undefined) {
    filter.isActive = active === 'true';
  } else {
    filter.isActive = true; // За замовчуванням тільки активні
  }
  
  // Пошук за назвою/описом
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ];
  }

  // Сортування
  let sortOption = {};
  switch (sort) {
    case 'price-asc':
      sortOption = { basePrice: 1 };
      break;
    case 'price-desc':
      sortOption = { basePrice: -1 };
      break;
    case 'popular':
      sortOption = { popularity: -1 };
      break;
    case 'name':
      sortOption = { name: 1 };
      break;
    default:
      sortOption = { category: 1, popularity: -1 };
  }

  // Пагінація
  const skip = (parseInt(page) - 1) * parseInt(limit);

  // Виконуємо запит
  const services = await Service.find(filter)
    .sort(sortOption)
    .skip(skip)
    .limit(parseInt(limit));

  // Загальна кількість
  const total = await Service.countDocuments(filter);

  // Отримуємо унікальні категорії
  const categories = await Service.distinct('category', { isActive: true });

  res.status(200).json({
    success: true,
    data: {
      services,
      categories,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    }
  });
});

/**
 * @desc    Отримати послугу за ID
 * @route   GET /api/services/:id
 * @access  Public
 */
const getService = asyncHandler(async (req, res) => {
  const service = await Service.findById(req.params.id);

  if (!service) {
    return res.status(404).json({
      success: false,
      message: 'Послугу не знайдено'
    });
  }

  // Збільшуємо лічильник популярності
  service.popularity += 1;
  await service.save();

  res.status(200).json({
    success: true,
    data: { service }
  });
});

/**
 * @desc    Створити нову послугу
 * @route   POST /api/services
 * @access  Private/Admin
 */
const createService = asyncHandler(async (req, res) => {
  const service = await Service.create(req.body);

  res.status(201).json({
    success: true,
    message: 'Послугу створено',
    data: { service }
  });
});

/**
 * @desc    Оновити послугу
 * @route   PUT /api/services/:id
 * @access  Private/Admin
 */
const updateService = asyncHandler(async (req, res) => {
  let service = await Service.findById(req.params.id);

  if (!service) {
    return res.status(404).json({
      success: false,
      message: 'Послугу не знайдено'
    });
  }

  service = await Service.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    message: 'Послугу оновлено',
    data: { service }
  });
});

/**
 * @desc    Видалити послугу
 * @route   DELETE /api/services/:id
 * @access  Private/Admin
 */
const deleteService = asyncHandler(async (req, res) => {
  const service = await Service.findById(req.params.id);

  if (!service) {
    return res.status(404).json({
      success: false,
      message: 'Послугу не знайдено'
    });
  }

  await service.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Послугу видалено',
    data: {}
  });
});

/**
 * @desc    Отримати послуги за категоріями
 * @route   GET /api/services/categories
 * @access  Public
 */
const getServicesByCategory = asyncHandler(async (req, res) => {
  const servicesByCategory = await Service.aggregate([
    { $match: { isActive: true } },
    {
      $group: {
        _id: '$category',
        services: { $push: '$$ROOT' },
        count: { $sum: 1 },
        minPrice: { $min: '$basePrice' },
        maxPrice: { $max: '$basePrice' }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  res.status(200).json({
    success: true,
    data: { categories: servicesByCategory }
  });
});

module.exports = {
  getServices,
  getService,
  createService,
  updateService,
  deleteService,
  getServicesByCategory
};
