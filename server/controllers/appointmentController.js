const Appointment = require('../models/Appointment');
const Service = require('../models/Service');
const { asyncHandler } = require('../middleware/error');
const path = require('path');

/**
 * @desc    Отримати записи користувача
 * @route   GET /api/appointments
 * @access  Private
 */
const getAppointments = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 10, sort = '-appointmentDate' } = req.query;

  // Будуємо фільтр
  const filter = { user: req.user.id };
  
  if (status) {
    filter.status = status;
  }

  // Пагінація
  const skip = (parseInt(page) - 1) * parseInt(limit);

  // Виконуємо запит
  const appointments = await Appointment.find(filter)
    .populate('user', 'name email phone')
    .sort(sort)
    .skip(skip)
    .limit(parseInt(limit));

  // Загальна кількість
  const total = await Appointment.countDocuments(filter);

  res.status(200).json({
    success: true,
    data: {
      appointments,
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
 * @desc    Отримати запис за ID
 * @route   GET /api/appointments/:id
 * @access  Private
 */
const getAppointment = asyncHandler(async (req, res) => {
  const appointment = await Appointment.findById(req.params.id)
    .populate('user', 'name email phone')
    .populate('services.service');

  if (!appointment) {
    return res.status(404).json({
      success: false,
      message: 'Запис не знайдено'
    });
  }

  // Перевіряємо доступ (власник або адмін)
  if (appointment.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Доступ заборонено'
    });
  }

  res.status(200).json({
    success: true,
    data: { appointment }
  });
});

/**
 * @desc    Створити запис на ремонт
 * @route   POST /api/appointments
 * @access  Private
 */
const createAppointment = asyncHandler(async (req, res) => {
  const {
    service: serviceId,
    services: selectedServices,
    car,
    carBrand,
    carModel,
    carYear,
    licensePlate,
    scheduledDate,
    appointmentDate,
    timeSlot,
    customerNote,
    description,
    isUrgent
  } = req.body;

  // Підтримка обох форматів (service або services)
  let servicesArray = [];
  
  if (serviceId) {
    // Новий формат: одна послуга
    const serviceData = await Service.findById(serviceId);
    if (!serviceData) {
      return res.status(400).json({
        success: false,
        message: 'Послугу не знайдено'
      });
    }
    
    const urgencyMultiplier = isUrgent ? 1.3 : 1;
    const price = serviceData.basePrice * urgencyMultiplier;
    
    servicesArray = [{
      service: serviceData._id,
      quantity: 1,
      price: price
    }];
  } else if (selectedServices && selectedServices.length) {
    // Старий формат: масив послуг
    const serviceIds = selectedServices.map(s => s.serviceId);
    const servicesData = await Service.find({ _id: { $in: serviceIds } });

    if (servicesData.length !== serviceIds.length) {
      return res.status(400).json({
        success: false,
        message: 'Деякі послуги не знайдено'
      });
    }

    servicesArray = selectedServices.map(selected => {
      const service = servicesData.find(s => s._id.toString() === selected.serviceId);
      const quantity = selected.quantity || 1;
      const price = service.basePrice * quantity;
      const urgencyMultiplier = isUrgent && service.calculatorMultipliers ? service.calculatorMultipliers.urgency : 1;
      const finalPrice = price * urgencyMultiplier;
      
      return {
        service: service._id,
        quantity,
        price: finalPrice
      };
    });
  } else {
    return res.status(400).json({
      success: false,
      message: 'Будь ласка, виберіть послуги'
    });
  }

  // Підраховуємо загальну вартість
  const totalPrice = servicesArray.reduce((sum, s) => sum + s.price, 0);

  // Формуємо об'єкт авто
  const carData = car || {
    brand: carBrand || 'Не вказано',
    model: carModel || 'Не вказано',
    year: carYear || new Date().getFullYear(),
    licensePlate: licensePlate || 'Не вказано'
  };

  // Дата запису
  const appointmentDateTime = scheduledDate || appointmentDate;
  const dateObj = new Date(appointmentDateTime);
  
  // Витягуємо час зі scheduledDate або використовуємо timeSlot
  const hours = dateObj.getHours().toString().padStart(2, '0');
  const minutes = dateObj.getMinutes().toString().padStart(2, '0');
  const slot = timeSlot || `${hours}:${minutes}`;

  // Перевіряємо доступність слоту
  const startOfDay = new Date(dateObj);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(dateObj);
  endOfDay.setHours(23, 59, 59, 999);

  const existingAppointment = await Appointment.findOne({
    appointmentDate: { $gte: startOfDay, $lte: endOfDay },
    timeSlot: slot,
    status: { $nin: ['cancelled'] }
  });

  if (existingAppointment) {
    return res.status(400).json({
      success: false,
      message: 'Цей час вже зайнятий. Будь ласка, виберіть інший'
    });
  }

  // Створюємо запис
  const appointment = await Appointment.create({
    user: req.user.id,
    services: servicesArray,
    car: carData,
    appointmentDate: dateObj,
    timeSlot: slot,
    totalPrice,
    finalPrice: totalPrice,
    customerNote: customerNote || description || '',
    isUrgent: isUrgent || false
  });

  // Популяція для відповіді
  await appointment.populate('services.service');

  res.status(201).json({
    success: true,
    message: 'Запис створено успішно',
    data: { appointment }
  });
});

/**
 * @desc    Оновити запис
 * @route   PUT /api/appointments/:id
 * @access  Private
 */
const updateAppointment = asyncHandler(async (req, res) => {
  let appointment = await Appointment.findById(req.params.id);

  if (!appointment) {
    return res.status(404).json({
      success: false,
      message: 'Запис не знайдено'
    });
  }

  // Перевіряємо доступ
  if (appointment.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Доступ заборонено'
    });
  }

  // Не можна редагувати завершені або скасовані записи
  if (['completed', 'cancelled'].includes(appointment.status)) {
    return res.status(400).json({
      success: false,
      message: 'Неможливо редагувати завершений або скасований запис'
    });
  }

  const allowedUpdates = ['appointmentDate', 'timeSlot', 'customerNote', 'car'];
  const updates = {};
  
  allowedUpdates.forEach(field => {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  });

  appointment = await Appointment.findByIdAndUpdate(
    req.params.id,
    updates,
    { new: true, runValidators: true }
  ).populate('services.service');

  res.status(200).json({
    success: true,
    message: 'Запис оновлено',
    data: { appointment }
  });
});

