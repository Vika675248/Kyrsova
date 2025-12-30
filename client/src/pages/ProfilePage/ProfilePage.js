import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/Button/Button';
import Modal from '../../components/Modal/Modal';
import './ProfilePage.css';

/**
 * Сторінка профілю
 */
const ProfilePage = () => {
  const { user, updateProfile, addCar, removeCar, logout } = useAuth();
  
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [showCarModal, setShowCarModal] = useState(false);
  
  // Форма профілю
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || ''
  });

  // Форма авто
  const [carData, setCarData] = useState({
    brand: '',
    model: '',
    year: new Date().getFullYear(),
    licensePlate: '',
    vin: ''
  });

  // Обробка профілю
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateProfile(profileData);
      toast.success('Профіль оновлено!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Помилка оновлення');
    } finally {
      setLoading(false);
    }
  };

  // Обробка авто
  const handleCarChange = (e) => {
    const { name, value } = e.target;
    setCarData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddCar = async (e) => {
    e.preventDefault();
    
    if (!carData.brand || !carData.model || !carData.licensePlate) {
      toast.error('Заповніть обов\'язкові поля');
      return;
    }

    setLoading(true);
    try {
      await addCar(carData);
      toast.success('Автомобіль додано!');
      setShowCarModal(false);
      setCarData({
        brand: '',
        model: '',
        year: new Date().getFullYear(),
        licensePlate: '',
        vin: ''
      });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Помилка додавання');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveCar = async (carId) => {
    if (!window.confirm('Видалити цей автомобіль?')) return;
    
    try {
      await removeCar(carId);
      toast.success('Автомобіль видалено');
    } catch (error) {
      toast.error('Помилка видалення');
    }
  };

  // Популярні марки
  const carBrands = [
    'Toyota', 'Honda', 'Volkswagen', 'Ford', 'BMW', 'Mercedes-Benz',
    'Audi', 'Hyundai', 'Kia', 'Mazda', 'Nissan', 'Chevrolet',
    'Skoda', 'Renault', 'Peugeot', 'Opel', 'Mitsubishi', 'Subaru'
  ];

  return (
    <div className="profile-page">
      <div className="container">
        <div className="profile-layout">
          {/* Бокова панель */}
          <aside className="profile-sidebar">
            <div className="user-card">
              <div className="user-avatar">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <h3>{user?.name}</h3>
              <p>{user?.email}</p>
            </div>

            <nav className="profile-nav">
              <button
                className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`}
                onClick={() => setActiveTab('profile')}
              >
                <span className="nav-icon">👤</span>
                Особисті дані
              </button>
              <button
                className={`nav-item ${activeTab === 'cars' ? 'active' : ''}`}
                onClick={() => setActiveTab('cars')}
              >
                <span className="nav-icon">🚗</span>
                Мої автомобілі
              </button>
              <button
                className={`nav-item ${activeTab === 'security' ? 'active' : ''}`}
                onClick={() => setActiveTab('security')}
              >
                <span className="nav-icon">🔒</span>
                Безпека
              </button>
            </nav>

            <button className="logout-btn" onClick={logout}>
              <span>🚪</span>
              Вийти
            </button>
          </aside>

          {/* Основний контент */}
          <main className="profile-content">
            {/* Особисті дані */}
            {activeTab === 'profile' && (
              <div className="content-section">
                <h2>Особисті дані</h2>
                <form className="profile-form" onSubmit={handleProfileSubmit}>
                  <div className="form-group">
                    <label htmlFor="name">Ім'я</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={profileData.name}
                      onChange={handleProfileChange}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={profileData.email}
                      onChange={handleProfileChange}
                      className="form-input"
                      disabled
                    />
                    <span className="form-hint">Email не можна змінити</span>
                  </div>

                  <div className="form-group">
                    <label htmlFor="phone">Телефон</label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={profileData.phone}
                      onChange={handleProfileChange}
                      placeholder="+380 XX XXX XX XX"
                      className="form-input"
                    />
                  </div>

                  <Button 
                    type="submit" 
                    variant="primary"
                    disabled={loading}
                  >
                    {loading ? 'Збереження...' : 'Зберегти зміни'}
                  </Button>
                </form>
              </div>
            )}

            {/* Автомобілі */}
            {activeTab === 'cars' && (
              <div className="content-section">
                <div className="section-header">
                  <h2>Мої автомобілі</h2>
                  <Button 
                    variant="primary" 
                    onClick={() => setShowCarModal(true)}
                  >
                    + Додати авто
                  </Button>
                </div>

                {user?.cars && user.cars.length > 0 ? (
                  <div className="cars-grid">
                    {user.cars.map(car => (
                      <div key={car._id} className="car-card">
                        <div className="car-card-header">
                          <span className="car-icon">🚗</span>
                          <button 
                            className="remove-btn"
                            onClick={() => handleRemoveCar(car._id)}
                            title="Видалити"
                          >
                            ✕
                          </button>
                        </div>
                        <h4>{car.brand} {car.model}</h4>
                        <div className="car-details">
                          <p><strong>Рік:</strong> {car.year}</p>
                          <p><strong>Номер:</strong> {car.licensePlate}</p>
                          {car.vin && <p><strong>VIN:</strong> {car.vin}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-state">
                    <span className="empty-icon">🚙</span>
                    <h3>Немає збережених автомобілів</h3>
                    <p>Додайте ваші авто для швидшого запису на обслуговування</p>
                    <Button 
                      variant="primary" 
                      onClick={() => setShowCarModal(true)}
                    >
                      Додати автомобіль
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Безпека */}
            {activeTab === 'security' && (
              <div className="content-section">
                <h2>Безпека</h2>
                <div className="security-section">
                  <div className="security-item">
                    <div className="security-info">
                      <h4>Зміна пароля</h4>
                      <p>Рекомендуємо змінювати пароль кожні 3 місяці</p>
                    </div>
                    <Button variant="outline">Змінити пароль</Button>
                  </div>
                  
                  <div className="security-item">
                    <div className="security-info">
                      <h4>Двофакторна автентифікація</h4>
                      <p>Додатковий захист для вашого акаунту</p>
                    </div>
                    <Button variant="outline">Налаштувати</Button>
                  </div>

                  <div className="security-item danger">
                    <div className="security-info">
                      <h4>Видалення акаунту</h4>
                      <p>Ця дія незворотна. Всі ваші дані будуть видалені.</p>
                    </div>
                    <Button variant="danger">Видалити акаунт</Button>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Модальне вікно додавання авто */}
      <Modal
        isOpen={showCarModal}
        onClose={() => setShowCarModal(false)}
        title="Додати автомобіль"
      >
        <form className="car-form" onSubmit={handleAddCar}>
          <div className="form-group">
            <label htmlFor="brand">Марка *</label>
            <select
              id="brand"
              name="brand"
              value={carData.brand}
              onChange={handleCarChange}
              className="form-select"
              required
            >
              <option value="">Оберіть марку</option>
              {carBrands.map(brand => (
                <option key={brand} value={brand}>{brand}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="model">Модель *</label>
            <input
              type="text"
              id="model"
              name="model"
              value={carData.model}
              onChange={handleCarChange}
              placeholder="Наприклад: Camry"
              className="form-input"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="year">Рік випуску</label>
              <input
                type="number"
                id="year"
                name="year"
                value={carData.year}
                onChange={handleCarChange}
                min="1990"
                max={new Date().getFullYear() + 1}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="licensePlate">Держ. номер *</label>
              <input
                type="text"
                id="licensePlate"
                name="licensePlate"
                value={carData.licensePlate}
                onChange={handleCarChange}
                placeholder="AA1234BB"
                className="form-input"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="vin">VIN-код (необов'язково)</label>
            <input
              type="text"
              id="vin"
              name="vin"
              value={carData.vin}
              onChange={handleCarChange}
              placeholder="17 символів"
              className="form-input"
              maxLength="17"
            />
          </div>

          <div className="modal-actions">
            <Button 
              type="button" 
              variant="outline"
              onClick={() => setShowCarModal(false)}
            >
              Скасувати
            </Button>
            <Button 
              type="submit" 
              variant="primary"
              disabled={loading}
            >
              {loading ? 'Збереження...' : 'Додати'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ProfilePage;
