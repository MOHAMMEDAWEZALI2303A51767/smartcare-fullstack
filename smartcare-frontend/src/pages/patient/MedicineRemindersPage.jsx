import React, { useEffect, useState } from 'react';
import { medicineAPI } from '../../api/medicineApi';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Loader from '../../components/common/Loader';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import {
  FiPlus,
  FiClock,
  FiCalendar,
  FiCheck,
  FiX,
  FiTrash2,
  FiTrendingUp,
  FiBell,
} from 'react-icons/fi';
import { toast } from 'react-toastify';

const MedicineRemindersPage = () => {
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [adherenceData, setAdherenceData] = useState(null);
  const [newReminder, setNewReminder] = useState({
    medicineName: '',
    dosage: '',
    instructions: '',
    frequency: { type: 'daily', times: ['08:00'] },
    reminderMethods: ['email'],
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [remindersRes, adherenceRes] = await Promise.all([
        medicineAPI.getReminders(),
        medicineAPI.getAdherenceReport(),
      ]);
      setReminders(remindersRes.data.reminders || []);
      setAdherenceData(adherenceRes.data);
    } catch (error) {
      toast.error('Failed to load medicine reminders');
    } finally {
      setLoading(false);
    }
  };

  const handleAddReminder = async () => {
    try {
      await medicineAPI.createReminder(newReminder);
      toast.success('Reminder added successfully');
      setShowAddModal(false);
      setNewReminder({
        medicineName: '',
        dosage: '',
        instructions: '',
        frequency: { type: 'daily', times: ['08:00'] },
        reminderMethods: ['email'],
      });
      fetchData();
    } catch (error) {
      toast.error('Failed to add reminder');
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      await medicineAPI.toggleReminderStatus(id);
      fetchData();
      toast.success('Reminder status updated');
    } catch (error) {
      toast.error('Failed to update reminder');
    }
  };

  const handleDeleteReminder = async (id) => {
    if (!window.confirm('Are you sure you want to delete this reminder?')) return;
    try {
      await medicineAPI.deleteReminder(id);
      fetchData();
      toast.success('Reminder deleted');
    } catch (error) {
      toast.error('Failed to delete reminder');
    }
  };

  const addTimeSlot = () => {
    setNewReminder({
      ...newReminder,
      frequency: {
        ...newReminder.frequency,
        times: [...newReminder.frequency.times, '12:00'],
      },
    });
  };

  const updateTimeSlot = (index, value) => {
    const newTimes = [...newReminder.frequency.times];
    newTimes[index] = value;
    setNewReminder({
      ...newReminder,
      frequency: { ...newReminder.frequency, times: newTimes },
    });
  };

  const removeTimeSlot = (index) => {
    const newTimes = newReminder.frequency.times.filter((_, i) => i !== index);
    setNewReminder({
      ...newReminder,
      frequency: { ...newReminder.frequency, times: newTimes },
    });
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
          <h1 className="text-2xl font-bold text-gray-900">Medicine Reminders</h1>
          <p className="text-gray-600">Track your medications and never miss a dose</p>
        </div>
        <Button onClick={() => setShowAddModal(true)} leftIcon={<FiPlus />}>
          Add Reminder
        </Button>
      </div>

      {/* Adherence Stats */}
      {adherenceData && (
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card>
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                <FiTrendingUp className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Adherence Rate</p>
                <p className="text-2xl font-bold text-gray-900">{adherenceData.overallAdherence}%</p>
              </div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-secondary-100 rounded-xl flex items-center justify-center">
                <FiCheck className="w-6 h-6 text-secondary-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Doses Taken</p>
                <p className="text-2xl font-bold text-gray-900">{adherenceData.takenDoses}</p>
              </div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-warning-100 rounded-xl flex items-center justify-center">
                <FiX className="w-6 h-6 text-warning-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Doses Missed</p>
                <p className="text-2xl font-bold text-gray-900">{adherenceData.missedDoses}</p>
              </div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-danger-100 rounded-xl flex items-center justify-center">
                <FiBell className="w-6 h-6 text-danger-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Active Reminders</p>
                <p className="text-2xl font-bold text-gray-900">{adherenceData.activeReminders}</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Reminders List */}
      <Card
        header={<h3 className="font-semibold text-gray-900">Your Reminders</h3>}
      >
        {reminders.length === 0 ? (
          <div className="text-center py-12">
            <FiBell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-2">No medicine reminders yet</p>
            <p className="text-sm text-gray-400">Add your first reminder to start tracking</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {reminders.map((reminder) => (
              <div key={reminder._id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    reminder.isActive ? 'bg-primary-100' : 'bg-gray-100'
                  }`}>
                    <FiClock className={`w-6 h-6 ${reminder.isActive ? 'text-primary-600' : 'text-gray-400'}`} />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{reminder.medicineName}</h4>
                    <p className="text-sm text-gray-500">{reminder.dosage}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge variant={reminder.isActive ? 'success' : 'default'}>
                        {reminder.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                      <span className="text-xs text-gray-400">
                        {reminder.frequency.type === 'daily' ? 'Daily' : 'Weekly'} • {reminder.frequency.times.join(', ')}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleToggleStatus(reminder._id)}
                    className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                  >
                    {reminder.isActive ? <FiX /> : <FiCheck />}
                  </button>
                  <button
                    onClick={() => handleDeleteReminder(reminder._id)}
                    className="p-2 text-gray-400 hover:text-danger-600 hover:bg-danger-50 rounded-lg transition-colors"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Add Reminder Modal */}
      {showAddModal && (
        <Modal
          title="Add Medicine Reminder"
          onClose={() => setShowAddModal(false)}
          footer={
            <div className="flex justify-end space-x-3">
              <Button variant="outline" onClick={() => setShowAddModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddReminder}>Add Reminder</Button>
            </div>
          }
        >
          <div className="space-y-4">
            <Input
              label="Medicine Name"
              value={newReminder.medicineName}
              onChange={(e) => setNewReminder({ ...newReminder, medicineName: e.target.value })}
              placeholder="e.g., Paracetamol"
            />
            <Input
              label="Dosage"
              value={newReminder.dosage}
              onChange={(e) => setNewReminder({ ...newReminder, dosage: e.target.value })}
              placeholder="e.g., 500mg"
            />
            <Input
              label="Instructions (Optional)"
              value={newReminder.instructions}
              onChange={(e) => setNewReminder({ ...newReminder, instructions: e.target.value })}
              placeholder="e.g., Take after meals"
            />
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Frequency</label>
              <select
                value={newReminder.frequency.type}
                onChange={(e) => setNewReminder({ 
                  ...newReminder, 
                  frequency: { ...newReminder.frequency, type: e.target.value } 
                })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Times</label>
              {newReminder.frequency.times.map((time, index) => (
                <div key={index} className="flex items-center space-x-2 mb-2">
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => updateTimeSlot(index, e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                  {newReminder.frequency.times.length > 1 && (
                    <button
                      onClick={() => removeTimeSlot(index)}
                      className="p-2 text-danger-600 hover:bg-danger-50 rounded-lg"
                    >
                      <FiTrash2 />
                    </button>
                  )}
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={addTimeSlot} leftIcon={<FiPlus />}>
                Add Time
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default MedicineRemindersPage;