/**
 * @desc    Скасувати запис
 * @route   DELETE /api/appointments/:id
 * @access  Private
 */
const cancelAppointment = asyncHandler(async (req, res) => {
  const appointment = await Appointment.findById(req.params.id);

  if (!appointment) {
    return res.status(404).json({
      success: false,
      message: 'Запис не знайдено'
    });
  }

  // Перевіряємо доступ
  if (appointment.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Доступ заборонено'
    });
  }

  // Не можна скасувати записи в процесі або завершені
  if (['in-progress', 'completed'].includes(appointment.status)) {
    return res.status(400).json({
      success: false,
      message: 'Неможливо скасувати запис в процесі виконання'
    });
  }

  appointment.status = 'cancelled';
  await appointment.save();

  res.status(200).json({
    success: true,
    message: 'Запис скасовано',
    data: { appointment }
  });
});

/**
 * @desc    Додати фото до запису
 * @route   POST /api/appointments/:id/photos
 * @access  Private
 */
const addPhotos = asyncHandler(async (req, res) => {
  const appointment = await Appointment.findById(req.params.id);

  if (!appointment) {
    return res.status(404).json({
      success: false,
      message: 'Запис не знайдено'
    });
  }

  // Перевіряємо доступ
  if (appointment.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Доступ заборонено'
    });
  }

  if (!req.files || !req.files.length) {
    return res.status(400).json({
      success: false,
      message: 'Будь ласка, завантажте фото'
    });
  }

  // Додаємо фото
  const photos = req.files.map(file => ({
    url: `/uploads/${file.filename}`,
    description: req.body.description || '',
    type: req.body.type || 'other'
  }));

  appointment.photos.push(...photos);
  await appointment.save();

  res.status(200).json({
    success: true,
    message: 'Фото додано',
    data: { photos: appointment.photos }
  });
});

/**
 * @desc    Видалити фото
 * @route   DELETE /api/appointments/:id/photos/:photoId
 * @access  Private
 */
const deletePhoto = asyncHandler(async (req, res) => {
  const appointment = await Appointment.findById(req.params.id);

  if (!appointment) {
    return res.status(404).json({
      success: false,
      message: 'Запис не знайдено'
    });
  }

  // Перевіряємо доступ
  if (appointment.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Доступ заборонено'
    });
  }

  appointment.photos = appointment.photos.filter(
    photo => photo._id.toString() !== req.params.photoId
  );
  await appointment.save();

  res.status(200).json({
    success: true,
    message: 'Фото видалено',
    data: { photos: appointment.photos }
  });
});

/**
 * @desc    Додати оцінку
 * @route   POST /api/appointments/:id/rating
 * @access  Private
 */
const addRating = asyncHandler(async (req, res) => {
  const { score, comment } = req.body;

  const appointment = await Appointment.findById(req.params.id);

  if (!appointment) {
    return res.status(404).json({
      success: false,
      message: 'Запис не знайдено'
    });
  }

  // Перевіряємо доступ
  if (appointment.user.toString() !== req.user.id) {
    return res.status(403).json({
      success: false,
      message: 'Доступ заборонено'
    });
  }

  // Можна оцінювати тільки завершені записи
  if (appointment.status !== 'completed') {
    return res.status(400).json({
      success: false,
      message: 'Можна оцінювати тільки завершені роботи'
    });
  }

  appointment.rating = {
    score,
    comment,
    createdAt: new Date()
  };
  await appointment.save();

  res.status(200).json({
    success: true,
    message: 'Оцінку додано',
    data: { rating: appointment.rating }
  });
});

