import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { serviceService } from '../../services';
import ServiceCard from '../../components/ServiceCard/ServiceCard';
import './ServicesPage.css';

/**
 * Сторінка послуг
 */
const ServicesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Поточна категорія з URL
  const currentCategory = searchParams.get('category') || '';

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

  // Завантаження послуг
  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true);
      try {
        const params = {
          category: currentCategory || undefined,
          search: searchTerm || undefined
        };
        const response = await serviceService.getAll(params);
        setServices(response.data.services);
        setCategories(response.data.categories);
      } catch (error) {
        console.error('Error fetching services:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, [currentCategory, searchTerm]);

  // Зміна категорії
  const handleCategoryChange = (category) => {
    if (category) {
      setSearchParams({ category });
    } else {
      setSearchParams({});
    }
  };

  // Пошук
  const handleSearch = (e) => {
    e.preventDefault();
    // Пошук вже працює через useEffect
  };

  return (
    <div className="services-page">
      <div className="container">
        {/* Заголовок */}
        <div className="page-header">
          <h1>Наші послуги</h1>
          <p>Повний спектр послуг з ремонту та обслуговування автомобілів</p>
        </div>

        {/* Фільтри */}
        <div className="services-filters">
          {/* Пошук */}
          <form className="search-form" onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="Пошук послуг..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input"
            />
            <button type="submit" className="btn btn-primary">
              🔍
            </button>
          </form>

          {/* Категорії */}
          <div className="category-tabs">
            <button
              className={`category-tab ${!currentCategory ? 'active' : ''}`}
              onClick={() => handleCategoryChange('')}
            >
              Всі
            </button>
            {categories.map(cat => (
              <button
                key={cat}
                className={`category-tab ${currentCategory === cat ? 'active' : ''}`}
                onClick={() => handleCategoryChange(cat)}
              >
                {categoryNames[cat] || cat}
              </button>
            ))}
          </div>
        </div>

        {/* Список послуг */}
        {loading ? (
          <div className="loading-container">
            <div className="loader"></div>
          </div>
        ) : services.length > 0 ? (
          <div className="services-grid">
            {services.map(service => (
              <ServiceCard key={service._id} service={service} />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <span className="empty-icon">🔍</span>
            <h3>Послуг не знайдено</h3>
            <p>Спробуйте змінити параметри пошуку</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ServicesPage;
