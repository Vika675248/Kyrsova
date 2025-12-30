import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../../components/Button/Button';
import './ContactsPage.css';

/**
 * Сторінка контактів
 */
const ContactsPage = () => {
  // Робочі години
  const workingHours = [
    { day: 'Понеділок', hours: '08:00 - 20:00' },
    { day: 'Вівторок', hours: '08:00 - 20:00' },
    { day: 'Середа', hours: '08:00 - 20:00' },
    { day: 'Четвер', hours: '08:00 - 20:00' },
    { day: "П'ятниця", hours: '08:00 - 20:00' },
    { day: 'Субота', hours: '09:00 - 18:00' },
    { day: 'Неділя', hours: '10:00 - 16:00' }
  ];

  // Поточний день
  const today = new Date().getDay();
  const dayIndex = today === 0 ? 6 : today - 1;

  return (
    <div className="contacts-page">
      <div className="container">
        {/* Заголовок */}
        <div className="page-header">
          <h1>📞 Контакти</h1>
          <p>Ми завжди раді вам допомогти</p>
        </div>

        <div className="contacts-content">
          {/* Контактна інформація */}
          <div className="contact-cards">
            <div className="contact-card">
              <span className="contact-icon">📍</span>
              <h3>Адреса</h3>
              <p>м. Київ, вул. Автомобільна, 123</p>
              <a 
                href="https://maps.google.com/?q=Київ,+вул.+Автомобільна,+123" 
                target="_blank" 
                rel="noopener noreferrer"
                className="contact-link"
              >
                Відкрити на карті →
              </a>
            </div>

            <div className="contact-card">
              <span className="contact-icon">📱</span>
              <h3>Телефони</h3>
              <p>
                <a href="tel:+380501234567">+380 50 123 45 67</a>
                <br />
                <a href="tel:+380671234567">+380 67 123 45 67</a>
              </p>
              <span className="contact-note">Дзвоніть у робочий час</span>
            </div>

            <div className="contact-card">
              <span className="contact-icon">📧</span>
              <h3>Email</h3>
              <p>
                <a href="mailto:info@autoservice.ua">info@autoservice.ua</a>
              </p>
              <span className="contact-note">Відповідаємо протягом 24 годин</span>
            </div>

            <div className="contact-card">
              <span className="contact-icon">💬</span>
              <h3>Месенджери</h3>
              <div className="messengers">
                <a href="https://t.me/autoservice" className="messenger-link telegram">
                  Telegram
                </a>
                <a href="viber://chat?number=+380501234567" className="messenger-link viber">
                  Viber
                </a>
              </div>
            </div>
          </div>

          {/* Графік роботи та карта */}
          <div className="contacts-grid">
            {/* Графік роботи */}
            <div className="schedule-card">
              <h3>🕐 Графік роботи</h3>
              <ul className="schedule-list">
                {workingHours.map((item, index) => (
                  <li key={item.day} className={index === dayIndex ? 'today' : ''}>
                    <span className="day">{item.day}</span>
                    <span className="hours">{item.hours}</span>
                    {index === dayIndex && <span className="today-badge">Сьогодні</span>}
                  </li>
                ))}
              </ul>
            </div>

            {/* Карта */}
            <div className="map-card">
              <h3>🗺️ Як нас знайти</h3>
              <div className="map-container">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2540.4!2d30.5234!3d50.4501!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNTDCsDI3JzAwLjQiTiAzMMKwMzEnMjQuMiJF!5e0!3m2!1suk!2sua!4v1234567890"
                  width="100%"
                  height="300"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Карта"
                ></iframe>
              </div>
              <div className="directions">
                <p><strong>Орієнтири:</strong></p>
                <ul>
                  <li>🚇 Метро "Автозаводська" - 5 хв пішки</li>
                  <li>🚌 Автобуси 35, 67, 89 - зупинка "АвтоСервіс"</li>
                  <li>🅿️ Безкоштовна парковка для клієнтів</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Швидкі дії */}
          <div className="quick-actions">
            <h3>Швидкий запис</h3>
            <p>Оберіть зручний для вас спосіб запису на обслуговування</p>
            
            <div className="actions-grid">
              <Link to="/booking" className="action-card">
                <span className="action-icon">📅</span>
                <h4>Онлайн-запис</h4>
                <p>Оберіть зручний час</p>
              </Link>
              
              <a href="tel:+380501234567" className="action-card">
                <span className="action-icon">📞</span>
                <h4>Зателефонувати</h4>
                <p>Отримайте консультацію</p>
              </a>
              
              <Link to="/calculator" className="action-card">
                <span className="action-icon">🧮</span>
                <h4>Калькулятор</h4>
                <p>Розрахуйте вартість</p>
              </Link>
            </div>
          </div>

          {/* FAQ */}
          <div className="faq-section">
            <h3>❓ Часті питання</h3>
            
            <div className="faq-list">
              <details className="faq-item">
                <summary>Чи потрібно записуватися заздалегідь?</summary>
                <p>Рекомендуємо записуватись за 1-2 дні до візиту. Для термінових випадків телефонуйте - ми постараємося знайти час.</p>
              </details>
              
              <details className="faq-item">
                <summary>Скільки часу займає діагностика?</summary>
                <p>Комп'ютерна діагностика займає 30-60 хвилин залежно від марки авто та типу діагностики.</p>
              </details>
              
              <details className="faq-item">
                <summary>Чи даєте ви гарантію на роботи?</summary>
                <p>Так, ми надаємо гарантію від 3 до 12 місяців залежно від типу робіт та встановлених запчастин.</p>
              </details>
              
              <details className="faq-item">
                <summary>Чи можна привезти свої запчастини?</summary>
                <p>Так, але в такому випадку гарантія надається тільки на роботу. Рекомендуємо використовувати наші перевірені запчастини.</p>
              </details>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactsPage;
