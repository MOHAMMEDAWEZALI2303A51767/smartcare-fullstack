import React, { useEffect, useState } from 'react';
import { doctorAPI } from '../../api/doctorApi';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Loader from '../../components/common/Loader';
import {
  FiCalendar,
  FiUsers,
  FiStar,
  FiDollarSign,
  FiTrendingUp,
  FiClock,
  FiVideo,
  FiArrowRight,
} from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';

const DoctorDashboard = () => {
  const [stats, setStats] = useState(null);
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await doctorAPI.getDashboard();
      setStats(response.data.stats);
      setTodayAppointments(response.data.todayAppointments || []);
      setUpcomingAppointments(response.data.upcomingAppointments || []);
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

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
      label: 'Total Patients',
      value: stats?.totalPatients || 0,
      color: 'bg-primary-100 text-primary-600',
    },
    {
      icon: FiCalendar,
      label: 'Total Appointments',
      value: stats?.totalAppointments || 0,
      color: 'bg-secondary-100 text-secondary-600',
    },
    {
      icon: FiStar,
      label: 'Rating',
      value: stats?.rating ? `${stats.rating}/5` : 'N/A',
      color: 'bg-warning-100 text-warning-600',
    },
    {
      icon: FiDollarSign,
      label: 'Monthly Earnings',
      value: `$${stats?.monthlyEarnings || 0}`,
      color: 'bg-danger-100 text-danger-600',
    },
  ];

  return (
    <div className="p-6">
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Doctor Dashboard</h1>
        <p className="text-gray-600">Manage your practice and patients</p>
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

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Today's Appointments */}
        <Card
          header={
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Today's Appointments</h3>
              <Link to="/appointments" className="text-sm text-primary-600 hover:text-primary-700 flex items-center">
                View All <FiArrowRight className="ml-1" />
              </Link>
            </div>
          }
        >
          {todayAppointments.length === 0 ? (
            <div className="text-center py-8">
              <FiCalendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No appointments today</p>
            </div>
          ) : (
            <div className="space-y-4">
              {todayAppointments.map((apt) => (
                <div key={apt._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                      <FiClock className="w-5 h-5 text-primary-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {apt.patient?.user?.firstName} {apt.patient?.user?.lastName}
                      </p>
                      <p className="text-sm text-gray-500">{apt.startTime} - {apt.reasonForVisit}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {apt.type === 'telemedicine' && (
                      <button className="p-2 bg-primary-100 text-primary-600 rounded-lg hover:bg-primary-200">
                        <FiVideo className="w-5 h-5" />
                      </button>
                    )}
                    <Badge variant={apt.status === 'confirmed' ? 'success' : 'warning'}>
                      {apt.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Upcoming Appointments */}
        <Card
          header={
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Upcoming</h3>
              <Link to="/appointments" className="text-sm text-primary-600 hover:text-primary-700 flex items-center">
                View All <FiArrowRight className="ml-1" />
              </Link>
            </div>
          }
        >
          {upcomingAppointments.length === 0 ? (
            <div className="text-center py-8">
              <FiCalendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No upcoming appointments</p>
            </div>
          ) : (
            <div className="space-y-4">
              {upcomingAppointments.map((apt) => (
                <div key={apt._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-secondary-100 rounded-lg flex items-center justify-center">
                      <FiCalendar className="w-5 h-5 text-secondary-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {apt.patient?.user?.firstName} {apt.patient?.user?.lastName}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(apt.scheduledDate).toLocaleDateString()} at {apt.startTime}
                      </p>
                    </div>
                  </div>
                  <Badge variant="info">{apt.type === 'telemedicine' ? 'Video' : 'In-Person'}</Badge>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default DoctorDashboard;
