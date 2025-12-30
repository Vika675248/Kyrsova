const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const config = require('../config');

/**
 * Налаштування сховища для завантажених файлів
 */
const storage = multer.diskStorage({
  // Директорія для збереження
  destination: function(req, file, cb) {
    cb(null, path.join(__dirname, '..', config.upload.uploadPath));
  },
  
  // Генерація унікального імені файлу
  filename: function(req, file, cb) {
    const uniqueId = uuidv4();
    const extension = path.extname(file.originalname);
    cb(null, `${uniqueId}${extension}`);
  }
});

/**
 * Фільтр типів файлів
 */
const fileFilter = (req, file, cb) => {
  // Перевіряємо тип файлу
  if (config.upload.allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Недозволений тип файлу. Дозволені: ${config.upload.allowedTypes.join(', ')}`), false);
  }
};

/**
 * Middleware: Завантаження зображень
 */
const uploadImage = multer({
  storage: storage,
  limits: {
    fileSize: config.upload.maxFileSize
  },
  fileFilter: fileFilter
});

/**
 * Middleware: Завантаження одного зображення
 */
const uploadSingle = uploadImage.single('image');

/**
 * Middleware: Завантаження кількох зображень
 */
const uploadMultiple = uploadImage.array('photos', 10);

/**
 * Middleware: Обробка помилок завантаження
 */
const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: `Розмір файлу перевищує максимально дозволений (${config.upload.maxFileSize / 1024 / 1024}MB)`
      });
    }
    return res.status(400).json({
      success: false,
      message: err.message
    });
  } else if (err) {
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }
  next();
};

module.exports = {
  uploadSingle,
  uploadMultiple,
  handleUploadError
};
