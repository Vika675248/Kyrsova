import React from 'react';
import { Link } from 'react-router-dom';
import './ServiceCard.css';

/**
 * Компонент ServiceCard
 * Картка послуги для відображення в списку
 * Перевикористовується на: головній, сторінці послуг, калькуляторі
 */
const ServiceCard = ({ 
  service, 
  onSelect, 
  selected = false, 
  showDetails = true,
  compact = false 
}) => {
  // Мапа іконок для категорій
  const categoryIcons = {
    'diagnostics': '🔍',
    'engine': '⚙️',
    'transmission': '🔧',
    'brakes': '🛑',
    'suspension': '🚗',
    'electrical': '⚡',
    'bodywork': '🎨',
    'oil-change': '🛢️',
    'tire-service': '🛞',
    'air-conditioning': '❄️',
    'other': '🔩'
  };

  // Мапа назв категорій
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

  // Форматування ціни
  const formatPrice = () => {
    if (service.maxPrice && service.maxPrice > service.basePrice) {
      return `${service.basePrice} - ${service.maxPrice} грн`;
    }
    return `від ${service.basePrice} грн`;
  };

  // Форматування тривалості
  const formatDuration = (minutes) => {
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return mins > 0 ? `${hours} год ${mins} хв` : `${hours} год`;
    }
    return `${minutes} хв`;
  };

  // Обробка кліку
  const handleClick = () => {
    if (onSelect) {
      onSelect(service);
    }
  };

  // Компактний варіант для калькулятора
  if (compact) {
    return (
      <div 
        className={`service-card-compact ${selected ? 'selected' : ''}`}
        onClick={handleClick}
      >
        <div className="service-card-compact-icon">
          {categoryIcons[service.category] || '🔧'}
        </div>
        <div className="service-card-compact-info">
          <h4 className="service-card-compact-name">{service.name}</h4>
          <span className="service-card-compact-price">{formatPrice()}</span>
        </div>
        {selected && <span className="service-card-compact-check">✓</span>}
      </div>
    );
  }

  return (
    <div 
      className={`service-card ${selected ? 'selected' : ''} ${onSelect ? 'clickable' : ''}`}
      onClick={onSelect ? handleClick : undefined}
    >
      {/* Іконка категорії */}
      <div className="service-card-icon">
        {categoryIcons[service.category] || '🔧'}
      </div>

      {/* Контент */}
      <div className="service-card-content">
        <span className="service-card-category">
          {categoryNames[service.category] || service.category}
        </span>
        <h3 className="service-card-title">{service.name}</h3>
        
        {showDetails && (
          <p className="service-card-description">
            {service.description?.substring(0, 100)}
            {service.description?.length > 100 ? '...' : ''}
          </p>
        )}

        {/* Інформація */}
        <div className="service-card-meta">
          <span className="service-card-duration">
            🕐 {formatDuration(service.duration)}
          </span>
          <span className="service-card-price">
            {formatPrice()}
          </span>
        </div>
      </div>

      {/* Кнопка детальніше */}
      {showDetails && !onSelect && (
        <Link to={`/services/${service._id}`} className="service-card-link">
          Детальніше →
        </Link>
      )}

      {/* Чекбокс для вибору */}
      {selected && (
        <div className="service-card-selected">
          <span className="checkmark">✓</span>
        </div>
      )}
    </div>
  );
};

export default ServiceCard;
