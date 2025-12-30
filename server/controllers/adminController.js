const User = require('../models/User');
const Service = require('../models/Service');
const Appointment = require('../models/Appointment');
const { asyncHandler } = require('../middleware/error');

/**
 * ===========================================
 * УПРАВЛІННЯ КОРИСТУВАЧАМИ
 * ===========================================
 */

/**
 * @desc    Отримати всіх користувачів
 * @route   GET /api/admin/users
 * @access  Private/Admin
 */
const getAllUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, role, search, sortBy = 'createdAt', order = 'desc' } = req.query;

  // Фільтри
  const query = {};
  if (role) {
    query.role = role;
  }
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } }
    ];
  }

  // Пагінація
  const skip = (page - 1) * limit;
  const sortOrder = order === 'asc' ? 1 : -1;

  const users = await User.find(query)
    .select('-password')
    .sort({ [sortBy]: sortOrder })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await User.countDocuments(query);

  res.status(200).json({
    success: true,
    data: {
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    }
  });
});

/**
 * @desc    Отримати одного користувача
 * @route   GET /api/admin/users/:id
 * @access  Private/Admin
 */
const getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'Користувача не знайдено'
    });
  }

  // Отримати статистику користувача
  const appointmentsCount = await Appointment.countDocuments({ user: user._id });
  const completedAppointments = await Appointment.countDocuments({ 
    user: user._id, 
    status: 'completed' 
  });

  res.status(200).json({
    success: true,
    data: {
      user,
      statistics: {
        totalAppointments: appointmentsCount,
        completedAppointments
      }
    }
  });
});

/**
 * @desc    Оновити користувача
 * @route   PUT /api/admin/users/:id
 * @access  Private/Admin
 */
const updateUser = asyncHandler(async (req, res) => {
  const { name, email, phone, role } = req.body;

  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'Користувача не знайдено'
    });
  }

  // Перевірка унікальності email
  if (email && email !== user.email) {
    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return res.status(400).json({
        success: false,
        message: 'Email вже використовується'
      });
    }
  }

  // Оновлення даних
  user.name = name || user.name;
  user.email = email || user.email;
  user.phone = phone || user.phone;
  user.role = role || user.role;

  await user.save();

  res.status(200).json({
    success: true,
    data: {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    }
  });
});

/**
 * @desc    Видалити користувача
 * @route   DELETE /api/admin/users/:id
 * @access  Private/Admin
 */
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'Користувача не знайдено'
    });
  }

  // Не дозволяємо видаляти себе
  if (user._id.toString() === req.user._id.toString()) {
    return res.status(400).json({
      success: false,
      message: 'Ви не можете видалити свій власний аккаунт'
    });
  }

  await user.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Користувача видалено'
  });
});

/**
 * ===========================================
 * УПРАВЛІННЯ ПОСЛУГАМИ
 * ===========================================
 */

/**
 * @desc    Створити нову послугу
 * @route   POST /api/admin/services
 * @access  Private/Admin
 */
const createService = asyncHandler(async (req, res) => {
  const service = await Service.create(req.body);

  res.status(201).json({
    success: true,
    data: { service }
  });
});

/**
 * @desc    Оновити послугу
 * @route   PUT /api/admin/services/:id
 * @access  Private/Admin
 */
const updateService = asyncHandler(async (req, res) => {
  const service = await Service.findById(req.params.id);

  if (!service) {
    return res.status(404).json({
      success: false,
      message: 'Послугу не знайдено'
    });
  }

  // Оновлюємо поля
  Object.keys(req.body).forEach(key => {
    service[key] = req.body[key];
  });

  await service.save();

  res.status(200).json({
    success: true,
    data: { service }
  });
});

/**
 * @desc    Отримати всі послуги (включно з неактивними)
 * @route   GET /api/admin/services
 * @access  Private/Admin
 */
const getAllServices = asyncHandler(async (req, res) => {
  const services = await Service.find().sort({ name: 1 });
  res.status(200).json({
    success: true,
    data: { services }
  });
});

/**
 * @desc    Видалити послугу
 * @route   DELETE /api/admin/services/:id
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

  // Перевірити, чи немає активних записів з цією послугою
  const activeAppointments = await Appointment.countDocuments({
    'services.service': service._id,
    status: { $in: ['pending', 'confirmed'] }
  });

  if (activeAppointments > 0) {
    return res.status(400).json({
      success: false,
      message: `Неможливо видалити послугу. Існує ${activeAppointments} активних записів з цією послугою.`
    });
  }

  await service.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Послугу видалено'
  });
});

/**
 * @desc    Деактивувати/активувати послугу
 * @route   PATCH /api/admin/services/:id/toggle
 * @access  Private/Admin
 */
const toggleServiceStatus = asyncHandler(async (req, res) => {
  const service = await Service.findById(req.params.id);

  if (!service) {
    return res.status(404).json({
      success: false,
      message: 'Послугу не знайдено'
    });
  }

  service.isActive = !service.isActive;
  await service.save();

  res.status(200).json({
    success: true,
    data: { service },
    message: `Послугу ${service.isActive ? 'активовано' : 'деактивовано'}`
  });
});

/**
 * ===========================================
 * УПРАВЛІННЯ ЗАПИСАМИ
 * ===========================================
 */

