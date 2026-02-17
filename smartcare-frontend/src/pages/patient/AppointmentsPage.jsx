import React, { useEffect, useState } from 'react';
import { appointmentAPI } from '../../api/appointmentApi';
import { doctorAPI } from '../../api/doctorApi';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Loader from '../../components/common/Loader';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import {
  FiCalendar,
  FiClock,
  FiUser,
  FiVideo,
  FiMapPin,
  FiX,
  FiCheck,
  FiMessageSquare,
} from 'react-icons/fi';
import { toast } from 'react-toastify';

const AppointmentsPage = () => {
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBookModal, setShowBookModal] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [bookingData, setBookingData] = useState({
    doctor: '',
    type: 'in-person',
    scheduledDate: '',
    startTime: '',
    reasonForVisit: '',
    symptoms: '',
  });

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await appointmentAPI.getAppointments();
      setAppointments(response.data.appointments || []);
    } catch (error) {
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const fetchDoctors = async () => {
    try {
      const response = await doctorAPI.getAllDoctors({ limit: 100 });
      setDoctors(response.data.doctors || []);
    } catch (error) {
      toast.error('Failed to load doctors');
    }
  };

  const fetchAvailability = async (doctorId, date) => {
    try {
      const response = await doctorAPI.getDoctorAvailability(doctorId, date);
      setAvailableSlots(response.data.availableSlots || []);
    } catch (error) {
      toast.error('Failed to load availability');
    }
  };

  const handleBookAppointment = async () => {
    try {
      await appointmentAPI.createAppointment({
        ...bookingData,
        symptoms: bookingData.symptoms.split(',').map((s) => s.trim()).filter(Boolean),
      });
      toast.success('Appointment booked successfully!');
      setShowBookModal(false);
      fetchAppointments();
    } catch (error) {
      toast.error('Failed to book appointment');
    }
  };

  const handleCancelAppointment = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
    try {
      await appointmentAPI.cancelAppointment(id, { reason: 'Cancelled by patient' });
      toast.success('Appointment cancelled');
      fetchAppointments();
    } catch (error) {
      toast.error('Failed to cancel appointment');
    }
  };

  const openBookModal = async () => {
    await fetchDoctors();
    setShowBookModal(true);
  };

  const selectDoctor = (doctor) => {
    setSelectedDoctor(doctor);
    setBookingData({ ...bookingData, doctor: doctor._id });
    if (bookingData.scheduledDate) {
      fetchAvailability(doctor._id, bookingData.scheduledDate);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'completed':
        return 'info';
      case 'cancelled':
        return 'default';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader size="xl" />
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Appointments</h1>
          <p className="text-gray-600">Manage your doctor appointments</p>
        </div>
        <Button onClick={openBookModal} leftIcon={<FiCalendar />}>
          Book Appointment
        </Button>
      </div>

      {/* Appointments List */}
      <Card>
        {appointments.length === 0 ? (
          <div className="text-center py-12">
            <FiCalendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-2">No appointments yet</p>
            <p className="text-sm text-gray-400 mb-4">Book your first appointment with a doctor</p>
            <Button onClick={openBookModal}>Book Appointment</Button>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {appointments.map((apt) => (
              <div key={apt._id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="w-14 h-14 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      {apt.type === 'telemedicine' ? (
                        <FiVideo className="w-7 h-7 text-primary-600" />
                      ) : (
                        <FiMapPin className="w-7 h-7 text-primary-600" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="font-medium text-gray-900">
                          Dr. {apt.doctor?.user?.firstName} {apt.doctor?.user?.lastName}
                        </h4>
                        <Badge variant={getStatusColor(apt.status)}>{apt.status}</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">{apt.reasonForVisit}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span><FiCalendar className="inline w-4 h-4 mr-1" />{new Date(apt.scheduledDate).toLocaleDateString()}</span>
                        <span><FiClock className="inline w-4 h-4 mr-1" />{apt.startTime}</span>
                        <span><FiVideo className="inline w-4 h-4 mr-1" />{apt.type === 'telemedicine' ? 'Video Call' : 'In-Person'}</span>
                      </div>
                    </div>
                  </div>
                  {['pending', 'confirmed'].includes(apt.status) && (
                    <button
                      onClick={() => handleCancelAppointment(apt._id)}
                      className="p-2 text-gray-400 hover:text-danger-600 hover:bg-danger-50 rounded-lg transition-colors"
                    >
                      <FiX />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Book Appointment Modal */}
      {showBookModal && (
        <Modal
          title="Book Appointment"
          onClose={() => setShowBookModal(false)}
          size="lg"
          footer={
            <div className="flex justify-end space-x-3">
              <Button variant="outline" onClick={() => setShowBookModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleBookAppointment} disabled={!bookingData.startTime}>
                Book Appointment
              </Button>
            </div>
          }
        >
          <div className="space-y-4">
            {/* Doctor Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Doctor</label>
              <div className="grid grid-cols-2 gap-3 max-h-48 overflow-y-auto">
                {doctors.map((doctor) => (
                  <button
                    key={doctor._id}
                    onClick={() => selectDoctor(doctor)}
                    className={`p-3 rounded-lg border-2 text-left transition-colors ${
                      selectedDoctor?._id === doctor._id
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <p className="font-medium text-sm">Dr. {doctor.user?.firstName} {doctor.user?.lastName}</p>
                    <p className="text-xs text-gray-500">{doctor.specialization}</p>
                    <p className="text-xs text-primary-600">${doctor.consultationFee}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Appointment Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Appointment Type</label>
              <div className="flex space-x-3">
                <button
                  onClick={() => setBookingData({ ...bookingData, type: 'in-person' })}
                  className={`flex-1 p-3 rounded-lg border-2 transition-colors ${
                    bookingData.type === 'in-person'
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200'
                  }`}
                >
                  <FiMapPin className="w-5 h-5 mx-auto mb-1" />
                  <span className="text-sm">In-Person</span>
                </button>
                <button
                  onClick={() => setBookingData({ ...bookingData, type: 'telemedicine' })}
                  className={`flex-1 p-3 rounded-lg border-2 transition-colors ${
                    bookingData.type === 'telemedicine'
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200'
                  }`}
                >
                  <FiVideo className="w-5 h-5 mx-auto mb-1" />
                  <span className="text-sm">Video Call</span>
                </button>
              </div>
            </div>

            {/* Date Selection */}
            {selectedDoctor && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Date</label>
                <input
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  value={bookingData.scheduledDate}
                  onChange={(e) => {
                    setBookingData({ ...bookingData, scheduledDate: e.target.value });
                    fetchAvailability(selectedDoctor._id, e.target.value);
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>
            )}

            {/* Time Slots */}
            {availableSlots.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Time</label>
                <div className="grid grid-cols-4 gap-2">
                  {availableSlots.map((slot, idx) => (
                    <button
                      key={idx}
                      onClick={() => setBookingData({ ...bookingData, startTime: slot.start })}
                      className={`p-2 rounded-lg text-sm transition-colors ${
                        bookingData.startTime === slot.start
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {slot.start}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <Input
              label="Reason for Visit"
              value={bookingData.reasonForVisit}
              onChange={(e) => setBookingData({ ...bookingData, reasonForVisit: e.target.value })}
              placeholder="e.g., Annual checkup, Headache"
            />

            <Input
              label="Symptoms (comma separated)"
              value={bookingData.symptoms}
              onChange={(e) => setBookingData({ ...bookingData, symptoms: e.target.value })}
              placeholder="e.g., fever, headache, fatigue"
            />
          </div>
        </Modal>
      )}
    </div>
  );
};

export default AppointmentsPage;
