import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { serviceService, appointmentService } from '../../services';
import Button from '../../components/Button/Button';
import './BookingPage.css';

/**
 * Сторінка бронювання
 */
const BookingPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, isAuthenticated } = useAuth();
  
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  // Форма
  const [formData, setFormData] = useState({
    serviceId: searchParams.get('service') || '',
    carId: '',
    date: '',
    time: '',
    description: '',
    isUrgent: false
  });

  // Доступні слоти часу
  const timeSlots = [
    '09:00', '10:00', '11:00', '12:00', 
    '13:00', '14:00', '15:00', '16:00', '17:00'
  ];

  // Завантаження даних
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await serviceService.getAll({ limit: 100 });
        setServices(response.data.services);
      } catch (error) {
        console.error('Error fetching services:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  // Перевірка авторизації
  useEffect(() => {
    if (!isAuthenticated) {
      toast.info('Для бронювання потрібно увійти в систему');
      navigate('/login', { state: { from: '/booking' } });
    }
  }, [isAuthenticated, navigate]);

  // Обробка форми
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Вибір авто
  const handleCarSelect = (carId) => {
    setFormData(prev => ({ ...prev, carId }));
  };

  // Наступний крок
  const nextStep = () => {
    if (currentStep === 1 && !formData.serviceId) {
      toast.error('Оберіть послугу');
      return;
    }
    if (currentStep === 2 && !formData.carId && user?.cars?.length > 0) {
      toast.error('Оберіть автомобіль');
      return;
    }
    if (currentStep === 3 && (!formData.date || !formData.time)) {
      toast.error('Оберіть дату та час');
      return;
    }
    setCurrentStep(prev => prev + 1);
  };

  // Попередній крок
  const prevStep = () => {
    setCurrentStep(prev => prev - 1);
  };

  // Відправка форми
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.serviceId || !formData.date || !formData.time) {
      toast.error('Заповніть всі обов\'язкові поля');
      return;
    }

    setSubmitting(true);
    try {
      // Формуємо дату та час
      const scheduledDate = new Date(`${formData.date}T${formData.time}:00`);
      
      // Отримуємо дані вибраного авто
      const selectedCar = user?.cars?.find(c => c._id === formData.carId);
      
      const appointmentData = {
        service: formData.serviceId,
        scheduledDate: scheduledDate.toISOString(),
        carBrand: selectedCar?.brand || 'Не вказано',
        carModel: selectedCar?.model || 'Не вказано',
        carYear: selectedCar?.year || new Date().getFullYear(),
        licensePlate: selectedCar?.licensePlate || 'Не вказано',
        description: formData.description,
        isUrgent: formData.isUrgent
      };

      await appointmentService.create(appointmentData);
      toast.success('Запис успішно створено!');
      navigate('/appointments');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Помилка при створенні запису');
    } finally {
      setSubmitting(false);
    }
  };

  // Мінімальна дата - завтра
  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 1);
  const minDateStr = minDate.toISOString().split('T')[0];

  // Максимальна дата - через 30 днів
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 30);
  const maxDateStr = maxDate.toISOString().split('T')[0];

  // Групування послуг
  const groupedServices = services.reduce((acc, service) => {
    if (!acc[service.category]) {
      acc[service.category] = [];
    }
    acc[service.category].push(service);
    return acc;
  }, {});

  const categoryNames = {
    'diagnostics': 'Діагностика',
    'engine': 'Двигун',
    'transmission': 'Трансмісія',
    'brakes': 'Гальма',
    'suspension': 'Підвіска',
    'electrical': 'Електрика',
    'bodywork': 'Кузовні роботи',
    'oil-change': 'Заміна масла',
    'tire-service': 'Шиномонтаж',
    'air-conditioning': 'Кондиціонер',
    'other': 'Інше'
  };

  // Обрана послуга
  const selectedService = services.find(s => s._id === formData.serviceId);

  if (loading) {
    return (
      <div className="booking-page">
        <div className="container">
          <div className="loading-container">
            <div className="loader"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="booking-page">
      <div className="container">
        {/* Заголовок */}
        <div className="page-header">
          <h1>📅 Онлайн-запис</h1>
          <p>Оберіть послугу, час та заповніть форму</p>
        </div>

        {/* Прогрес */}
        <div className="booking-progress">
          <div className={`progress-step ${currentStep >= 1 ? 'active' : ''} ${currentStep > 1 ? 'completed' : ''}`}>
            <span className="step-number">1</span>
            <span className="step-label">Послуга</span>
          </div>
          <div className="progress-line"></div>
          <div className={`progress-step ${currentStep >= 2 ? 'active' : ''} ${currentStep > 2 ? 'completed' : ''}`}>
            <span className="step-number">2</span>
            <span className="step-label">Авто</span>
          </div>
          <div className="progress-line"></div>
          <div className={`progress-step ${currentStep >= 3 ? 'active' : ''} ${currentStep > 3 ? 'completed' : ''}`}>
            <span className="step-number">3</span>
            <span className="step-label">Час</span>
          </div>
          <div className="progress-line"></div>
          <div className={`progress-step ${currentStep >= 4 ? 'active' : ''}`}>
            <span className="step-number">4</span>
            <span className="step-label">Підтвердження</span>
          </div>
        </div>

        <form className="booking-form" onSubmit={handleSubmit}>
          {/* Крок 1: Вибір послуги */}
          {currentStep === 1 && (
            <div className="booking-step">
              <h2>Оберіть послугу</h2>
              
              <div className="service-select-grid">
                {Object.entries(groupedServices).map(([category, categoryServices]) => (
                  <div key={category} className="service-category-group">
                    <h3>{categoryNames[category] || category}</h3>
                    <div className="service-options">
                      {categoryServices.map(service => (
                        <label 
                          key={service._id} 
                          className={`service-option ${formData.serviceId === service._id ? 'selected' : ''}`}
                        >
                          <input
                            type="radio"
                            name="serviceId"
                            value={service._id}
                            checked={formData.serviceId === service._id}
                            onChange={handleChange}
                          />
                          <div className="option-content">
                            <span className="option-name">{service.name}</span>
                            <span className="option-price">від {service.basePrice} грн</span>
                            <span className="option-duration">{service.duration} хв</span>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="step-actions">
                <Button 
                  variant="primary" 
                  size="large"
                  onClick={nextStep}
                  disabled={!formData.serviceId}
                >
                  Далі →
                </Button>
              </div>
            </div>
          )}

          {/* Крок 2: Вибір авто */}
          {currentStep === 2 && (
            <div className="booking-step">
              <h2>Оберіть автомобіль</h2>
              
              {user?.cars && user.cars.length > 0 ? (
                <div className="car-select-grid">
                  {user.cars.map(car => (
                    <div 
                      key={car._id}
                      className={`car-option ${formData.carId === car._id ? 'selected' : ''}`}
                      onClick={() => handleCarSelect(car._id)}
                    >
                      <span className="car-icon">🚗</span>
                      <div className="car-info">
                        <span className="car-name">{car.brand} {car.model}</span>
                        <span className="car-details">{car.year} • {car.licensePlate}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-cars-message">
                  <span className="icon">🚙</span>
                  <p>У вас ще немає збережених автомобілів</p>
                  <Button 
                    variant="outline"
                    onClick={() => navigate('/profile')}
                  >
                    Додати авто в профілі
                  </Button>
                </div>
              )}

              <div className="step-actions">
                <Button variant="outline" onClick={prevStep}>
                  ← Назад
                </Button>
                <Button 
                  variant="primary" 
                  onClick={nextStep}
                  disabled={!formData.carId && user?.cars?.length > 0}
                >
                  Далі →
                </Button>
              </div>
            </div>
          )}

          {/* Крок 3: Вибір часу */}
          {currentStep === 3 && (
            <div className="booking-step">
              <h2>Оберіть дату та час</h2>
              
              <div className="datetime-select">
                <div className="form-group">
                  <label htmlFor="date">Дата</label>
                  <input
                    type="date"
                    id="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    min={minDateStr}
                    max={maxDateStr}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label>Час</label>
                  <div className="time-slots">
                    {timeSlots.map(time => (
                      <button
                        key={time}
                        type="button"
                        className={`time-slot ${formData.time === time ? 'selected' : ''}`}
                        onClick={() => setFormData(prev => ({ ...prev, time }))}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="form-group checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="isUrgent"
                      checked={formData.isUrgent}
                      onChange={handleChange}
                    />
                    Терміновий ремонт (+30% до вартості)
                  </label>
                </div>

                <div className="form-group">
                  <label htmlFor="description">Опис проблеми (необов'язково)</label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="3"
                    placeholder="Опишіть симптоми несправності..."
                    className="form-textarea"
                  />
                </div>
              </div>

              <div className="step-actions">
                <Button variant="outline" onClick={prevStep}>
                  ← Назад
                </Button>
                <Button 
                  variant="primary" 
                  onClick={nextStep}
                  disabled={!formData.date || !formData.time}
                >
                  Далі →
                </Button>
              </div>
            </div>
          )}

          {/* Крок 4: Підтвердження */}
          {currentStep === 4 && (
            <div className="booking-step">
              <h2>Підтвердіть запис</h2>
              
              <div className="booking-summary">
                <div className="summary-item">
                  <span className="label">Послуга:</span>
                  <span className="value">{selectedService?.name}</span>
                </div>
                <div className="summary-item">
                  <span className="label">Вартість:</span>
                  <span className="value">від {selectedService?.price} грн</span>
                </div>
                <div className="summary-item">
                  <span className="label">Автомобіль:</span>
                  <span className="value">
                    {user?.cars?.find(c => c._id === formData.carId)?.brand}{' '}
                    {user?.cars?.find(c => c._id === formData.carId)?.model}
                  </span>
                </div>
                <div className="summary-item">
                  <span className="label">Дата:</span>
                  <span className="value">
                    {new Date(formData.date).toLocaleDateString('uk-UA', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
                <div className="summary-item">
                  <span className="label">Час:</span>
                  <span className="value">{formData.time}</span>
                </div>
                {formData.isUrgent && (
                  <div className="summary-item urgent">
                    <span className="label">⚡ Терміновий ремонт</span>
                  </div>
                )}
                {formData.description && (
                  <div className="summary-item description">
                    <span className="label">Опис:</span>
                    <span className="value">{formData.description}</span>
                  </div>
                )}
              </div>

              <div className="booking-note">
                <p>Після підтвердження ви отримаєте сповіщення. 
                   Наш менеджер зв'яжеться з вами для уточнення деталей.</p>
              </div>

              <div className="step-actions">
                <Button variant="outline" onClick={prevStep}>
                  ← Назад
                </Button>
                <Button 
                  type="submit"
                  variant="primary" 
                  size="large"
                  disabled={submitting}
                >
                  {submitting ? 'Обробка...' : 'Підтвердити запис'}
                </Button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default BookingPage;
