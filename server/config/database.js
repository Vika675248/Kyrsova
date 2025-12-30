const mongoose = require('mongoose');
const config = require('./index');

/**
 * Підключення до бази даних MongoDB
 * @returns {Promise} Promise об'єкт підключення
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(config.mongoURI, {
      // Нові опції Mongoose 6+
    });

    console.log(`✅ MongoDB підключено: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`❌ Помилка підключення до MongoDB: ${error.message}`);
    
    // Використання локального сховища як fallback
    console.log('⚠️ Використовується локальне JSON сховище');
    return null;
  }
};

module.exports = connectDB;
