import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  FiHome,
  FiCalendar,
  FiUser,
  FiActivity,
  FiHeart,
  FiDroplet,
  FiClipboard,
  FiMessageSquare,
  FiSettings,
  FiUsers,
  FiCheckSquare,
  FiBarChart2,
} from 'react-icons/fi';

const Sidebar = () => {
  const { user } = useAuth();

  const patientLinks = [
    { to: '/dashboard', icon: FiHome, label: 'Dashboard' },
    { to: '/appointments', icon: FiCalendar, label: 'Appointments' },
    { to: '/symptom-checker', icon: FiActivity, label: 'Symptom Checker' },
    { to: '/medicine-reminders', icon: FiClipboard, label: 'Medicine Reminders' },
    { to: '/diet-planner', icon: FiHeart, label: 'Diet Planner' },
    { to: '/blood-donation', icon: FiDroplet, label: 'Blood Donation' },
    { to: '/profile', icon: FiUser, label: 'Profile' },
  ];

  const doctorLinks = [
    { to: '/dashboard', icon: FiHome, label: 'Dashboard' },
    { to: '/appointments', icon: FiCalendar, label: 'Appointments' },
    { to: '/patients', icon: FiUsers, label: 'My Patients' },
    { to: '/schedule', icon: FiCalendar, label: 'Schedule' },
    { to: '/prescriptions', icon: FiClipboard, label: 'Prescriptions' },
    { to: '/profile', icon: FiUser, label: 'Profile' },
  ];

  const adminLinks = [
    { to: '/dashboard', icon: FiHome, label: 'Dashboard' },
    { to: '/users', icon: FiUsers, label: 'Users' },
    { to: '/doctors', icon: FiCheckSquare, label: 'Doctor Verification' },
    { to: '/appointments', icon: FiCalendar, label: 'Appointments' },
    { to: '/analytics', icon: FiBarChart2, label: 'Analytics' },
    { to: '/settings', icon: FiSettings, label: 'Settings' },
  ];

  const getLinks = () => {
    switch (user?.role) {
      case 'doctor':
        return doctorLinks;
      case 'admin':
        return adminLinks;
      default:
        return patientLinks;
    }
  };

  const links = getLinks();

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen hidden lg:block">
      <div className="p-6">
        <div className="flex items-center space-x-3 mb-8">
          <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl">S</span>
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">SmartCare</h1>
            <p className="text-xs text-gray-500 capitalize">{user?.role} Portal</p>
          </div>
        </div>

        <nav className="space-y-1">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-primary-50 text-primary-600 font-medium'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-primary-600'
                }`
              }
            >
              <link.icon className="w-5 h-5" />
              <span>{link.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
            <span className="text-gray-600 font-medium">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </span>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">{user?.firstName} {user?.lastName}</p>
            <p className="text-xs text-gray-500">{user?.email}</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
