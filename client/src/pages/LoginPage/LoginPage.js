import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/Button/Button';
import './LoginPage.css';

/**
 * Сторінка входу
 */
const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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

  // Відправка форми
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      toast.error('Заповніть всі поля');
      return;
    }

    setLoading(true);
    try {
      const result = await login(formData.email, formData.password);
      
      if (result.success) {
        toast.success('Ви успішно увійшли!');
        const from = location.state?.from || '/';
        navigate(from);
      } else {
        toast.error(result.message || 'Помилка входу');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Сталася помилка при вході');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="container">
        <div className="auth-container">
          {/* Ліва частина - інформація */}
          <div className="auth-info">
            <div className="auth-info-content">
              <h2>🚗 АвтоСервіс</h2>
              <p>Увійдіть, щоб отримати доступ до:</p>
              <ul>
                <li>✓ Онлайн запису на ремонт</li>
                <li>✓ Історії обслуговування</li>
                <li>✓ Управління автомобілями</li>
                <li>✓ Персональних знижок</li>
              </ul>
            </div>
          </div>

          {/* Права частина - форма */}
          <div className="auth-form-container">
            <div className="auth-form-header">
              <h1>Вхід</h1>
              <p>Увійдіть у свій обліковий запис</p>
            </div>

            <form className="auth-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="email">Email</label>
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
                <label htmlFor="password">Пароль</label>
                <div className="input-with-icon">
                  <span className="input-icon">🔒</span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Введіть пароль"
                    className="form-input"
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              <div className="form-options">
                <label className="checkbox-label">
                  <input type="checkbox" />
                  Запам'ятати мене
                </label>
                <Link to="/forgot-password" className="forgot-link">
                  Забули пароль?
                </Link>
              </div>

              <Button 
                type="submit" 
                variant="primary" 
                size="large" 
                fullWidth
                disabled={loading}
              >
                {loading ? 'Вхід...' : 'Увійти'}
              </Button>
            </form>

            <div className="auth-footer">
              <p>
                Немає облікового запису?{' '}
                <Link to="/register">Зареєструватися</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
