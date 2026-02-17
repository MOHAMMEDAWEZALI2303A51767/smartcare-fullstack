import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useRolePermissions } from '../hooks/useRolePermissions';

// Layouts
import MainLayout from '../components/layouts/MainLayout';
import DashboardLayout from '../components/layouts/DashboardLayout';

// Public Pages
import HomePage from '../pages/public/HomePage';

// Auth Pages
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';

// Patient Pages
import PatientDashboard from '../pages/patient/PatientDashboard';
import AppointmentsPage from '../pages/patient/AppointmentsPage';
import SymptomCheckerPage from '../pages/patient/SymptomCheckerPage';
import MedicineRemindersPage from '../pages/patient/MedicineRemindersPage';
import BloodDonationPage from '../pages/patient/BloodDonationPage';
import DietPlannerPage from '../pages/patient/DietPlannerPage';

// Doctor Pages
import DoctorDashboard from '../pages/doctor/DoctorDashboard';

// Admin Pages
import AdminDashboard from '../pages/admin/AdminDashboard';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, loading } = useAuth();
  const { role } = useRolePermissions();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// Public Route Component (redirect if authenticated)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// Role-based Dashboard
const DashboardRouter = () => {
  const { isPatient, isDoctor, isAdmin } = useRolePermissions();

  if (isAdmin()) return <AdminDashboard />;
  if (isDoctor()) return <DoctorDashboard />;
  return <PatientDashboard />;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
      </Route>

      {/* Auth Routes */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <RegisterPage />
          </PublicRoute>
        }
      />

      {/* Protected Dashboard Routes */}
      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardRouter />} />
        <Route path="/appointments" element={<AppointmentsPage />} />
        
        {/* Patient-only routes */}
        <Route
          path="/symptom-checker"
          element={
            <ProtectedRoute allowedRoles={['patient']}>
              <SymptomCheckerPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/medicine-reminders"
          element={
            <ProtectedRoute allowedRoles={['patient']}>
              <MedicineRemindersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/blood-donation"
          element={
            <ProtectedRoute allowedRoles={['patient']}>
              <BloodDonationPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/diet-planner"
          element={
            <ProtectedRoute allowedRoles={['patient']}>
              <DietPlannerPage />
            </ProtectedRoute>
          }
        />

        {/* Doctor-only routes */}
        <Route
          path="/patients"
          element={
            <ProtectedRoute allowedRoles={['doctor']}>
              <div>My Patients Page</div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/schedule"
          element={
            <ProtectedRoute allowedRoles={['doctor']}>
              <div>Schedule Page</div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/prescriptions"
          element={
            <ProtectedRoute allowedRoles={['doctor']}>
              <div>Prescriptions Page</div>
            </ProtectedRoute>
          }
        />

        {/* Admin-only routes */}
        <Route
          path="/users"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <div>User Management Page</div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/analytics"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <div>Analytics Page</div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <div>Settings Page</div>
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
