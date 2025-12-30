import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { adminService } from '../../services';
import Button from '../../components/Button/Button';
import './AdminDashboard.css';

/**
 * Панель адміністратора
 */
const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('statistics');
  const [loading, setLoading] = useState(false);
  
  // Статистика
  const [statistics, setStatistics] = useState(null);
  
  // Користувачі
  const [users, setUsers] = useState([]);
  const [usersPagination, setUsersPagination] = useState(null);
  
  // Послуги
  const [services, setServices] = useState([]);
  
  // Записи
  const [appointments, setAppointments] = useState([]);
  const [appointmentsPagination, setAppointmentsPagination] = useState(null);
  
  // Модальні вікна
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  
  // Форма нової послуги
  const [newService, setNewService] = useState({
    name: '',
    description: '',
    category: 'diagnostics',
    basePrice: '',
    duration: '',
    priceUnit: 'fixed',
    isActive: true
  });

  // Перевірка ролі адміна
  useEffect(() => {
    if (user && user.role !== 'admin') {
      navigate('/');
    }
  }, [user, navigate]);

  // Завантаження даних при зміні вкладки
  useEffect(() => {
    loadTabData();
  }, [activeTab]);

  const loadTabData = async () => {
    setLoading(true);
    try {
      switch (activeTab) {
        case 'statistics':
          const statsRes = await adminService.getStatistics();
          setStatistics(statsRes.data);
          break;
        case 'users':
          const usersRes = await adminService.getAllUsers({ page: 1, limit: 20 });
          setUsers(usersRes.data.users);
          setUsersPagination(usersRes.data.pagination);
          break;
        case 'services':
          // Отримуємо послуги через адмінський API (включно з неактивними)
          const servicesRes = await adminService.getAllServices({ page: 1, limit: 200 });
          setServices(servicesRes.data.services);
          break;
        case 'appointments':
          const appointmentsRes = await adminService.getAllAppointments({ page: 1, limit: 20 });
          setAppointments(appointmentsRes.data.appointments);
          setAppointmentsPagination(appointmentsRes.data.pagination);
          break;
        default:
          break;
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Видалення користувача
  const handleDeleteUser = async (id) => {
    if (!window.confirm('Видалити користувача?')) return;
    
    try {
      await adminService.deleteUser(id);
      loadTabData();
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Помилка при видаленні користувача');
    }
  };

  // Створення послуги
  const handleCreateService = async (e) => {
    e.preventDefault();
    try {
      await adminService.createService({
        ...newService,
        basePrice: parseInt(newService.basePrice),
        duration: parseInt(newService.duration)
      });
      setNewService({
        name: '',
        description: '',
        category: 'diagnostics',
        basePrice: '',
        duration: '',
        priceUnit: 'fixed',
        isActive: true
      });
      setShowModal(false);
      loadTabData();
    } catch (error) {
      console.error('Error creating service:', error);
      alert('Помилка при створенні послуги');
    }
  };

  // Видалення послуги
  const handleDeleteService = async (id) => {
    if (!window.confirm('Видалити послугу?')) return;
    
    try {
      await adminService.deleteService(id);
      loadTabData();
    } catch (error) {
      console.error('Error deleting service:', error);
      alert(error.response?.data?.message || 'Помилка при видаленні послуги');
    }
  };

  // Перемикання статусу послуги
  const handleToggleService = async (id) => {
    try {
      await adminService.toggleService(id);
      loadTabData();
    } catch (error) {
      console.error('Error toggling service:', error);
      alert('Помилка при зміні статусу послуги');
    }
  };

  // Оновлення статусу запису
  const handleUpdateAppointmentStatus = async (id, status) => {
    try {
      await adminService.updateAppointmentStatus(id, status);
      loadTabData();
    } catch (error) {
      console.error('Error updating appointment:', error);
      alert('Помилка при оновленні статусу');
    }
  };

  // Видалення запису
  const handleDeleteAppointment = async (id) => {
    if (!window.confirm('Видалити запис?')) return;
    
    try {
      await adminService.deleteAppointment(id);
      loadTabData();
    } catch (error) {
      console.error('Error deleting appointment:', error);
      alert('Помилка при видаленні запису');
    }
  };

  // Рендер статистики
  const renderStatistics = () => {
    if (!statistics) return null;

    return (
      <div>
        <div className="stats-grid">
          <div className="stat-card">
            <h3>Користувачі</h3>
            <div className="value">{statistics.users.total}</div>
            <div className="label">
              Адмінів: {statistics.users.admins} | Клієнтів: {statistics.users.regular}
            </div>
          </div>
          
          <div className="stat-card">
            <h3>Послуги</h3>
            <div className="value">{statistics.services.total}</div>
            <div className="label">
              Активних: {statistics.services.active} | Неактивних: {statistics.services.inactive}
            </div>
          </div>
          
          <div className="stat-card">
            <h3>Записи</h3>
            <div className="value">{statistics.appointments.total}</div>
            <div className="label">
              Виконано: {statistics.appointments.completed}
            </div>
          </div>
          
          <div className="stat-card">
            <h3>Дохід</h3>
            <div className="value">{statistics.revenue.total} {statistics.revenue.currency}</div>
            <div className="label">Від завершених записів</div>
          </div>
        </div>

        {statistics.popularServices.length > 0 && (
          <div>
            <h3>Популярні послуги</h3>
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Послуга</th>
                    <th>Категорія</th>
                    <th>Кількість записів</th>
                  </tr>
                </thead>
                <tbody>
                  {statistics.popularServices.map((service) => (
                    <tr key={service._id}>
                      <td>{service.name}</td>
                      <td>{service.category}</td>
                      <td>{service.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Рендер користувачів
  const renderUsers = () => (
    <div>
      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Ім'я</th>
              <th>Email</th>
              <th>Телефон</th>
              <th>Роль</th>
              <th>Дії</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.phone}</td>
                <td>
                  <span className={`status-badge ${user.role}`}>
                    {user.role === 'admin' ? 'Адмін' : 'Клієнт'}
                  </span>
                </td>
                <td>
                  <div className="table-actions">
                    <button 
                      className="action-btn delete"
                      onClick={() => handleDeleteUser(user._id)}
                    >
                      Видалити
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  // Рендер послуг
  const renderServices = () => (
    <div>
      <div className="admin-actions">
        <Button 
          variant="primary" 
          onClick={() => {
            setModalType('createService');
            setShowModal(true);
          }}
        >
          + Додати послугу
        </Button>
      </div>
      
      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Назва</th>
              <th>Категорія</th>
              <th>Ціна</th>
              <th>Статус</th>
              <th>Дії</th>
            </tr>
          </thead>
          <tbody>
            {services.map((service) => (
              <tr key={service._id}>
                <td>{service.name}</td>
                <td>{service.category}</td>
                <td>{service.basePrice} грн</td>
                <td>
                  <span className={`status-badge ${service.isActive ? 'active' : 'inactive'}`}>
                    {service.isActive ? 'Активна' : 'Неактивна'}
                  </span>
                </td>
                <td>
                  <div className="table-actions">
                    <button 
                      className="action-btn toggle"
                      onClick={() => handleToggleService(service._id)}
                    >
                      {service.isActive ? 'Деактивувати' : 'Активувати'}
                    </button>
                    <button 
                      className="action-btn delete"
                      onClick={() => handleDeleteService(service._id)}
                    >
                      Видалити
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  // Рендер записів
  const renderAppointments = () => (
    <div>
      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Дата</th>
              <th>Клієнт</th>
              <th>Послуга</th>
              <th>Ціна</th>
              <th>Статус</th>
              <th>Дії</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map((appointment) => (
              <tr key={appointment._id}>
                <td>{new Date(appointment.appointmentDate).toLocaleDateString('uk-UA')}</td>
                <td>{appointment.user?.name}</td>
                <td>{appointment.services[0]?.service?.name}</td>
                <td>{appointment.finalPrice} грн</td>
                <td>
                  <select
                    className="form-select"
                    value={appointment.status}
                    onChange={(e) => handleUpdateAppointmentStatus(appointment._id, e.target.value)}
                  >
                    <option value="pending">Очікує</option>
                    <option value="confirmed">Підтверджено</option>
                    <option value="in-progress">В роботі</option>
                    <option value="completed">Виконано</option>
                    <option value="cancelled">Скасовано</option>
                  </select>
                </td>
                <td>
                  <div className="table-actions">
                    <button 
                      className="action-btn delete"
                      onClick={() => handleDeleteAppointment(appointment._id)}
                    >
                      Видалити
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="admin-dashboard">
      <div className="container">
        {/* Заголовок */}
        <div className="admin-header">
          <h1>🛠️ Панель адміністратора</h1>
          <p>Управління системою автосервісу</p>
        </div>

        {/* Вкладки */}
        <div className="admin-tabs">
          <button
            className={`admin-tab ${activeTab === 'statistics' ? 'active' : ''}`}
            onClick={() => setActiveTab('statistics')}
          >
            📊 Статистика
          </button>
          <button
            className={`admin-tab ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            👥 Користувачі
          </button>
          <button
            className={`admin-tab ${activeTab === 'services' ? 'active' : ''}`}
            onClick={() => setActiveTab('services')}
          >
            🔧 Послуги
          </button>
          <button
            className={`admin-tab ${activeTab === 'appointments' ? 'active' : ''}`}
            onClick={() => setActiveTab('appointments')}
          >
            📅 Записи
          </button>
        </div>

        {/* Контент */}
        <div className="admin-content">
          {loading ? (
            <div className="loading-container">
              <div className="loader"></div>
            </div>
          ) : (
            <>
              {activeTab === 'statistics' && renderStatistics()}
              {activeTab === 'users' && renderUsers()}
              {activeTab === 'services' && renderServices()}
              {activeTab === 'appointments' && renderAppointments()}
            </>
          )}
        </div>
      </div>

      {/* Модальне вікно */}
      {showModal && modalType === 'createService' && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Створити нову послугу</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            
            <form className="admin-form" onSubmit={handleCreateService}>
              <div className="form-group">
                <label>Назва послуги *</label>
                <input
                  type="text"
                  className="form-input"
                  value={newService.name}
                  onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Опис *</label>
                <textarea
                  className="form-textarea"
                  value={newService.description}
                  onChange={(e) => setNewService({ ...newService, description: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Категорія *</label>
                <select
                  className="form-select"
                  value={newService.category}
                  onChange={(e) => setNewService({ ...newService, category: e.target.value })}
                  required
                >
                  <option value="diagnostics">Діагностика</option>
                  <option value="engine">Двигун</option>
                  <option value="transmission">Трансмісія</option>
                  <option value="brakes">Гальма</option>
                  <option value="suspension">Підвіска</option>
                  <option value="electrical">Електрика</option>
                  <option value="bodywork">Кузовні роботи</option>
                  <option value="oil-change">Заміна масла</option>
                  <option value="tire-service">Шиномонтаж</option>
                  <option value="air-conditioning">Кондиціонер</option>
                  <option value="other">Інше</option>
                </select>
              </div>

              <div className="form-group">
                <label>Базова ціна (грн) *</label>
                <input
                  type="number"
                  className="form-input"
                  value={newService.basePrice}
                  onChange={(e) => setNewService({ ...newService, basePrice: e.target.value })}
                  required
                  min="0"
                />
              </div>

              <div className="form-group">
                <label>Тривалість (хв) *</label>
                <input
                  type="number"
                  className="form-input"
                  value={newService.duration}
                  onChange={(e) => setNewService({ ...newService, duration: e.target.value })}
                  required
                  min="1"
                />
              </div>

              <div className="form-group">
                <label>Тип ціни *</label>
                <select
                  className="form-select"
                  value={newService.priceUnit}
                  onChange={(e) => setNewService({ ...newService, priceUnit: e.target.value })}
                  required
                >
                  <option value="fixed">Фіксована</option>
                  <option value="per-item">За одиницю</option>
                  <option value="per-hour">За годину</option>
                </select>
              </div>

              <div className="modal-actions">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowModal(false)}
                >
                  Скасувати
                </Button>
                <Button type="submit" variant="primary">
                  Створити
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
