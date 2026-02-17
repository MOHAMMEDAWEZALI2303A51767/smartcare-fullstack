import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Loader from '../../components/common/Loader';
import { appointmentAPI } from '../../api/appointmentApi';
import { medicineAPI } from '../../api/medicineApi';
import {
  FiCalendar,
  FiActivity,
  FiClipboard,
  FiHeart,
  FiDroplet,
  FiArrowRight,
  FiClock,
  FiCheckCircle,
} from 'react-icons/fi';

const PatientDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    upcomingAppointments: 0,
    medicineReminders: 0,
    adherenceRate: 0,
  });
  const [appointments, setAppointments] = useState([]);
  const [todayMedicines, setTodayMedicines] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch upcoming appointments
      const appointmentsRes = await appointmentAPI.getAppointments({ upcoming: true, limit: 3 });
      setAppointments(appointmentsRes.data.appointments || []);
      setStats((prev) => ({
        ...prev,
        upcomingAppointments: appointmentsRes.data.pagination?.totalItems || 0,
      }));

      // Fetch today's medicine schedule
      const medicinesRes = await medicineAPI.getTodaySchedule();
      setTodayMedicines(medicinesRes.data.pending || []);
      setStats((prev) => ({
        ...prev,
        medicineReminders: medicinesRes.data.total || 0,
        adherenceRate: medicinesRes.data.completionRate || 0,
      }));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
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

  const quickActions = [
    {
      icon: FiCalendar,
      title: 'Book Appointment',
      description: 'Schedule with a doctor',
      link: '/doctors',
      color: 'bg-primary-100 text-primary-600',
    },
    {
      icon: FiActivity,
      title: 'Symptom Checker',
      description: 'AI health assessment',
      link: '/symptom-checker',
      color: 'bg-secondary-100 text-secondary-600',
    },
    {
      icon: FiHeart,
      title: 'Diet Planner',
      description: 'Personalized nutrition',
      link: '/diet-planner',
      color: 'bg-warning-100 text-warning-600',
    },
    {
      icon: FiDroplet,
      title: 'Blood Donation',
      description: 'Donate or request blood',
      link: '/blood-donation',
      color: 'bg-danger-100 text-danger-600',
    },
  ];

  return (
    <div className="p-6">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.firstName}!
        </h1>
        <p className="text-gray-600">Here's your health overview for today</p>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Upcoming Appointments</p>
              <p className="text-3xl font-bold text-gray-900">{stats.upcomingAppointments}</p>
            </div>
            <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
              <FiCalendar className="w-6 h-6 text-primary-600" />
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Today's Medicines</p>
              <p className="text-3xl font-bold text-gray-900">{stats.medicineReminders}</p>
            </div>
            <div className="w-12 h-12 bg-secondary-100 rounded-xl flex items-center justify-center">
              <FiClipboard className="w-6 h-6 text-secondary-600" />
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Medicine Adherence</p>
              <p className="text-3xl font-bold text-gray-900">{stats.adherenceRate}%</p>
            </div>
            <div className="w-12 h-12 bg-warning-100 rounded-xl flex items-center justify-center">
              <FiCheckCircle className="w-6 h-6 text-warning-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {quickActions.map((action, index) => (
          <Link
            key={index}
            to={action.link}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
          >
            <div className={`w-12 h-12 ${action.color} rounded-xl flex items-center justify-center mb-4`}>
              <action.icon className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">{action.title}</h3>
            <p className="text-sm text-gray-600">{action.description}</p>
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Upcoming Appointments */}
        <Card
          header={
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Upcoming Appointments</h3>
              <Link to="/appointments" className="text-sm text-primary-600 hover:text-primary-700 flex items-center">
                View All <FiArrowRight className="ml-1" />
              </Link>
            </div>
          }
        >
          {appointments.length === 0 ? (
            <div className="text-center py-8">
              <FiCalendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No upcoming appointments</p>
              <Link to="/doctors" className="text-primary-600 hover:text-primary-700 text-sm">
                Book an appointment
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {appointments.map((appointment) => (
                <div
                  key={appointment._id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                      <FiCalendar className="w-5 h-5 text-primary-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        Dr. {appointment.doctor?.user?.firstName} {appointment.doctor?.user?.lastName}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(appointment.scheduledDate).toLocaleDateString()} at {appointment.startTime}
                      </p>
                    </div>
                  </div>
                  <Badge variant={appointment.type === 'telemedicine' ? 'info' : 'default'}>
                    {appointment.type === 'telemedicine' ? 'Video' : 'In-Person'}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Today's Medicines */}
        <Card
          header={
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Today's Medicines</h3>
              <Link to="/medicine-reminders" className="text-sm text-primary-600 hover:text-primary-700 flex items-center">
                View All <FiArrowRight className="ml-1" />
              </Link>
            </div>
          }
        >
          {todayMedicines.length === 0 ? (
            <div className="text-center py-8">
              <FiClipboard className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No medicines scheduled for today</p>
              <Link to="/medicine-reminders" className="text-primary-600 hover:text-primary-700 text-sm">
                Add reminder
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {todayMedicines.slice(0, 3).map((medicine) => (
                <div
                  key={medicine._id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-secondary-100 rounded-lg flex items-center justify-center">
                      <FiClock className="w-5 h-5 text-secondary-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{medicine.medicineName}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(medicine.scheduledTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                  <Badge variant="warning">Pending</Badge>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default PatientDashboard;
