const mongoose = require('mongoose');
const Service = require('./models/Service');
const User = require('./models/User');
require('dotenv').config();

/**
 * Скрипт для заповнення бази даних початковими даними
 */

const services = [
  // Діагностика
  {
    name: 'Комп\'ютерна діагностика',
    description: 'Повна діагностика всіх систем автомобіля за допомогою професійного обладнання. Виявлення помилок, зчитування кодів несправностей.',
    category: 'diagnostics',
    basePrice: 500,
    maxPrice: 800,
    duration: 60,
    priceUnit: 'fixed',
    popularity: 95
  },
  {
    name: 'Діагностика ходової частини',
    description: 'Перевірка стану підвіски, рульового управління, гальмівної системи на вібростенді.',
    category: 'diagnostics',
    basePrice: 400,
    duration: 45,
    priceUnit: 'fixed',
    popularity: 80
  },
  {
    name: 'Діагностика електрики',
    description: 'Перевірка електричних систем автомобіля, генератора, стартера, акумулятора.',
    category: 'diagnostics',
    basePrice: 350,
    duration: 30,
    priceUnit: 'fixed',
    popularity: 70
  },

  // Двигун
  {
    name: 'Капітальний ремонт двигуна',
    description: 'Повний ремонт двигуна з заміною основних компонентів, притиранням клапанів, заміною поршневих кілець.',
    category: 'engine',
    basePrice: 15000,
    maxPrice: 35000,
    duration: 1440,
    priceUnit: 'fixed',
    popularity: 60
  },
  {
    name: 'Заміна ременя ГРМ',
    description: 'Заміна ременя газорозподільного механізму з роликами та помпою.',
    category: 'engine',
    basePrice: 2500,
    maxPrice: 5000,
    duration: 180,
    priceUnit: 'fixed',
    popularity: 85
  },
  {
    name: 'Заміна прокладки ГБЦ',
    description: 'Заміна прокладки головки блоку циліндрів.',
    category: 'engine',
    basePrice: 3000,
    maxPrice: 6000,
    duration: 360,
    priceUnit: 'fixed',
    popularity: 55
  },
  {
    name: 'Регулювання клапанів',
    description: 'Регулювання теплових зазорів клапанів двигуна.',
    category: 'engine',
    basePrice: 800,
    duration: 120,
    priceUnit: 'fixed',
    popularity: 65
  },

  // Трансмісія
  {
    name: 'Заміна зчеплення',
    description: 'Заміна комплекту зчеплення (диск, кошик, вижимний підшипник).',
    category: 'transmission',
    basePrice: 4000,
    maxPrice: 8000,
    duration: 300,
    priceUnit: 'fixed',
    popularity: 75
  },
  {
    name: 'Ремонт АКПП',
    description: 'Діагностика та ремонт автоматичної коробки передач.',
    category: 'transmission',
    basePrice: 8000,
    maxPrice: 25000,
    duration: 480,
    priceUnit: 'fixed',
    popularity: 50
  },
  {
    name: 'Заміна масла в КПП',
    description: 'Заміна трансмісійного масла в коробці передач.',
    category: 'transmission',
    basePrice: 600,
    duration: 45,
    priceUnit: 'fixed',
    popularity: 80
  },

  // Гальма
  {
    name: 'Заміна гальмівних колодок',
    description: 'Заміна передніх або задніх гальмівних колодок.',
    category: 'brakes',
    basePrice: 400,
    duration: 60,
    priceUnit: 'per-item',
    popularity: 90
  },
  {
    name: 'Заміна гальмівних дисків',
    description: 'Заміна гальмівних дисків з колодками.',
    category: 'brakes',
    basePrice: 800,
    duration: 90,
    priceUnit: 'per-item',
    popularity: 75
  },
  {
    name: 'Прокачування гальм',
    description: 'Видалення повітря з гальмівної системи, заміна гальмівної рідини.',
    category: 'brakes',
    basePrice: 500,
    duration: 60,
    priceUnit: 'fixed',
    popularity: 65
  },
  {
    name: 'Ремонт гальмівного супорта',
    description: 'Ревізія або заміна гальмівного супорта.',
    category: 'brakes',
    basePrice: 600,
    maxPrice: 1500,
    duration: 90,
    priceUnit: 'per-item',
    popularity: 55
  },

  // Підвіска
  {
    name: 'Заміна амортизаторів',
    description: 'Заміна передніх або задніх амортизаторів.',
    category: 'suspension',
    basePrice: 600,
    duration: 120,
    priceUnit: 'per-item',
    popularity: 85
  },
  {
    name: 'Заміна кульових опор',
    description: 'Заміна кульових опор передньої підвіски.',
    category: 'suspension',
    basePrice: 500,
    duration: 60,
    priceUnit: 'per-item',
    popularity: 80
  },
  {
    name: 'Заміна сайлентблоків',
    description: 'Заміна сайлентблоків важелів підвіски.',
    category: 'suspension',
    basePrice: 400,
    duration: 90,
    priceUnit: 'per-item',
    popularity: 75
  },
  {
    name: 'Заміна ступичного підшипника',
    description: 'Заміна підшипника маточини колеса.',
    category: 'suspension',
    basePrice: 800,
    duration: 120,
    priceUnit: 'per-item',
    popularity: 70
  },
  {
    name: 'Регулювання розвал-сходження',
    description: 'Регулювання кутів установки коліс на 3D стенді.',
    category: 'suspension',
    basePrice: 600,
    duration: 60,
    priceUnit: 'fixed',
    popularity: 90
  },

  // Електрика
  {
    name: 'Заміна генератора',
    description: 'Заміна генератора з перевіркою зарядної системи.',
    category: 'electrical',
    basePrice: 1200,
    maxPrice: 2500,
    duration: 120,
    priceUnit: 'fixed',
    popularity: 60
  },
  {
    name: 'Заміна стартера',
    description: 'Заміна стартера з перевіркою системи запуску.',
    category: 'electrical',
    basePrice: 1000,
    maxPrice: 2000,
    duration: 90,
    priceUnit: 'fixed',
    popularity: 55
  },
  {
    name: 'Ремонт електропроводки',
    description: 'Діагностика та ремонт електричної проводки автомобіля.',
    category: 'electrical',
    basePrice: 500,
    duration: 60,
    priceUnit: 'per-hour',
    popularity: 50
  },
  {
    name: 'Заміна акумулятора',
    description: 'Підбір та встановлення нового акумулятора.',
    category: 'electrical',
    basePrice: 200,
    duration: 15,
    priceUnit: 'fixed',
    popularity: 85
  },

  // Кузовні роботи
  {
    name: 'Фарбування елемента',
    description: 'Повне фарбування одного елемента кузова.',
    category: 'bodywork',
    basePrice: 2500,
    maxPrice: 5000,
    duration: 480,
    priceUnit: 'per-item',
    popularity: 70
  },
  {
    name: 'Рихтування',
    description: 'Рихтувальні роботи з відновлення геометрії кузова.',
    category: 'bodywork',
    basePrice: 1500,
    duration: 180,
    priceUnit: 'per-hour',
    popularity: 55
  },
  {
    name: 'Полірування кузова',
    description: 'Абразивне полірування кузова з нанесенням захисного покриття.',
    category: 'bodywork',
    basePrice: 3000,
    duration: 360,
    priceUnit: 'fixed',
    popularity: 75
  },

  // Заміна масла
  {
    name: 'Заміна моторного масла',
    description: 'Заміна моторного масла з фільтром.',
    category: 'oil-change',
    basePrice: 400,
    duration: 30,
    priceUnit: 'fixed',
    popularity: 100
  },
  {
    name: 'Заміна масла в редукторі',
    description: 'Заміна масла в задньому/передньому редукторі.',
    category: 'oil-change',
    basePrice: 500,
    duration: 45,
    priceUnit: 'fixed',
    popularity: 60
  },

  // Шиномонтаж
  {
    name: 'Шиномонтаж 4 колеса',
    description: 'Зняття, монтаж та балансування 4 коліс.',
    category: 'tire-service',
    basePrice: 600,
    duration: 60,
    priceUnit: 'fixed',
    popularity: 95
  },
  {
    name: 'Ремонт проколу',
    description: 'Ремонт проколу шини джгутом або латкою.',
    category: 'tire-service',
    basePrice: 150,
    duration: 20,
    priceUnit: 'per-item',
    popularity: 85
  },
  {
    name: 'Зберігання шин (сезон)',
    description: 'Сезонне зберігання комплекту шин.',
    category: 'tire-service',
    basePrice: 800,
    duration: 15,
    priceUnit: 'fixed',
    popularity: 70
  },

  // Кондиціонер
  {
    name: 'Заправка кондиціонера',
    description: 'Заправка системи кондиціонування фреоном з діагностикою витоків.',
    category: 'air-conditioning',
    basePrice: 800,
    duration: 60,
    priceUnit: 'fixed',
    popularity: 85
  },
  {
    name: 'Ремонт кондиціонера',
    description: 'Діагностика та ремонт системи кондиціонування.',
    category: 'air-conditioning',
    basePrice: 1500,
    maxPrice: 5000,
    duration: 180,
    priceUnit: 'fixed',
    popularity: 60
  },
  {
    name: 'Заміна фільтра салону',
    description: 'Заміна салонного фільтра кондиціонера.',
    category: 'air-conditioning',
    basePrice: 200,
    duration: 15,
    priceUnit: 'fixed',
    popularity: 90
  },

  // Інше
  {
    name: 'Технічний огляд',
    description: 'Підготовка та проходження технічного огляду.',
    category: 'other',
    basePrice: 500,
    duration: 120,
    priceUnit: 'fixed',
    popularity: 80
  },
  {
    name: 'Евакуація автомобіля',
    description: 'Евакуація автомобіля в межах міста.',
    category: 'other',
    basePrice: 800,
    maxPrice: 2000,
    duration: 60,
    priceUnit: 'fixed',
    popularity: 50
  }
];