/**
 * @desc    Отримати історію ремонтів авто
 * @route   GET /api/appointments/history/:licensePlate
 * @access  Private
 */
const getCarHistory = asyncHandler(async (req, res) => {
  const { licensePlate } = req.params;

  const appointments = await Appointment.find({
    user: req.user.id,
    'car.licensePlate': licensePlate,
    status: 'completed'
  })
    .populate('services.service')
    .sort('-completedAt');

  // Статистика
  const stats = {
    totalVisits: appointments.length,
    totalSpent: appointments.reduce((sum, app) => sum + app.finalPrice, 0),
    services: {}
  };

  // Підрахунок послуг
  appointments.forEach(app => {
    app.services.forEach(s => {
      const serviceName = s.service?.name || 'Невідома послуга';
      if (!stats.services[serviceName]) {
        stats.services[serviceName] = { count: 0, totalCost: 0 };
      }
      stats.services[serviceName].count += s.quantity;
      stats.services[serviceName].totalCost += s.price;
    });
  });

  res.status(200).json({
    success: true,
    data: {
      appointments,
      stats
    }
  });
});

/**
 * @desc    Отримати доступні часові слоти
 * @route   GET /api/appointments/slots/:date
 * @access  Public
 */
const getAvailableSlots = asyncHandler(async (req, res) => {
  const { date } = req.params;
  
  const allSlots = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
    '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
    '17:00', '17:30', '18:00'
  ];

  // Знаходимо зайняті слоти
  const bookedAppointments = await Appointment.find({
    appointmentDate: new Date(date),
    status: { $nin: ['cancelled'] }
  }).select('timeSlot');

  const bookedSlots = bookedAppointments.map(a => a.timeSlot);
  
  const availableSlots = allSlots.filter(slot => !bookedSlots.includes(slot));

  res.status(200).json({
    success: true,
    data: {
      date,
      availableSlots,
      bookedSlots
    }
  });
});

/**
 * @desc    Оновити статус запису (для адміна)
 * @route   PUT /api/appointments/:id/status
 * @access  Private/Admin
 */
const updateStatus = asyncHandler(async (req, res) => {
  const { status, mechanicNote } = req.body;

  const appointment = await Appointment.findById(req.params.id);

  if (!appointment) {
    return res.status(404).json({
      success: false,
      message: 'Запис не знайдено'
    });
  }

  appointment.status = status;
  if (mechanicNote) {
    appointment.mechanicNote = mechanicNote;
  }
  if (status === 'completed') {
    appointment.completedAt = new Date();
  }

  await appointment.save();

  res.status(200).json({
    success: true,
    message: 'Статус оновлено',
    data: { appointment }
  });
});

/**
 * @desc    Отримати записи поточного користувача
 * @route   GET /api/appointments/my
 * @access  Private
 */
const getMyAppointments = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;

  const filter = { user: req.user.id };
  
  if (status) {
    filter.status = status;
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const appointments = await Appointment.find(filter)
    .populate('services.service', 'name category basePrice duration')
    .sort('-createdAt')
    .skip(skip)
    .limit(parseInt(limit));

  // Перетворюємо для фронтенду
  const formattedAppointments = appointments.map(apt => ({
    _id: apt._id,
    service: apt.services[0]?.service || null,
    scheduledDate: apt.appointmentDate,
    carBrand: apt.car?.brand || 'Не вказано',
    carModel: apt.car?.model || '',
    carYear: apt.car?.year || new Date().getFullYear(),
    licensePlate: apt.car?.licensePlate || '',
    status: apt.status,
    isUrgent: apt.isUrgent,
    estimatedCost: apt.totalPrice,
    photos: apt.photos,
    rating: apt.rating,
    review: apt.review
  }));

  const total = await Appointment.countDocuments(filter);

  res.status(200).json({
    success: true,
    data: {
      appointments: formattedAppointments,
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
 * @desc    Додати відгук до запису
 * @route   POST /api/appointments/:id/review
 * @access  Private
 */
const addReview = asyncHandler(async (req, res) => {
  const { rating, review } = req.body;

  const appointment = await Appointment.findById(req.params.id);

  if (!appointment) {
    return res.status(404).json({
      success: false,
      message: 'Запис не знайдено'
    });
  }

  // Перевіряємо доступ
  if (appointment.user.toString() !== req.user.id) {
    return res.status(403).json({
      success: false,
      message: 'Доступ заборонено'
    });
  }

  // Можна додати відгук тільки до завершеного запису
  if (appointment.status !== 'completed') {
    return res.status(400).json({
      success: false,
      message: 'Відгук можна залишити тільки для завершених записів'
    });
  }

  appointment.rating = rating;
  appointment.review = review;
  await appointment.save();

  res.status(200).json({
    success: true,
    message: 'Відгук збережено',
    data: { appointment }
  });
});

module.exports = {
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
};
