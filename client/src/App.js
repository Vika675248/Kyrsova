import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import PrivateRoute from './components/PrivateRoute/PrivateRoute';

// Сторінки
import HomePage from './pages/HomePage/HomePage';
import ServicesPage from './pages/ServicesPage/ServicesPage';
import ServiceDetailPage from './pages/ServiceDetailPage/ServiceDetailPage';
import CalculatorPage from './pages/CalculatorPage/CalculatorPage';
import BookingPage from './pages/BookingPage/BookingPage';
import LoginPage from './pages/LoginPage/LoginPage';
import RegisterPage from './pages/RegisterPage/RegisterPage';
import ProfilePage from './pages/ProfilePage/ProfilePage';
import AppointmentsPage from './pages/AppointmentsPage/AppointmentsPage';
import AppointmentDetailPage from './pages/AppointmentDetailPage/AppointmentDetailPage';
import HistoryPage from './pages/HistoryPage/HistoryPage';
import ContactsPage from './pages/ContactsPage/ContactsPage';
import AdminDashboard from './pages/AdminDashboard/AdminDashboard';
import NotFoundPage from './pages/NotFoundPage/NotFoundPage';

/**
 * Головний компонент додатку
 * Визначає маршрутизацію та структуру додатку
 */
function App() {
  return (
    <Layout>
      <Routes>
        {/* Публічні маршрути */}
        <Route path="/" element={<HomePage />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/services/:id" element={<ServiceDetailPage />} />
        <Route path="/calculator" element={<CalculatorPage />} />
        <Route path="/contacts" element={<ContactsPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Захищені маршрути */}
        <Route
          path="/booking"
          element={
            <PrivateRoute>
              <BookingPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <ProfilePage />
            </PrivateRoute>
          }
        />
        <Route
          path="/appointments"
          element={
            <PrivateRoute>
              <AppointmentsPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/appointments/:id"
          element={
            <PrivateRoute>
              <AppointmentDetailPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/history"
          element={
            <PrivateRoute>
              <HistoryPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <PrivateRoute>
              <AdminDashboard />
            </PrivateRoute>
          }
        />

        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Layout>
  );
}

export default App;
