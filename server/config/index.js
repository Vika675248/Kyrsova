require('dotenv').config();

module.exports = {
  // Налаштування порту
  port: process.env.PORT || 5000,
  
  // MongoDB підключення
  mongoURI: process.env.MONGODB_URI || 'mongodb://localhost:27017/autoservice',
  
  // JWT налаштування
  jwtSecret: process.env.JWT_SECRET || 'default_secret_key',
  jwtExpire: process.env.JWT_EXPIRE || '7d',
  
  // Режим роботи
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Налаштування завантаження файлів
  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB
    allowedTypes: (process.env.ALLOWED_FILE_TYPES || 'image/jpeg,image/png,image/gif,image/webp').split(','),
    uploadPath: 'uploads/'
  }
};