// Адміністратор за замовчуванням
const adminUser = {
  name: 'Адміністратор',
  email: 'admin@autoservice.ua',
  phone: '+380501234567',
  password: 'admin123',
  role: 'admin'
};

// Тестовий користувач
const testUser = {
  name: 'Тестовий Користувач',
  email: 'user@example.com',
  phone: '+380509876543',
  password: 'user123',
  role: 'user',
  cars: [
    {
      brand: 'Toyota',
      model: 'Camry',
      year: 2020,
      licensePlate: 'AA1234BB'
    },
    {
      brand: 'Volkswagen',
      model: 'Golf',
      year: 2018,
      licensePlate: 'BC5678DE'
    }
  ]
};

/**
 * Функція заповнення бази даних
 */
const seedDatabase = async () => {
  try {
    // Підключення до MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/autoservice');
    console.log('✅ Підключено до MongoDB');

    // Очищення колекцій
    await Service.deleteMany({});
    await User.deleteMany({});
    console.log('🗑️ Колекції очищено');

    // Додавання послуг
    await Service.insertMany(services);
    console.log(`✅ Додано ${services.length} послуг`);

    // Додавання користувачів
    await User.create(adminUser);
    await User.create(testUser);
    console.log('✅ Додано користувачів');

    console.log('\n✅ База даних успішно заповнена!');
    console.log('\n📧 Дані для входу:');
    console.log('   Адмін: admin@autoservice.ua / admin123');
    console.log('   Користувач: user@example.com / user123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Помилка заповнення бази даних:', error);
    process.exit(1);
  }
};

seedDatabase();
