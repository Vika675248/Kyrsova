import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Header.css';

/**
 * Компонент Header
 * Шапка сайту з навігацією та авторизацією
 */
const Header = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [userMenuOpen, setUserMenuOpen] = React.useState(false);

  // Перевірка активного посилання
  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  // Обробка виходу
  const handleLogout = () => {
    logout();
    navigate('/');
    setMenuOpen(false);
    setUserMenuOpen(false);
  };

  // Закриття мобільного меню і меню користувача
  const closeMenu = () => {
    setMenuOpen(false);
    setUserMenuOpen(false);
  };

  // Переключити меню користувача
  const toggleUserMenu = () => {
    setUserMenuOpen(prev => !prev);
  };

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          {/* Логотип */}
          <Link to="/" className="header-logo" onClick={closeMenu}>
            <span className="logo-icon">🚗</span>
            <span className="logo-text">АвтоСервіс</span>
          </Link>

          {/* Кнопка мобільного меню */}
          <button 
            className={`menu-toggle ${menuOpen ? 'open' : ''}`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Меню"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>

          {/* Навігація */}
          <nav className={`header-nav ${menuOpen ? 'open' : ''}`}>
            <ul className="nav-list">
              <li>
                <Link 
                  to="/" 
                  className={`nav-link ${isActive('/')}`}
                  onClick={closeMenu}
                >
                  Головна
                </Link>
              </li>
              <li>
                <Link 
                  to="/services" 
                  className={`nav-link ${isActive('/services')}`}
                  onClick={closeMenu}
                >
                  Послуги
                </Link>
              </li>
              <li>
                <Link 
                  to="/calculator" 
                  className={`nav-link ${isActive('/calculator')}`}
                  onClick={closeMenu}
                >
                  Калькулятор
                </Link>
              </li>
              <li>
                <Link 
                  to="/contacts" 
                  className={`nav-link ${isActive('/contacts')}`}
                  onClick={closeMenu}
                >
                  Контакти
                </Link>
              </li>
            </ul>

            {/* Авторизація */}
            <div className="header-auth">
              {isAuthenticated ? (
                <>
                  <div className={`user-menu ${userMenuOpen ? 'open' : ''}`}>
                    <button 
                      className="user-menu-toggle" 
                      onClick={toggleUserMenu}
                      aria-expanded={userMenuOpen}
                      aria-haspopup="menu"
                      title={user?.name}
                    >
                      <span className="user-avatar">
                        {user?.name?.charAt(0).toUpperCase()}
                      </span>
                      <span className="user-name">{user?.name}</span>
                      <span className="user-caret">▾</span>
                    </button>
                    <div className="user-dropdown" role="menu">
                      <Link 
                        to="/profile" 
                        className="dropdown-link"
                        onClick={closeMenu}
                      >
                        👤 Профіль
                      </Link>
                      <Link 
                        to="/appointments" 
                        className="dropdown-link"
                        onClick={closeMenu}
                      >
                        📋 Мої записи
                      </Link>
                      <Link 
                        to="/history" 
                        className="dropdown-link"
                        onClick={closeMenu}
                      >
                        📜 Історія ремонтів
                      </Link>
                      {user?.role === 'admin' && (
                        <>
                          <hr className="dropdown-divider" />
                          <Link 
                            to="/admin" 
                            className="dropdown-link"
                            onClick={closeMenu}
                          >
                            🛠️ Адмін-панель
                          </Link>
                        </>
                      )}
                      <hr className="dropdown-divider" />
                      <button 
                        className="dropdown-link logout"
                        onClick={handleLogout}
                      >
                        🚪 Вийти
                      </button>
                    </div>
                  </div>
                  <Link 
                    to="/booking" 
                    className="btn btn-accent"
                    onClick={closeMenu}
                  >
                    Записатися
                  </Link>
                </>
              ) : (
                <>
                  <Link 
                    to="/login" 
                    className="btn btn-outline"
                    onClick={closeMenu}
                  >
                    Увійти
                  </Link>
                  <Link 
                    to="/register" 
                    className="btn btn-primary"
                    onClick={closeMenu}
                  >
                    Реєстрація
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
