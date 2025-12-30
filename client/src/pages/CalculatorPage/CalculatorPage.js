import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { calculatorService, serviceService } from '../../services';
import Button from '../../components/Button/Button';
import './CalculatorPage.css';

/**
 * Сторінка калькулятора вартості
 */
const CalculatorPage = () => {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [coefficients, setCoefficients] = useState(null);
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);
  const [result, setResult] = useState(null);

  // Форма
  const [formData, setFormData] = useState({
    serviceId: '',
    carBrand: '',
    carYear: new Date().getFullYear(),
    isUrgent: false,
    description: ''
  });

  // Завантаження даних
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [servicesRes, coefficientsRes] = await Promise.all([
          serviceService.getAll({ limit: 100 }),
          calculatorService.getCoefficients()
        ]);
        setServices(servicesRes.data.services);
        setCoefficients(coefficientsRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Обробка форми
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    setResult(null);
  };

  // Розрахунок
  const handleCalculate = async (e) => {
    e.preventDefault();
    
    if (!formData.serviceId || !formData.carBrand) {
      return;
    }

    setCalculating(true);
    try {
      const response = await calculatorService.calculate({
        services: [{ serviceId: formData.serviceId }],
        carBrand: formData.carBrand,
        carYear: parseInt(formData.carYear),
        urgency: formData.isUrgent ? 'urgent' : 'normal'
      });
      setResult(response.data);
    } catch (error) {
      console.error('Error calculating:', error);
    } finally {
      setCalculating(false);
    }
  };

  // Записатися
  const handleBooking = () => {
    navigate(`/booking?service=${formData.serviceId}`);
  };

  // Групування послуг по категоріях
  const groupedServices = services.reduce((acc, service) => {
    if (!acc[service.category]) {
      acc[service.category] = [];
    }
    acc[service.category].push(service);
    return acc;
  }, {});

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

  if (loading) {
    return (
      <div className="calculator-page">
        <div className="container">
          <div className="loading-container">
            <div className="loader"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="calculator-page">
      <div className="container">
        {/* Заголовок */}
        <div className="page-header">
          <h1>🧮 Калькулятор вартості</h1>
          <p>Розрахуйте орієнтовну вартість ремонту вашого автомобіля</p>
        </div>

        <div className="calculator-content">
          {/* Форма */}
          <div className="calculator-form-container">
            <form className="calculator-form" onSubmit={handleCalculate}>
              {/* Вибір послуги */}
              <div className="form-group">
                <label htmlFor="serviceId">Послуга *</label>
                <select
                  id="serviceId"
                  name="serviceId"
                  value={formData.serviceId}
                  onChange={handleChange}
                  required
                  className="form-select"
                >
                  <option value="">Оберіть послугу</option>
                  {Object.entries(groupedServices).map(([category, categoryServices]) => (
                    <optgroup key={category} label={categoryNames[category] || category}>
                      {categoryServices.map(service => (
                        <option key={service._id} value={service._id}>
                          {service.name} - від {service.basePrice} грн
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>

              {/* Марка авто */}
              <div className="form-group">
                <label htmlFor="carBrand">Марка автомобіля *</label>
                <select
                  id="carBrand"
                  name="carBrand"
                  value={formData.carBrand}
                  onChange={handleChange}
                  required
                  className="form-select"
                >
                  <option value="">Оберіть марку</option>
                  {coefficients?.carBrands && Object.entries(coefficients.carBrands).map(([brand, coef]) => (
                    <option key={brand} value={brand}>
                      {brand} {coef > 1 && `(+${Math.round((coef - 1) * 100)}%)`}
                    </option>
                  ))}
                </select>
              </div>

              {/* Рік випуску */}
              <div className="form-group">
                <label htmlFor="carYear">Рік випуску</label>
                <input
                  type="number"
                  id="carYear"
                  name="carYear"
                  value={formData.carYear}
                  onChange={handleChange}
                  min="1990"
                  max={new Date().getFullYear() + 1}
                  className="form-input"
                />
                {coefficients?.carAge && (
                  <span className="form-hint">
                    Вік авто впливає на вартість (+{coefficients.carAge.perYear * 100}% за кожен рік)
                  </span>
                )}
              </div>

              {/* Терміновість */}
              <div className="form-group checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="isUrgent"
                    checked={formData.isUrgent}
                    onChange={handleChange}
                  />
                  <span className="checkbox-custom"></span>
                  Терміновий ремонт
                  {coefficients?.urgency && (
                    <span className="badge badge-warning">
                      +{Math.round((coefficients.urgency.coefficient - 1) * 100)}%
                    </span>
                  )}
                </label>
              </div>

              {/* Опис проблеми */}
              <div className="form-group">
                <label htmlFor="description">Опис проблеми (необов'язково)</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Опишіть симптоми несправності..."
                  className="form-textarea"
                />
              </div>

              <Button 
                type="submit" 
                variant="primary" 
                size="large" 
                fullWidth
                disabled={calculating || !formData.serviceId || !formData.carBrand}
              >
                {calculating ? 'Розраховуємо...' : 'Розрахувати вартість'}
              </Button>
            </form>
          </div>

          {/* Результат */}
          <div className="calculator-result-container">
            {result ? (
              <div className="result-card">
                <h3>Результат розрахунку</h3>
                
                <div className="result-details">
                  <div className="result-item">
                    <span className="label">Послуга:</span>
                    <span className="value">{result.services[0]?.service?.name}</span>
                  </div>
                  <div className="result-item">
                    <span className="label">Базова ціна:</span>
                    <span className="value">{result.services[0]?.basePrice} грн</span>
                  </div>
                  
                  {result.services[0]?.coefficients && (
                    <>
                      <div className="result-divider"></div>
                      <div className="breakdown-title">Коефіцієнти:</div>
                      
                      <div className="result-item">
                        <span className="label">Марка ({result.carInfo.brand}):</span>
                        <span className="value">×{result.services[0].coefficients.brand}</span>
                      </div>
                      <div className="result-item">
                        <span className="label">Вік авто ({new Date().getFullYear() - result.carInfo.year} р.):</span>
                        <span className="value">×{result.services[0].coefficients.age}</span>
                      </div>
                      {result.urgency === 'urgent' && (
                        <div className="result-item urgent">
                          <span className="label">Терміновість:</span>
                          <span className="value">×{result.services[0].coefficients.urgency}</span>
                        </div>
                      )}
                    </>
                  )}
                </div>

                <div className="result-total">
                  <span className="label">Орієнтовна вартість:</span>
                  <span className="price">{result.pricing.total} грн</span>
                </div>

                <div className="result-note">
                  <p>* Остаточна вартість може відрізнятися після огляду автомобіля</p>
                </div>

                <div className="result-actions">
                  <Button 
                    variant="primary" 
                    size="large" 
                    fullWidth
                    onClick={handleBooking}
                  >
                    Записатися на ремонт
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setResult(null)}
                  >
                    Новий розрахунок
                  </Button>
                </div>
              </div>
            ) : (
              <div className="result-placeholder">
                <span className="placeholder-icon">🧮</span>
                <h3>Як працює калькулятор?</h3>
                <ol>
                  <li>Оберіть потрібну послугу</li>
                  <li>Вкажіть марку вашого авто</li>
                  <li>Введіть рік випуску</li>
                  <li>Натисніть "Розрахувати"</li>
                </ol>
                <p className="note">
                  Вартість розраховується з урахуванням складності робіт для вашої марки авто та його віку.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Інформаційний блок */}
        <div className="info-section">
          <div className="info-card">
            <span className="info-icon">💡</span>
            <h4>Чому ціни відрізняються?</h4>
            <p>Вартість ремонту залежить від марки автомобіля, його віку та терміновості робіт. 
               Преміум-марки потребують спеціального обладнання та запчастин.</p>
          </div>
          <div className="info-card">
            <span className="info-icon">📞</span>
            <h4>Потрібна консультація?</h4>
            <p>Зателефонуйте нам за номером <a href="tel:+380501234567">+380 50 123 45 67</a> 
               і наші спеціалісти допоможуть визначити точну вартість ремонту.</p>
          </div>
          <div className="info-card">
            <span className="info-icon">🔧</span>
            <h4>Безкоштовна діагностика</h4>
            <p>При замовленні ремонту на суму від 2000 грн діагностика безкоштовна!</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalculatorPage;
