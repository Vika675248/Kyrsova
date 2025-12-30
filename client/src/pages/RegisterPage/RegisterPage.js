import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/Button/Button';
import './RegisterPage.css';

/**
 * Сторінка реєстрації
 */
const RegisterPage = () => {
  const navigate = useNavigate();
  const { register, isAuthenticated } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  // Якщо вже авторизований
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/profile');
    }
  }, [isAuthenticated, navigate]);

  // Обробка форми
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Валідація
  const validateForm = () => {
    if (!formData.name || !formData.email || !formData.password) {
      toast.error('Заповніть всі обов\'язкові поля');
      return false;
    }

    if (formData.password.length < 6) {
      toast.error('Пароль повинен містити мінімум 6 символів');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Паролі не співпадають');
      return false;
    }

    if (!agreeTerms) {
      toast.error('Погодьтесь з умовами використання');
      return false;
    }

    return true;
  };

  // Відправка форми
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      await register({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password
      });
      toast.success('Реєстрація успішна!');
      navigate('/profile');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Помилка реєстрації');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="container">
        <div className="auth-container">
          {/* Ліва частина - форма */}
          <div className="auth-form-container">
            <div className="auth-form-header">
              <h1>Реєстрація</h1>
              <p>Створіть обліковий запис</p>
            </div>

            <form className="auth-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="name">Ім'я *</label>
                <div className="input-with-icon">
                  <span className="input-icon">👤</span>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Ваше ім'я"
                    className="form-input"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="email">Email *</label>
                <div className="input-with-icon">
                  <span className="input-icon">📧</span>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="your@email.com"
                    className="form-input"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="phone">Телефон</label>
                <div className="input-with-icon">
                  <span className="input-icon">📱</span>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+380 XX XXX XX XX"
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="password">Пароль *</label>
                  <div className="input-with-icon">
                    <span className="input-icon">🔒</span>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Мінімум 6 символів"
                      className="form-input"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="confirmPassword">Підтвердіть пароль *</label>
                  <div className="input-with-icon">
                    <span className="input-icon">🔒</span>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Повторіть пароль"
                      className="form-input"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="form-options">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={showPassword}
                    onChange={() => setShowPassword(!showPassword)}
                  />
                  Показати пароль
                </label>
              </div>

              <div className="terms-checkbox">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={() => setAgreeTerms(!agreeTerms)}
                  />
                  Я погоджуюсь з <Link to="/terms">умовами використання</Link> та{' '}
                  <Link to="/privacy">політикою конфіденційності</Link>
                </label>
              </div>

              <Button 
                type="submit" 
                variant="primary" 
                size="large" 
                fullWidth
                disabled={loading}
              >
                {loading ? 'Реєстрація...' : 'Зареєструватися'}
              </Button>
            </form>

            <div className="auth-footer">
              <p>
                Вже маєте обліковий запис?{' '}
                <Link to="/login">Увійти</Link>
              </p>
            </div>
          </div>

          {/* Права частина - інформація */}
          <div className="auth-info">
            <div className="auth-info-content">
              <h2>🚗 Приєднуйтесь до АвтоСервіс</h2>
              <p>Реєстрація дозволяє вам:</p>
              <ul>
                <li>✓ Записуватись на ремонт онлайн</li>
                <li>✓ Відстежувати статус замовлень</li>
                <li>✓ Зберігати історію обслуговування</li>
                <li>✓ Отримувати персональні пропозиції</li>
                <li>✓ Накопичувати бонуси</li>
              </ul>
              <div className="trust-badges">
                <div className="badge-item">
                  <span>🔒</span>
                  <span>Безпечно</span>
                </div>
                <div className="badge-item">
                  <span>⚡</span>
                  <span>Швидко</span>
                </div>
                <div className="badge-item">
                  <span>🆓</span>
                  <span>Безкоштовно</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
