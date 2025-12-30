import React from 'react';
import { Link } from 'react-router-dom';
import './Button.css';

/**
 * Компонент Button
 * Універсальна кнопка з різними варіантами стилів
 * Перевикористовується: скрізь по додатку
 */
const Button = ({
  children,
  variant = 'primary',
  size = 'medium',
  type = 'button',
  to,
  href,
  onClick,
  disabled = false,
  loading = false,
  fullWidth = false,
  icon,
  className = '',
  ...props
}) => {
  // Формуємо класи
  const classes = [
    'button',
    `button-${variant}`,
    `button-${size}`,
    fullWidth ? 'button-full' : '',
    loading ? 'button-loading' : '',
    disabled ? 'button-disabled' : '',
    className
  ].filter(Boolean).join(' ');

  // Контент кнопки
  const content = (
    <>
      {loading && <span className="button-spinner"></span>}
      {icon && !loading && <span className="button-icon">{icon}</span>}
      <span className="button-text">{children}</span>
    </>
  );

  // Якщо це посилання React Router
  if (to) {
    return (
      <Link to={to} className={classes} {...props}>
        {content}
      </Link>
    );
  }

  // Якщо це зовнішнє посилання
  if (href) {
    return (
      <a 
        href={href} 
        className={classes} 
        target="_blank" 
        rel="noopener noreferrer"
        {...props}
      >
        {content}
      </a>
    );
  }

  // Звичайна кнопка
  return (
    <button
      type={type}
      className={classes}
      onClick={onClick}
      disabled={disabled || loading}
      {...props}
    >
      {content}
    </button>
  );
};

export default Button;
