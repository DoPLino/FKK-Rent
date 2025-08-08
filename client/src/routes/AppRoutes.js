import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/Layout/Layout';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import Login from '../pages/Auth/Login';
import Register from '../pages/Auth/Register';
import Dashboard from '../pages/Dashboard/Dashboard';
import EquipmentList from '../pages/Equipment/EquipmentList';
import EquipmentDetail from '../pages/Equipment/EquipmentDetail';
import EquipmentForm from '../pages/Equipment/EquipmentForm';
import EquipmentQRCode from '../pages/Equipment/EquipmentQRCode';
import BookingList from '../pages/Bookings/BookingList';
import BookingForm from '../pages/Bookings/BookingForm';
import UserProfile from '../pages/Profile/UserProfile';
import Settings from '../pages/Settings/Settings';
import QRScanner from '../pages/QRScanner/QRScanner';
import AIDashboard from '../pages/AI/AIDashboard';
import NotFound from '../pages/NotFound/NotFound';

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="xlarge" text="Loading application..." />
      </div>
    );
  }

  return (
    <Routes>
      {/* Public routes - These don't need AuthProvider */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      {/* Protected routes */}
      <Route path="/" element={user ? <Layout /> : <Navigate to="/login" />}>
        <Route index element={<Navigate to="/dashboard" />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="equipment" element={<EquipmentList />} />
        <Route path="equipment/new" element={<EquipmentForm />} />
        <Route path="equipment/:id" element={<EquipmentDetail />} />
        <Route path="equipment/:id/edit" element={<EquipmentForm />} />
        <Route path="equipment/:id/qr" element={<EquipmentQRCode />} />
        <Route path="bookings" element={<BookingList />} />
        <Route path="bookings/new" element={<BookingForm />} />
        <Route path="qr-scanner" element={<QRScanner />} />
        <Route path="ai-dashboard" element={<AIDashboard />} />
        <Route path="profile" element={<UserProfile />} />
        <Route path="settings" element={<Settings />} />
      </Route>
      
      {/* 404 route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default AppRoutes;
