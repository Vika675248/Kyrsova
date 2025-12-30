import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { serviceService } from '../../services';
import Button from '../../components/Button/Button';
import './ServiceDetailPage.css';

/**
 * Сторінка деталей послуги
 */
const ServiceDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Завантаження послуги
  useEffect(() => {
    const fetchService = async () => {
      try {
        const response = await serviceService.getById(id);
        setService(response.data.service);
      } catch (err) {
        setError('Послугу не знайдено');
      } finally {
        setLoading(false);
      }
    };

    fetchService();
  }, [id]);

  // Назви категорій
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

  // Іконки категорій
  const categoryIcons = {
    'diagnostics': '🔍',
    'engine': '🔧',
    'transmission': '⚙️',
    'brakes': '🛑',
    'suspension': '🔩',
    'electrical': '⚡',
    'bodywork': '🚗',
    'oil-change': '🛢️',
    'tire-service': '🔵',
    'air-conditioning': '❄️',
    'other': '🔨'
  };

  if (loading) {
    return (
      <div className="service-detail-page">
        <div className="container">
          <div className="loading-container">
            <div className="loader"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="service-detail-page">
        <div className="container">
          <div className="error-state">
            <span className="error-icon">❌</span>
            <h2>{error}</h2>
            <Button onClick={() => navigate('/services')}>
              Повернутися до послуг
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="service-detail-page">
      <div className="container">
        {/* Навігація */}
        <div className="breadcrumb">
          <button onClick={() => navigate('/services')}>Послуги</button>
          <span>/</span>
          <span>{categoryNames[service.category]}</span>
          <span>/</span>
          <span>{service.name}</span>
        </div>

        {/* Основний контент */}
        <div className="service-detail-content">
          {/* Головна інформація */}
          <div className="service-main">
            <div className="service-header">
              <span className="service-icon">
                {categoryIcons[service.category] || '🔧'}
              </span>
              <div>
                <span className="service-category">
                  {categoryNames[service.category]}
                </span>
                <h1>{service.name}</h1>
              </div>
            </div>

            <p className="service-description">{service.description}</p>

            {/* Характеристики */}
            <div className="service-features">
              <div className="feature-item">
                <span className="feature-icon">⏱️</span>
                <div>
                  <span className="feature-label">Тривалість</span>
                  <span className="feature-value">{service.duration} хв</span>
                </div>
              </div>
              {service.warranty && (
                <div className="feature-item">
                  <span className="feature-icon">🛡️</span>
                  <div>
                    <span className="feature-label">Гарантія</span>
                    <span className="feature-value">{service.warranty}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Що включено */}
            {service.includes && service.includes.length > 0 && (
              <div className="service-includes">
                <h3>Що включено:</h3>
                <ul>
                  {service.includes.map((item, index) => (
                    <li key={index}>
                      <span className="check-icon">✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Бокова панель */}
          <div className="service-sidebar">
            <div className="price-card">
              <div className="price-header">
                <span className="price-label">Вартість</span>
                <span className="price-value">від {service.basePrice} грн</span>
              </div>
              
              <div className="price-info">
                <p>Точна вартість залежить від марки авто, складності робіт та необхідних запчастин</p>
              </div>

              <div className="price-actions">
                <Button 
                  variant="primary" 
                  size="large" 
                  fullWidth
                  onClick={() => navigate(`/booking?service=${service._id}`)}
                >
                  Записатися
                </Button>
                <Button 
                  variant="outline" 
                  size="large" 
                  fullWidth
                  onClick={() => navigate('/calculator')}
                >
                  Розрахувати вартість
                </Button>
              </div>

              <div className="contact-info">
                <p>Або зателефонуйте:</p>
                <a href="tel:+380501234567" className="phone-link">
                  +380 50 123 45 67
                </a>
              </div>
            </div>

            {/* Переваги */}
            <div className="benefits-card">
              <h4>Чому обирають нас:</h4>
              <ul>
                <li>
                  <span>✓</span>
                  Досвідчені майстри
                </li>
                <li>
                  <span>✓</span>
                  Оригінальні запчастини
                </li>
                <li>
                  <span>✓</span>
                  Гарантія на роботи
                </li>
                <li>
                  <span>✓</span>
                  Сучасне обладнання
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceDetailPage;
