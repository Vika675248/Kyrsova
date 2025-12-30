import React, { useState } from 'react';
import { appointmentService } from '../../services';
import Button from '../../components/Button/Button';
import './HistoryPage.css';

/**
 * Сторінка історії ремонтів
 */
const HistoryPage = () => {
  const [licensePlate, setLicensePlate] = useState('');
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  // Пошук
  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!licensePlate.trim()) return;

    setLoading(true);
    setSearched(true);
    try {
      const response = await appointmentService.getHistory(licensePlate);
      // API повертає { appointments: [...], stats: {...} }
      setHistory(response.appointments || []);
    } catch (error) {
      console.error('Error fetching history:', error);
      setHistory([]);
    } finally {
      setLoading(false);
    }
  };

  // Форматування дати
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('uk-UA', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  // Статуси
  const statusLabels = {
    'completed': 'Завершено',
    'in-progress': 'В роботі',
    'cancelled': 'Скасовано'
  };

  return (
    <div className="history-page">
      <div className="container">
        {/* Заголовок */}
        <div className="page-header">
          <h1>📜 Історія ремонтів</h1>
          <p>Перегляньте повну історію обслуговування вашого автомобіля</p>
        </div>

        {/* Форма пошуку */}
        <div className="search-section">
          <form className="search-form" onSubmit={handleSearch}>
            <div className="search-input-group">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                value={licensePlate}
                onChange={(e) => setLicensePlate(e.target.value.toUpperCase())}
                placeholder="Введіть держ. номер (AA1234BB)"
                className="search-input"
              />
            </div>
            <Button 
              type="submit" 
              variant="primary" 
              size="large"
              disabled={loading || !licensePlate.trim()}
            >
              {loading ? 'Пошук...' : 'Знайти'}
            </Button>
          </form>
        </div>

        {/* Результати */}
        {loading ? (
          <div className="loading-container">
            <div className="loader"></div>
          </div>
        ) : searched ? (
          history.length > 0 ? (
            <div className="history-results">
              <div className="results-header">
                <h2>Знайдено записів: {history.length}</h2>
                <p>Держ. номер: {licensePlate}</p>
              </div>

              {/* Таймлайн */}
              <div className="history-timeline">
                {history.map((item, index) => (
                  <div key={item._id} className="timeline-item">
                    <div className="timeline-marker">
                      <span className="marker-dot"></span>
                      {index < history.length - 1 && <span className="marker-line"></span>}
                    </div>
                    
                    <div className="timeline-content">
                      <div className="timeline-header">
                        <span className="timeline-date">{formatDate(item.completedAt || item.appointmentDate)}</span>
                        <span className={`timeline-status status-${item.status}`}>
                          {statusLabels[item.status]}
                        </span>
                      </div>
                      
                      <div className="timeline-card">
                        <h3>{item.services?.[0]?.service?.name || 'Невідома послуга'}</h3>
                        <p className="service-category">{item.services?.[0]?.service?.category || 'Послуга'}</p>
                        
                        <div className="timeline-details">
                          <div className="detail-item">
                            <span className="label">Пробіг:</span>
                            <span className="value">{item.car?.mileage || 'Не вказано'} км</span>
                          </div>
                          <div className="detail-item">
                            <span className="label">Вартість:</span>
                            <span className="value">{item.finalPrice || item.totalPrice || 0} грн</span>
                          </div>
                        </div>

                        {item.mechanicNote && (
                          <div className="timeline-notes">
                            <strong>Примітки майстра:</strong>
                            <p>{item.mechanicNote}</p>
                          </div>
                        )}

                        {item.photos && item.photos.length > 0 && (
                          <div className="timeline-photos">
                            {item.photos.slice(0, 3).map((photo, i) => (
                              <img 
                                key={i}
                                src={`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${photo.url || photo}`}
                                alt={`Фото ${i + 1}`}
                              />
                            ))}
                            {item.photos.length > 3 && (
                              <span className="more-photos">+{item.photos.length - 3}</span>
                            )}
                          </div>
                        )}

                        {item.rating?.score && (
                          <div className="timeline-rating">
                            {[1, 2, 3, 4, 5].map(star => (
                              <span key={star} className={star <= item.rating.score ? 'star active' : 'star'}>
                                ★
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="empty-state">
              <span className="empty-icon">📭</span>
              <h3>Записів не знайдено</h3>
              <p>Для держ. номера "{licensePlate}" немає історії обслуговування</p>
            </div>
          )
        ) : (
          <div className="info-section">
            <div className="info-card">
              <span className="info-icon">🔍</span>
              <h3>Як знайти історію?</h3>
              <ol>
                <li>Введіть державний номер вашого автомобіля</li>
                <li>Натисніть кнопку "Знайти"</li>
                <li>Перегляньте повну історію обслуговування</li>
              </ol>
            </div>
            
            <div className="info-card">
              <span className="info-icon">📋</span>
              <h3>Що ви побачите?</h3>
              <ul>
                <li>Дати всіх візитів</li>
                <li>Виконані роботи</li>
                <li>Вартість обслуговування</li>
                <li>Фото ремонтів</li>
              </ul>
            </div>
            
            <div className="info-card">
              <span className="info-icon">🔒</span>
              <h3>Конфіденційність</h3>
              <p>Інформація доступна тільки власнику автомобіля. Ми не передаємо дані третім особам.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryPage;
