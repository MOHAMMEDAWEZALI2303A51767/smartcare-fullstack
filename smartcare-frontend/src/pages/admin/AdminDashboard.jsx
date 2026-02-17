import React, { useEffect, useState } from 'react';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Loader from '../../components/common/Loader';
import {
  FiUsers,
  FiUserCheck,
  FiCalendar,
  FiTrendingUp,
  FiDollarSign,
  FiActivity,
} from 'react-icons/fi';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalDoctors: 0,
    totalPatients: 0,
    totalAppointments: 0,
    pendingVerifications: 0,
    monthlyRevenue: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching admin stats
    setTimeout(() => {
      setStats({
        totalUsers: 1250,
        totalDoctors: 45,
        totalPatients: 1205,
        totalAppointments: 3500,
        pendingVerifications: 8,
        monthlyRevenue: 25000,
      });
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader size="xl" />
      </div>
    );
  }

  const statCards = [
    {
      icon: FiUsers,
      label: 'Total Users',
      value: stats.totalUsers,
      color: 'bg-primary-100 text-primary-600',
    },
    {
      icon: FiUserCheck,
      label: 'Doctors',
      value: stats.totalDoctors,
      color: 'bg-secondary-100 text-secondary-600',
    },
    {
      icon: FiCalendar,
      label: 'Appointments',
      value: stats.totalAppointments,
      color: 'bg-warning-100 text-warning-600',
    },
    {
      icon: FiDollarSign,
      label: 'Monthly Revenue',
      value: `$${stats.monthlyRevenue.toLocaleString()}`,
      color: 'bg-danger-100 text-danger-600',
    },
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600">Platform overview and management</p>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => (
          <Card key={index}>
            <div className="flex items-center space-x-4">
              <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-gray-600">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Alerts */}
      {stats.pendingVerifications > 0 && (
        <Card className="mb-6 border-l-4 border-warning-500">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-warning-100 rounded-lg flex items-center justify-center">
                <FiActivity className="w-5 h-5 text-warning-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Pending Doctor Verifications</p>
                <p className="text-sm text-gray-600">{stats.pendingVerifications} doctors waiting for approval</p>
              </div>
            </div>
            <button className="px-4 py-2 bg-warning-600 text-white rounded-lg hover:bg-warning-700 transition-colors">
              Review
            </button>
          </div>
        </Card>
      )}

      {/* Recent Activity */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card header={<h3 className="font-semibold text-gray-900">Recent Activity</h3>}>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((_, idx) => (
              <div key={idx} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                  <FiUsers className="w-4 h-4 text-primary-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">New user registered</p>
                  <p className="text-xs text-gray-500">2 minutes ago</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card header={<h3 className="font-semibold text-gray-900">System Status</h3>}>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3">
              <span className="text-sm text-gray-600">API Status</span>
              <Badge variant="success">Operational</Badge>
            </div>
            <div className="flex items-center justify-between p-3">
              <span className="text-sm text-gray-600">Database</span>
              <Badge variant="success">Healthy</Badge>
            </div>
            <div className="flex items-center justify-between p-3">
              <span className="text-sm text-gray-600">Email Service</span>
              <Badge variant="success">Operational</Badge>
            </div>
            <div className="flex items-center justify-between p-3">
              <span className="text-sm text-gray-600">AI Service</span>
              <Badge variant="success">Operational</Badge>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
