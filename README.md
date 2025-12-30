# Веб-орієнтована інформаційна система "Автосервіс"

## Опис проекту

Повнофункціональна веб-орієнтована інформаційна система для автосервісу, що включає:
- Каталог послуг з цінами
- Онлайн-запис на ремонт
- Калькулятор вартості ремонту
- Історія ремонтів авто (для авторизованих користувачів)
- Можливість додавати фото до запису

## Технології

### Frontend
- React 18
- React Router DOM
- CSS Modules / Flexbox / Grid
- Axios для HTTP-запитів

### Backend
- Node.js
- Express.js
- MongoDB (Mongoose)
- JWT для авторизації
- Multer для завантаження файлів

## Встановлення

### Вимоги
- Node.js 18+ 
- MongoDB 6+
- npm 9+

### Команди встановлення

```bash
# Встановлення всіх залежностей
npm run install:all

# Або окремо
npm install
cd client && npm install
```

## Запуск

### Режим розробки
```bash
# Запуск сервера та клієнта одночасно
npm start

# Або окремо
npm run server:dev  # Backend на порту 5000
npm run client      # Frontend на порту 3000
```

### Production збірка
```bash
npm run build
npm run server
```

## Структура проекту

```
autoservice-system/
├── client/                 # Frontend (React)
│   ├── public/
│   ├── src/
│   │   ├── components/     # Компоненти
│   │   ├── pages/          # Сторінки
│   │   ├── services/       # API сервіси
│   │   ├── context/        # React Context
│   │   ├── hooks/          # Кастомні хуки
│   │   └── styles/         # CSS стилі
│   └── package.json
├── server/                 # Backend (Node.js)
│   ├── config/             # Конфігурація
│   ├── controllers/        # Контролери
│   ├── middleware/         # Middleware
│   ├── models/             # Моделі даних
│   ├── routes/             # Маршрути API
│   ├── uploads/            # Завантажені файли
│   └── index.js            # Точка входу
├── package.json
└── README.md
```

## API Endpoints

### Послуги
- `GET /api/services` - Отримати всі послуги
- `GET /api/services/:id` - Отримати послугу за ID
- `POST /api/services` - Створити послугу (admin)
- `PUT /api/services/:id` - Оновити послугу (admin)
- `DELETE /api/services/:id` - Видалити послугу (admin)

### Записи на ремонт
- `GET /api/appointments` - Отримати записи користувача
- `POST /api/appointments` - Створити запис
- `PUT /api/appointments/:id` - Оновити запис
- `DELETE /api/appointments/:id` - Скасувати запис
- `POST /api/appointments/:id/photos` - Додати фото

### Калькулятор
- `POST /api/calculator` - Розрахувати вартість ремонту

### Авторизація
- `POST /api/auth/register` - Реєстрація
- `POST /api/auth/login` - Вхід
- `GET /api/auth/me` - Поточний користувач

## Автор

Курсова робота з дисципліни "Веб-технології та веб-дизайн"

## Ліцензія

MIT
