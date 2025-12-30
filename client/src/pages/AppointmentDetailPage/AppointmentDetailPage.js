import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { appointmentService } from '../../services';
import Button from '../../components/Button/Button';
import './AppointmentDetailPage.css';

/**
 * Сторінка деталей запису
 */
const AppointmentDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');

  // Завантаження запису
  useEffect(() => {
    const fetchAppointment = async () => {
      try {
        const response = await appointmentService.getById(id);
        setAppointment(response.data.appointment);
        if (response.data.appointment.rating) {
          setRating(response.data.appointment.rating);
          setReview(response.data.appointment.review || '');
        }
      } catch (error) {
        toast.error('Запис не знайдено');
        navigate('/appointments');
      } finally {
        setLoading(false);
      }
    };

    fetchAppointment();
  }, [id, navigate]);

  // Статуси
  const statusLabels = {
    'pending': 'Очікує підтвердження',
    'confirmed': 'Підтверджено',
    'in-progress': 'В роботі',
    'completed': 'Завершено',
    'cancelled': 'Скасовано'
  };

  const statusIcons = {
    'pending': '⏳',
    'confirmed': '✅',
    'in-progress': '🔧',
    'completed': '✔️',
    'cancelled': '❌'
  };

  // Завантаження фото
  const handlePhotoUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      const formData = new FormData();
      for (let i = 0; i < files.length; i++) {
        formData.append('photos', files[i]);
      }

      const response = await appointmentService.uploadPhotos(id, formData);
      setAppointment(prev => ({
        ...prev,
        photos: response.data.photos
      }));
      toast.success('Фото завантажено!');
    } catch (error) {
      toast.error('Помилка завантаження фото');
    } finally {
      setUploading(false);
    }
  };

  // Відправка відгуку
  const handleReviewSubmit = async () => {
    if (rating === 0) {
      toast.error('Оберіть рейтинг');
      return;
    }

    try {
      await appointmentService.addReview(id, { rating, review });
      setAppointment(prev => ({ ...prev, rating, review }));
      toast.success('Відгук збережено!');
    } catch (error) {
      toast.error('Помилка збереження відгуку');
    }
  };

  // Скасування
  const handleCancel = async () => {
    if (!window.confirm('Скасувати цей запис?')) return;
    
    try {
      await appointmentService.cancel(id);
      setAppointment(prev => ({ ...prev, status: 'cancelled' }));
      toast.success('Запис скасовано');
    } catch (error) {
      toast.error('Помилка скасування');
    }
  };

  // Форматування дати
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('uk-UA', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="appointment-detail-page">
        <div className="container">
          <div className="loading-container">
            <div className="loader"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="appointment-detail-page">
      <div className="container">
        {/* Навігація */}
        <button className="back-btn" onClick={() => navigate('/appointments')}>
          ← Назад до записів
        </button>

        <div className="appointment-layout">
          {/* Основна інформація */}
          <div className="main-content">
            <div className="appointment-header-card">
              <div className="status-section">
                <span className={`status-badge status-${appointment.status}`}>
                  {statusIcons[appointment.status]} {statusLabels[appointment.status]}
                </span>
                {appointment.isUrgent && (
                  <span className="urgent-badge">⚡ Терміновий</span>
                )}
              </div>

              <h1>{appointment.services?.[0]?.service?.name || 'Послуга'}</h1>
              
              <div className="appointment-meta">
                <div className="meta-item">
                  <span className="meta-icon">📅</span>
                  <span>{new Date(appointment.appointmentDate).toLocaleDateString()} {appointment.timeSlot}</span>
                </div>
                <div className="meta-item">
                  <span className="meta-icon">⏱️</span>
                  <span>{appointment.services?.[0]?.service?.duration} хв</span>
                </div>
              </div>
            </div>

            {/* Інформація про авто */}
            <div className="info-card">
              <h3>🚗 Автомобіль</h3>
              <div className="info-grid">
                <div className="info-item">
                  <span className="label">Марка/Модель:</span>
                  <span className="value">{appointment.car?.brand} {appointment.car?.model}</span>
                </div>
                <div className="info-item">
                  <span className="label">Рік випуску:</span>
                  <span className="value">{appointment.car?.year}</span>
                </div>
                <div className="info-item">
                  <span className="label">Держ. номер:</span>
                  <span className="value">{appointment.car?.licensePlate}</span>
                </div>
              </div>
            </div>

            {/* Опис проблеми */}
            {appointment.customerNote && (
              <div className="info-card">
                <h3>📝 Опис проблеми</h3>
                <p className="description-text">{appointment.customerNote}</p>
              </div>
            )}

            {/* Фото */}
            <div className="info-card">
              <div className="card-header">
                <h3>📷 Фото</h3>
                {appointment.status !== 'cancelled' && (
                  <Button 
                    variant="outline" 
                    size="small"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                  >
                    {uploading ? 'Завантаження...' : '+ Додати фото'}
                  </Button>
                )}
              </div>
              
              <input
                type="file"
                ref={fileInputRef}
                onChange={handlePhotoUpload}
                accept="image/*"
                multiple
                style={{ display: 'none' }}
              />

              {appointment.photos && appointment.photos.length > 0 ? (
                <div className="photos-grid">
                  {appointment.photos.map((photo, index) => (
                    <div key={index} className="photo-item">
                      <img 
                        src={`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${photo.url || photo}`} 
                        alt={`Фото ${index + 1}`} 
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="no-photos">Фото ще не додано</p>
              )}
            </div>

            {/* Відгук */}
            {appointment.status === 'completed' && (
              <div className="info-card">
                <h3>⭐ Ваш відгук</h3>
                
                <div className="rating-input">
                  <span>Оцінка:</span>
                  <div className="stars">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        type="button"
                        className={`star-btn ${rating >= star ? 'active' : ''}`}
                        onClick={() => setRating(star)}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>

                <textarea
                  value={review}
                  onChange={(e) => setReview(e.target.value)}
                  placeholder="Напишіть ваш відгук..."
                  rows="3"
                  className="review-textarea"
                />

                <Button 
                  variant="primary"
                  onClick={handleReviewSubmit}
                >
                  Зберегти відгук
                </Button>
              </div>
            )}
          </div>

          {/* Бокова панель */}
          <aside className="sidebar">
            <div className="price-card">
              <h3>💰 Вартість</h3>
              <div className="price-row">
                <span>Базова ціна:</span>
                <span>{appointment.services?.[0]?.service?.basePrice} грн</span>
              </div>
              <div className="price-row final">
                <span>До сплати:</span>
                <span>{appointment.finalPrice || appointment.totalPrice} грн</span>
              </div>
            </div>

            <div className="actions-card">
              <h3>Дії</h3>
              
              {(appointment.status === 'pending' || appointment.status === 'confirmed') && (
                <Button 
                  variant="danger" 
                  fullWidth
                  onClick={handleCancel}
                >
                  Скасувати запис
                </Button>
              )}
              
              <Button 
                variant="outline" 
                fullWidth
                onClick={() => navigate('/booking')}
              >
                Новий запис
              </Button>

              <Button 
                variant="outline" 
                fullWidth
                onClick={() => navigate('/contacts')}
              >
                Зв'язатися з нами
              </Button>
            </div>

            <div className="help-card">
              <h4>Потрібна допомога?</h4>
              <p>Зателефонуйте нам:</p>
              <a href="tel:+380501234567" className="phone-link">
                +380 50 123 45 67
              </a>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default AppointmentDetailPage;
