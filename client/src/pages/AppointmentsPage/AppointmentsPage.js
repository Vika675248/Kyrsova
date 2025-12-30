import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { appointmentService } from '../../services';
import Button from '../../components/Button/Button';
import './AppointmentsPage.css';

/**
 * Сторінка записів користувача
 */
const AppointmentsPage = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  // Завантаження записів
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const params = filter !== 'all' ? { status: filter } : {};
        const response = await appointmentService.getMyAppointments(params);
        setAppointments(response.data.appointments);
      } catch (error) {
        console.error('Error fetching appointments:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [filter]);

  // Статуси
  const statusLabels = {
    'pending': 'Очікує підтвердження',
    'confirmed': 'Підтверджено',
    'in-progress': 'В роботі',
    'completed': 'Завершено',
    'cancelled': 'Скасовано'
  };

  const statusColors = {
    'pending': 'warning',
    'confirmed': 'info',
    'in-progress': 'primary',
    'completed': 'success',
    'cancelled': 'danger'
  };

  // Скасувати запис
  const handleCancel = async (id) => {
    if (!window.confirm('Скасувати цей запис?')) return;
    
    try {
      await appointmentService.cancel(id);
      setAppointments(prev => 
        prev.map(a => a._id === id ? { ...a, status: 'cancelled' } : a)
      );
    } catch (error) {
      console.error('Error cancelling:', error);
    }
  };

  // Форматування дати
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('uk-UA', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="appointments-page">
        <div className="container">
          <div className="loading-container">
            <div className="loader"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="appointments-page">
      <div className="container">
        {/* Заголовок */}
        <div className="page-header">
          <div className="header-content">
            <h1>📋 Мої записи</h1>
            <p>Управління вашими записами на обслуговування</p>
          </div>
          <Button 
            variant="primary"
            onClick={() => navigate('/booking')}
          >
            + Новий запис
          </Button>
        </div>

        {/* Фільтри */}
        <div className="filter-tabs">
          <button
            className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            Всі
          </button>
          <button
            className={`filter-tab ${filter === 'pending' ? 'active' : ''}`}
            onClick={() => setFilter('pending')}
          >
            Очікують
          </button>
          <button
            className={`filter-tab ${filter === 'confirmed' ? 'active' : ''}`}
            onClick={() => setFilter('confirmed')}
          >
            Підтверджені
          </button>
          <button
            className={`filter-tab ${filter === 'in-progress' ? 'active' : ''}`}
            onClick={() => setFilter('in-progress')}
          >
            В роботі
          </button>
          <button
            className={`filter-tab ${filter === 'completed' ? 'active' : ''}`}
            onClick={() => setFilter('completed')}
          >
            Завершені
          </button>
        </div>

        {/* Список записів */}
        {appointments.length > 0 ? (
          <div className="appointments-list">
            {appointments.map(appointment => (
              <div 
                key={appointment._id} 
                className={`appointment-card status-${appointment.status}`}
              >
                <div className="appointment-header">
                  <span className={`status-badge ${statusColors[appointment.status]}`}>
                    {statusLabels[appointment.status]}
                  </span>
                  {appointment.isUrgent && (
                    <span className="urgent-badge">⚡ Терміново</span>
                  )}
                </div>

                <div className="appointment-body">
                  <div className="appointment-service">
                    <h3>{appointment.service?.name}</h3>
                    <p className="service-category">{appointment.service?.category}</p>
                  </div>

                  <div className="appointment-details">
                    <div className="detail-item">
                      <span className="detail-icon">📅</span>
                      <span>{formatDate(appointment.scheduledDate)}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-icon">🚗</span>
                      <span>{appointment.carBrand} {appointment.carModel}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-icon">🔢</span>
                      <span>{appointment.licensePlate}</span>
                    </div>
                    {appointment.estimatedCost && (
                      <div className="detail-item">
                        <span className="detail-icon">💰</span>
                        <span>{appointment.estimatedCost} грн</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="appointment-footer">
                  <Button 
                    variant="outline" 
                    size="small"
                    onClick={() => navigate(`/appointments/${appointment._id}`)}
                  >
                    Деталі
                  </Button>
                  
                  {(appointment.status === 'pending' || appointment.status === 'confirmed') && (
                    <Button 
                      variant="danger" 
                      size="small"
                      onClick={() => handleCancel(appointment._id)}
                    >
                      Скасувати
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <span className="empty-icon">📅</span>
            <h3>Записів не знайдено</h3>
            <p>
              {filter === 'all' 
                ? 'У вас ще немає записів на обслуговування' 
                : 'Немає записів з таким статусом'}
            </p>
            <Button 
              variant="primary"
              onClick={() => navigate('/booking')}
            >
              Записатися
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AppointmentsPage;
