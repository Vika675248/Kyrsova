import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

/**
 * Компонент Footer
 * Підвал сайту з контактами та посиланнями
 */
const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          {/* Про нас */}
          <div className="footer-section">
            <h3 className="footer-title">
              <span className="logo-icon">🚗</span> АвтоСервіс
            </h3>
            <p className="footer-description">
              Професійний ремонт та обслуговування автомобілів. 
              Працюємо з 2010 року. Гарантія якості на всі види робіт.
            </p>
            <div className="footer-social">
              <a href="#" className="social-link" aria-label="Facebook">📘</a>
              <a href="#" className="social-link" aria-label="Instagram">📸</a>
              <a href="#" className="social-link" aria-label="Telegram">✈️</a>
              <a href="#" className="social-link" aria-label="Viber">📱</a>
            </div>
          </div>

          {/* Послуги */}
          <div className="footer-section">
            <h4 className="footer-subtitle">Послуги</h4>
            <ul className="footer-links">
              <li><Link to="/services?category=diagnostics">Діагностика</Link></li>
              <li><Link to="/services?category=engine">Ремонт двигуна</Link></li>
              <li><Link to="/services?category=brakes">Гальмівна система</Link></li>
              <li><Link to="/services?category=suspension">Ходова частина</Link></li>
              <li><Link to="/services?category=oil-change">Заміна масла</Link></li>
              <li><Link to="/services?category=tire-service">Шиномонтаж</Link></li>
            </ul>
          </div>

          {/* Клієнтам */}
          <div className="footer-section">
            <h4 className="footer-subtitle">Клієнтам</h4>
            <ul className="footer-links">
              <li><Link to="/calculator">Калькулятор вартості</Link></li>
              <li><Link to="/booking">Онлайн-запис</Link></li>
              <li><Link to="/services">Прайс-лист</Link></li>
              <li><Link to="/contacts">Контакти</Link></li>
              <li><Link to="/login">Особистий кабінет</Link></li>
            </ul>
          </div>

          {/* Контакти */}
          <div className="footer-section">
            <h4 className="footer-subtitle">Контакти</h4>
            <ul className="footer-contacts">
              <li>
                <span className="contact-icon">📍</span>
                <span>м. Львів, вул. Автомобільна, 123</span>
              </li>
              <li>
                <span className="contact-icon">📞</span>
                <a href="tel:+380501234567">+38 (050) 123-45-67</a>
              </li>
              <li>
                <span className="contact-icon">✉️</span>
                <a href="mailto:info@autoservice.ua">info@autoservice.ua</a>
              </li>
              <li>
                <span className="contact-icon">🕐</span>
                <span>Пн-Сб: 08:00 - 20:00</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Нижня частина */}
        <div className="footer-bottom">
          <p className="copyright">
            © {currentYear} АвтоСервіс. Всі права захищено.
          </p>
          <p className="footer-note">
            Курсова робота з дисципліни "Веб-технології та веб-дизайн"
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
