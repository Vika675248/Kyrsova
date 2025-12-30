import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { serviceService } from '../../services';
import ServiceCard from '../../components/ServiceCard/ServiceCard';
import Button from '../../components/Button/Button';
import './HomePage.css';

/**
 * Головна сторінка
 */
const HomePage = () => {
  const [popularServices, setPopularServices] = useState([]);
  const [loading, setLoading] = useState(true);

  // Завантаження популярних послуг
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await serviceService.getAll({ 
          sort: 'popular', 
          limit: 6 
        });
        setPopularServices(response.data.services);
      } catch (error) {
        console.error('Error fetching services:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  // Переваги сервісу
  const advantages = [
    {
      icon: '🔧',
      title: 'Професійні майстри',
      description: 'Досвідчені спеціалісти з сертифікатами та багаторічним досвідом роботи'
    },
    {
      icon: '⚡',
      title: 'Швидкий сервіс',
      description: 'Оперативне виконання робіт без втрати якості'
    },
    {
      icon: '💰',
      title: 'Чесні ціни',
      description: 'Прозоре ціноутворення без прихованих платежів'
    },
    {
      icon: '🛡️',
      title: 'Гарантія якості',
      description: 'Надаємо гарантію на всі види виконаних робіт'
    },
    {
      icon: '📱',
      title: 'Онлайн-запис',
      description: 'Зручне бронювання часу через особистий кабінет'
    },
    {
      icon: '📊',
      title: 'Історія обслуговування',
      description: 'Повний облік всіх ремонтів вашого авто'
    }
  ];

  // Статистика
  const stats = [
    { value: '10+', label: 'Років досвіду' },
    { value: '15000+', label: 'Задоволених клієнтів' },
    { value: '50+', label: 'Видів послуг' },
    { value: '98%', label: 'Позитивних відгуків' }
  ];

  return (
    <div className="home-page">
      {/* Hero секція */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <h1 className="hero-title">
              Професійний ремонт та обслуговування <span>вашого автомобіля</span>
            </h1>
            <p className="hero-subtitle">
              Якісний сервіс, досвідчені майстри, гарантія на всі види робіт. 
              Записуйтесь онлайн та економте свій час!
            </p>
            <div className="hero-actions">
              <Button to="/booking" variant="accent" size="large">
                Записатися на ремонт
              </Button>
              <Button to="/calculator" variant="outline" size="large">
                Розрахувати вартість
              </Button>
            </div>
          </div>
          <div className="hero-image">
            <div className="hero-image-placeholder">
              🚗
            </div>
          </div>
        </div>
      </section>

      {/* Статистика */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            {stats.map((stat, index) => (
              <div key={index} className="stat-item">
                <span className="stat-value">{stat.value}</span>
                <span className="stat-label">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Популярні послуги */}
      <section className="section services-section">
        <div className="container">
          <h2 className="section-title">Популярні послуги</h2>
          <p className="section-subtitle">
            Найбільш затребувані послуги нашого автосервісу
          </p>

          {loading ? (
            <div className="loading-container">
              <div className="loader"></div>
            </div>
          ) : (
            <div className="services-grid">
              {popularServices.map(service => (
                <ServiceCard key={service._id} service={service} />
              ))}
            </div>
          )}

          <div className="section-action">
            <Button to="/services" variant="primary" size="large">
              Всі послуги
            </Button>
          </div>
        </div>
      </section>

      {/* Переваги */}
      <section className="section advantages-section">
        <div className="container">
          <h2 className="section-title">Чому обирають нас?</h2>
          <p className="section-subtitle">
            Ми пропонуємо найкращий сервіс для вашого автомобіля
          </p>

          <div className="advantages-grid">
            {advantages.map((item, index) => (
              <div key={index} className="advantage-card">
                <div className="advantage-icon">{item.icon}</div>
                <h3 className="advantage-title">{item.title}</h3>
                <p className="advantage-description">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Калькулятор */}
      <section className="section calculator-section">
        <div className="container">
          <div className="calculator-promo">
            <div className="calculator-promo-content">
              <h2>Розрахуйте вартість ремонту</h2>
              <p>
                Скористайтеся нашим онлайн-калькулятором, щоб дізнатися 
                орієнтовну вартість ремонту вашого автомобіля
              </p>
              <Button to="/calculator" variant="accent" size="large">
                Відкрити калькулятор
              </Button>
            </div>
            <div className="calculator-promo-icon">
              🧮
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Готові записатися?</h2>
            <p>
              Оберіть зручний час та запишіться на обслуговування прямо зараз
            </p>
            <div className="cta-actions">
              <Button to="/booking" variant="accent" size="large">
                Записатися онлайн
              </Button>
              <Button href="tel:+380501234567" variant="outline" size="large">
                📞 +38 (050) 123-45-67
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
