import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../../components/Button/Button';
import './NotFoundPage.css';

/**
 * Сторінка 404
 */
const NotFoundPage = () => {
  return (
    <div className="not-found-page">
      <div className="container">
        <div className="not-found-content">
          <div className="error-illustration">
            <span className="error-code">404</span>
            <span className="error-icon">🚗💨</span>
          </div>
          
          <h1>Сторінку не знайдено</h1>
          <p>
            На жаль, сторінка, яку ви шукаєте, не існує або була переміщена.
            Можливо, ви перейшли за застарілим посиланням.
          </p>

          <div className="action-buttons">
            <Link to="/">
              <Button variant="primary" size="large">
                🏠 На головну
              </Button>
            </Link>
            <Link to="/services">
              <Button variant="outline" size="large">
                🔧 До послуг
              </Button>
            </Link>
          </div>

          <div className="helpful-links">
            <h3>Можливо, ви шукали:</h3>
            <ul>
              <li><Link to="/services">Наші послуги</Link></li>
              <li><Link to="/calculator">Калькулятор вартості</Link></li>
              <li><Link to="/booking">Онлайн-запис</Link></li>
              <li><Link to="/contacts">Контакти</Link></li>
              <li><Link to="/history">Історія ремонтів</Link></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
