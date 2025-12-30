const User = require('../models/User');
const { asyncHandler } = require('../middleware/error');

/**
 * @desc    Реєстрація нового користувача
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = asyncHandler(async (req, res) => {
  const { name, email, phone, password } = req.body;

  // Перевіряємо чи існує користувач з таким email
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({
      success: false,
      message: 'Користувач з таким email вже існує'
    });
  }

  // Створюємо користувача
  const user = await User.create({
    name,
    email,
    phone,
    password
  });

  // Генеруємо токен
  const token = user.getSignedJwtToken();

  res.status(201).json({
    success: true,
    message: 'Реєстрація успішна',
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        cars: user.cars,
        createdAt: user.createdAt
      },
      token
    }
  });
});

/**
 * @desc    Авторизація користувача
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Валідація
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Будь ласка, введіть email та пароль'
    });
  }

  // Шукаємо користувача (включаємо пароль)
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    console.log(`Login failed: User not found for email ${email}`);
    return res.status(401).json({
      success: false,
      message: 'Невірний email або пароль'
    });
  }

  // Перевіряємо пароль
  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    console.log(`Login failed: Password mismatch for user ${email}`);
    return res.status(401).json({
      success: false,
      message: 'Невірний email або пароль'
    });
  }

  // Генеруємо токен
  const token = user.getSignedJwtToken();

  res.status(200).json({
    success: true,
    message: 'Авторизація успішна',
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        cars: user.cars,
        createdAt: user.createdAt
      },
      token
    }
  });
});

/**
 * @desc    Отримати поточного користувача
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    success: true,
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        cars: user.cars,
        createdAt: user.createdAt
      }
    }
  });
});

/**
 * @desc    Оновити дані користувача
 * @route   PUT /api/auth/me
 * @access  Private
 */
const updateProfile = asyncHandler(async (req, res) => {
  const { name, phone, cars } = req.body;

  const updateFields = {};
  if (name) updateFields.name = name;
  if (phone) updateFields.phone = phone;
  if (cars) updateFields.cars = cars;

  const user = await User.findByIdAndUpdate(
    req.user.id,
    updateFields,
    { new: true, runValidators: true }
  );

  res.status(200).json({
    success: true,
    message: 'Профіль оновлено',
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        cars: user.cars,
        createdAt: user.createdAt
      }
    }
  });
});

/**
 * @desc    Змінити пароль
 * @route   PUT /api/auth/password
 * @access  Private
 */
const updatePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({
      success: false,
      message: 'Будь ласка, введіть поточний та новий пароль'
    });
  }

  const user = await User.findById(req.user.id).select('+password');

  // Перевіряємо поточний пароль
  const isMatch = await user.matchPassword(currentPassword);

  if (!isMatch) {
    return res.status(401).json({
      success: false,
      message: 'Невірний поточний пароль'
    });
  }

  // Оновлюємо пароль
  user.password = newPassword;
  await user.save();

  // Генеруємо новий токен
  const token = user.getSignedJwtToken();

  res.status(200).json({
    success: true,
    message: 'Пароль змінено успішно',
    data: { token }
  });
});

/**
 * @desc    Додати автомобіль
 * @route   POST /api/auth/cars
 * @access  Private
 */
const addCar = asyncHandler(async (req, res) => {
  const { brand, model, year, licensePlate } = req.body;

  if (!brand || !model || !year || !licensePlate) {
    return res.status(400).json({
      success: false,
      message: 'Будь ласка, заповніть всі поля'
    });
  }

  const user = await User.findById(req.user.id);

  user.cars.push({ brand, model, year, licensePlate });
  await user.save();

  res.status(201).json({
    success: true,
    message: 'Автомобіль додано',
    data: { cars: user.cars }
  });
});

/**
 * @desc    Видалити автомобіль
 * @route   DELETE /api/auth/cars/:carId
 * @access  Private
 */
const removeCar = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  user.cars = user.cars.filter(car => car._id.toString() !== req.params.carId);
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Автомобіль видалено',
    data: { cars: user.cars }
  });
});

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
  updatePassword,
  addCar,
  removeCar
};
