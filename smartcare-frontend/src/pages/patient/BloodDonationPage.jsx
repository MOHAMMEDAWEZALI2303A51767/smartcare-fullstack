import React, { useEffect, useState } from 'react';
import { bloodAPI } from '../../api/bloodApi';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Loader from '../../components/common/Loader';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import {
  FiDroplet,
  FiPlus,
  FiMapPin,
  FiPhone,
  FiUser,
  FiCheck,
  FiX,
  FiAlertCircle,
} from 'react-icons/fi';
import { toast } from 'react-toastify';

const BloodDonationPage = () => {
  const [requests, setRequests] = useState([]);
  const [donorProfile, setDonorProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [compatibility, setCompatibility] = useState(null);

  const [registerData, setRegisterData] = useState({
    bloodType: 'O+',
    preferredRadius: 10,
    canTravel: true,
  });

  const [requestData, setRequestData] = useState({
    patientName: '',
    bloodType: 'O+',
    unitsNeeded: 1,
    urgency: 'normal',
    hospitalName: '',
    hospitalAddress: { city: '', state: '' },
    reason: '',
    requiredBy: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [requestsRes, donorRes, compatRes] = await Promise.all([
        bloodAPI.getRequests(),
        bloodAPI.getDonorProfile().catch(() => null),
        bloodAPI.getBloodCompatibility(),
      ]);
      setRequests(requestsRes.data.requests || []);
      setDonorProfile(donorRes?.data);
      setCompatibility(compatRes.data);
    } catch (error) {
      toast.error('Failed to load blood donation data');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterAsDonor = async () => {
    try {
      await bloodAPI.registerAsDonor(registerData);
      toast.success('Registered as blood donor successfully!');
      setShowRegisterModal(false);
      fetchData();
    } catch (error) {
      toast.error('Failed to register as donor');
    }
  };

  const handleCreateRequest = async () => {
    try {
      await bloodAPI.createRequest({
        ...requestData,
        location: {
          type: 'Point',
          coordinates: [0, 0], // Would use actual geolocation
        },
      });
      toast.success('Blood request created successfully!');
      setShowRequestModal(false);
      fetchData();
    } catch (error) {
      toast.error('Failed to create blood request');
    }
  };

  const handleRespondToRequest = async (requestId, response) => {
    try {
      await bloodAPI.respondToRequest(requestId, { response });
      toast.success(`Request ${response === 'accepted' ? 'accepted' : 'declined'}`);
      fetchData();
    } catch (error) {
      toast.error('Failed to respond to request');
    }
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'emergency':
        return 'danger';
      case 'critical':
        return 'danger';
      case 'urgent':
        return 'warning';
      default:
        return 'info';
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
          <h1 className="text-2xl font-bold text-gray-900">Blood Donation Network</h1>
          <p className="text-gray-600">Connect with donors and save lives</p>
        </div>
        <div className="flex space-x-3">
          {!donorProfile && (
            <Button variant="secondary" onClick={() => setShowRegisterModal(true)} leftIcon={<FiDroplet />}>
              Register as Donor
            </Button>
          )}
          <Button onClick={() => setShowRequestModal(true)} leftIcon={<FiPlus />}>
            Request Blood
          </Button>
        </div>
      </div>

      {/* Donor Status */}
      {donorProfile && (
        <Card className="mb-6">
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-danger-100 rounded-full flex items-center justify-center">
                <FiDroplet className="w-8 h-8 text-danger-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">You are a registered donor</h3>
                <p className="text-gray-600">Blood Type: <span className="font-bold text-danger-600">{donorProfile.bloodType}</span></p>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge variant={donorProfile.isAvailable ? 'success' : 'default'}>
                    {donorProfile.isAvailable ? 'Available' : 'Unavailable'}
                  </Badge>
                  <Badge variant="info">{donorProfile.totalDonations} donations</Badge>
                </div>
              </div>
            </div>
            <Button
              variant={donorProfile.isAvailable ? 'outline' : 'primary'}
              onClick={() => bloodAPI.updateAvailability(!donorProfile.isAvailable).then(fetchData)}
            >
              {donorProfile.isAvailable ? 'Set Unavailable' : 'Set Available'}
            </Button>
          </div>
        </Card>
      )}

      {/* Blood Requests */}
      <Card header={<h3 className="font-semibold text-gray-900">Active Blood Requests</h3>}>
        {requests.length === 0 ? (
          <div className="text-center py-12">
            <FiDroplet className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No active blood requests</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {requests.map((request) => (
              <div key={request._id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="w-14 h-14 bg-danger-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <span className="text-2xl font-bold text-danger-600">{request.bloodType}</span>
                    </div>
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="font-medium text-gray-900">{request.patientName}</h4>
                        <Badge variant={getUrgencyColor(request.urgency)}>
                          {request.urgency.toUpperCase()}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">
                        <FiMapPin className="inline w-4 h-4 mr-1" />
                        {request.hospitalName}, {request.hospitalAddress?.city}
                      </p>
                      <p className="text-sm text-gray-500 mb-2">{request.reason}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span><FiUser className="inline w-4 h-4 mr-1" />{request.unitsNeeded} units needed</span>
                        <span><FiAlertCircle className="inline w-4 h-4 mr-1" />Required by {new Date(request.requiredBy).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  {donorProfile && donorProfile.isAvailable && (
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleRespondToRequest(request._id, 'accepted')}
                      >
                        <FiCheck className="mr-1" /> Accept
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Register as Donor Modal */}
      {showRegisterModal && (
        <Modal
          title="Register as Blood Donor"
          onClose={() => setShowRegisterModal(false)}
          footer={
            <div className="flex justify-end space-x-3">
              <Button variant="outline" onClick={() => setShowRegisterModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleRegisterAsDonor}>Register</Button>
            </div>
          }
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Blood Type</label>
              <select
                value={registerData.bloodType}
                onChange={(e) => setRegisterData({ ...registerData, bloodType: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                {compatibility?.bloodTypes?.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <Input
              label="Preferred Radius (km)"
              type="number"
              value={registerData.preferredRadius}
              onChange={(e) => setRegisterData({ ...registerData, preferredRadius: parseInt(e.target.value) })}
            />
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={registerData.canTravel}
                onChange={(e) => setRegisterData({ ...registerData, canTravel: e.target.checked })}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="ml-2 text-sm text-gray-600">Willing to travel for donations</span>
            </label>
          </div>
        </Modal>
      )}

      {/* Create Request Modal */}
      {showRequestModal && (
        <Modal
          title="Request Blood Donation"
          onClose={() => setShowRequestModal(false)}
          footer={
            <div className="flex justify-end space-x-3">
              <Button variant="outline" onClick={() => setShowRequestModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateRequest}>Create Request</Button>
            </div>
          }
        >
          <div className="space-y-4">
            <Input
              label="Patient Name"
              value={requestData.patientName}
              onChange={(e) => setRequestData({ ...requestData, patientName: e.target.value })}
            />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Blood Type</label>
                <select
                  value={requestData.bloodType}
                  onChange={(e) => setRequestData({ ...requestData, bloodType: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  {compatibility?.bloodTypes?.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              <Input
                label="Units Needed"
                type="number"
                min="1"
                value={requestData.unitsNeeded}
                onChange={(e) => setRequestData({ ...requestData, unitsNeeded: parseInt(e.target.value) })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Urgency</label>
              <select
                value={requestData.urgency}
                onChange={(e) => setRequestData({ ...requestData, urgency: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="normal">Normal</option>
                <option value="urgent">Urgent</option>
                <option value="critical">Critical</option>
                <option value="emergency">Emergency</option>
              </select>
            </div>
            <Input
              label="Hospital Name"
              value={requestData.hospitalName}
              onChange={(e) => setRequestData({ ...requestData, hospitalName: e.target.value })}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="City"
                value={requestData.hospitalAddress.city}
                onChange={(e) => setRequestData({ 
                  ...requestData, 
                  hospitalAddress: { ...requestData.hospitalAddress, city: e.target.value } 
                })}
              />
              <Input
                label="State"
                value={requestData.hospitalAddress.state}
                onChange={(e) => setRequestData({ 
                  ...requestData, 
                  hospitalAddress: { ...requestData.hospitalAddress, state: e.target.value } 
                })}
              />
            </div>
            <Input
              label="Reason"
              value={requestData.reason}
              onChange={(e) => setRequestData({ ...requestData, reason: e.target.value })}
              placeholder="e.g., Surgery, Accident"
            />
            <Input
              label="Required By"
              type="date"
              value={requestData.requiredBy}
              onChange={(e) => setRequestData({ ...requestData, requiredBy: e.target.value })}
            />
          </div>
        </Modal>
      )}
    </div>
  );
};

export default BloodDonationPage;