/**
 * @desc    Отримати всі записи
 * @route   GET /api/admin/appointments
 * @access  Private/Admin
 */
const getAllAppointments = asyncHandler(async (req, res) => {
  const { 
    page = 1, 
    limit = 20, 
    status, 
    dateFrom, 
    dateTo,
    sortBy = 'appointmentDate',
    order = 'desc'
  } = req.query;

  // Фільтри
  const query = {};
  if (status) {
    query.status = status;
  }
  if (dateFrom || dateTo) {
    query.appointmentDate = {};
    if (dateFrom) query.appointmentDate.$gte = new Date(dateFrom);
    if (dateTo) query.appointmentDate.$lte = new Date(dateTo);
  }

  // Пагінація
  const skip = (page - 1) * limit;
  const sortOrder = order === 'asc' ? 1 : -1;

  const appointments = await Appointment.find(query)
    .populate('user', 'name email phone')
    .populate('services.service', 'name basePrice category')
    .sort({ [sortBy]: sortOrder })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Appointment.countDocuments(query);

  res.status(200).json({
    success: true,
    data: {
      appointments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    }
  });
});

/**
 * @desc    Оновити статус запису
 * @route   PATCH /api/admin/appointments/:id/status
 * @access  Private/Admin
 */
const updateAppointmentStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  if (!['pending', 'confirmed', 'in-progress', 'completed', 'cancelled'].includes(status)) {
    return res.status(400).json({
      success: false,
      message: 'Недійсний статус'
    });
  }

  const appointment = await Appointment.findById(req.params.id);

  if (!appointment) {
    return res.status(404).json({
      success: false,
      message: 'Запис не знайдено'
    });
  }

  appointment.status = status;
  
  // Якщо статус "виконано", встановлюємо дату завершення
  if (status === 'completed' && !appointment.completedAt) {
    appointment.completedAt = new Date();
  }

  await appointment.save();

  // Повертаємо оновлений запис з населеними полями
  const updatedAppointment = await Appointment.findById(appointment._id)
    .populate('user', 'name email phone')
    .populate('services.service', 'name basePrice category');

  res.status(200).json({
    success: true,
    data: { appointment: updatedAppointment }
  });
});

/**
 * @desc    Видалити запис
 * @route   DELETE /api/admin/appointments/:id
 * @access  Private/Admin
 */
const deleteAppointment = asyncHandler(async (req, res) => {
  const appointment = await Appointment.findById(req.params.id);

  if (!appointment) {
    return res.status(404).json({
      success: false,
      message: 'Запис не знайдено'
    });
  }

  await appointment.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Запис видалено'
  });
});

/**
 * ===========================================
 * СТАТИСТИКА ТА АНАЛІТИКА
 * ===========================================
 */

/**
 * @desc    Отримати загальну статистику
 * @route   GET /api/admin/statistics
 * @access  Private/Admin
 */
const getStatistics = asyncHandler(async (req, res) => {
  // Підрахунок користувачів
  const totalUsers = await User.countDocuments();
  const adminUsers = await User.countDocuments({ role: 'admin' });

  // Підрахунок послуг
  const totalServices = await Service.countDocuments();
  const activeServices = await Service.countDocuments({ isActive: true });

  // Підрахунок записів
  const totalAppointments = await Appointment.countDocuments();
  const pendingAppointments = await Appointment.countDocuments({ status: 'pending' });
  const confirmedAppointments = await Appointment.countDocuments({ status: 'confirmed' });
  const completedAppointments = await Appointment.countDocuments({ status: 'completed' });
  const cancelledAppointments = await Appointment.countDocuments({ status: 'cancelled' });

  // Сума доходів від завершених записів
  const completedAppts = await Appointment.find({ status: 'completed' });
  const totalRevenue = completedAppts.reduce((sum, appt) => sum + (appt.finalPrice || 0), 0);

  // Популярні послуги
  const popularServices = await Appointment.aggregate([
    { $unwind: '$services' },
    { $group: { 
      _id: '$services.service', 
      count: { $sum: 1 } 
    }},
    { $sort: { count: -1 } },
    { $limit: 5 },
    { $lookup: {
      from: 'services',
      localField: '_id',
      foreignField: '_id',
      as: 'service'
    }},
    { $unwind: '$service' },
    { $project: {
      _id: 1,
      name: '$service.name',
      category: '$service.category',
      count: 1
    }}
  ]);

  // Останні користувачі
  const recentUsers = await User.find()
    .select('name email createdAt')
    .sort({ createdAt: -1 })
    .limit(5);

  res.status(200).json({
    success: true,
    data: {
      users: {
        total: totalUsers,
        admins: adminUsers,
        regular: totalUsers - adminUsers
      },
      services: {
        total: totalServices,
        active: activeServices,
        inactive: totalServices - activeServices
      },
      appointments: {
        total: totalAppointments,
        pending: pendingAppointments,
        confirmed: confirmedAppointments,
        completed: completedAppointments,
        cancelled: cancelledAppointments
      },
      revenue: {
        total: totalRevenue,
        currency: 'грн'
      },
      popularServices,
      recentUsers
    }
  });
});

module.exports = {
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
};
