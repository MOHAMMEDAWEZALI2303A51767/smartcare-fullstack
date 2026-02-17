import React, { useState, useRef, useEffect } from 'react';
import { aiAPI } from '../../api/aiApi';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import { FiSend, FiUser, FiCpu, FiRefreshCw, FiCheckCircle } from 'react-icons/fi';
import { toast } from 'react-toastify';

const SymptomCheckerPage = () => {
  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [assessment, setAssessment] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const startSession = async () => {
    try {
      setLoading(true);
      const response = await aiAPI.startSymptomCheck();
      setSessionId(response.data.sessionId);
      setMessages([
        { role: 'assistant', message: response.data.message, timestamp: new Date() },
      ]);
      setAssessment(null);
    } catch (error) {
      toast.error('Failed to start symptom check');
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || !sessionId) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');
    setMessages((prev) => [
      ...prev,
      { role: 'user', message: userMessage, timestamp: new Date() },
    ]);

    try {
      setLoading(true);
      const response = await aiAPI.sendSymptomMessage(sessionId, userMessage);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', message: response.data.message, timestamp: new Date() },
      ]);
    } catch (error) {
      toast.error('Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  const completeAssessment = async () => {
    if (!sessionId) return;

    try {
      setLoading(true);
      const response = await aiAPI.completeSymptomCheck(sessionId);
      setAssessment(response.data.assessment);
      toast.success('Assessment completed!');
    } catch (error) {
      toast.error('Failed to complete assessment');
    } finally {
      setLoading(false);
    }
  };

  const resetSession = () => {
    setSessionId(null);
    setMessages([]);
    setAssessment(null);
  };

  const getUrgencyColor = (level) => {
    switch (level) {
      case 'emergency':
        return 'bg-danger-100 text-danger-800 border-danger-200';
      case 'high':
        return 'bg-warning-100 text-warning-800 border-warning-200';
      case 'medium':
        return 'bg-primary-100 text-primary-800 border-primary-200';
      default:
        return 'bg-secondary-100 text-secondary-800 border-secondary-200';
    }
  };

  if (!sessionId) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="text-center py-16">
          <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <FiCpu className="w-10 h-10 text-primary-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">AI Symptom Checker</h1>
          <p className="text-gray-600 max-w-lg mx-auto mb-8">
            Describe your symptoms to our AI assistant and get an initial health assessment. 
            This tool helps you understand potential causes and recommends next steps.
          </p>
          <div className="bg-warning-50 border border-warning-200 rounded-lg p-4 max-w-lg mx-auto mb-8">
            <p className="text-sm text-warning-800">
              <strong>Disclaimer:</strong> This is not a substitute for professional medical advice. 
              If you have a medical emergency, please call 911 or visit the nearest emergency room.
            </p>
          </div>
          <Button onClick={startSession} size="lg">
            Start Symptom Check
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">AI Symptom Checker</h1>
          <p className="text-gray-600">Session ID: {sessionId}</p>
        </div>
        <Button variant="outline" onClick={resetSession} leftIcon={<FiRefreshCw />}>
          New Session
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Chat Section */}
        <div className="lg:col-span-2">
          <Card className="h-[500px] flex flex-col">
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-4 ${
                      msg.role === 'user'
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    <div className="flex items-center space-x-2 mb-2">
                      {msg.role === 'assistant' ? (
                        <FiCpu className="w-4 h-4" />
                      ) : (
                        <FiUser className="w-4 h-4" />
                      )}
                      <span className="text-xs font-medium">
                        {msg.role === 'assistant' ? 'AI Assistant' : 'You'}
                      </span>
                    </div>
                    <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 rounded-lg p-4">
                    <Loader size="sm" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {!assessment && (
              <div className="border-t border-gray-100 p-4">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="Type your symptoms..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    disabled={loading}
                  />
                  <Button onClick={sendMessage} disabled={loading || !inputMessage.trim()}>
                    <FiSend />
                  </Button>
                </div>
                <div className="mt-3 flex justify-between items-center">
                  <p className="text-xs text-gray-500">
                    Describe your symptoms in detail for better assessment
                  </p>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={completeAssessment}
                    disabled={loading || messages.length < 3}
                  >
                    Complete Assessment
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Assessment Section */}
        <div>
          {assessment ? (
            <Card>
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-4">Health Assessment</h3>
                
                {/* Urgency Level */}
                <div className={`p-3 rounded-lg border mb-4 ${getUrgencyColor(assessment.urgencyLevel)}`}>
                  <p className="text-sm font-medium">Urgency Level</p>
                  <p className="text-lg font-bold capitalize">{assessment.urgencyLevel}</p>
                </div>

                {/* Possible Conditions */}
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Possible Conditions</p>
                  {assessment.possibleConditions?.map((condition, idx) => (
                    <div key={idx} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                      <span className="text-sm">{condition.condition}</span>
                      <span className="text-xs text-gray-500">{condition.probability}%</span>
                    </div>
                  ))}
                </div>

                {/* Recommended Actions */}
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Recommended Actions</p>
                  <ul className="space-y-2">
                    {assessment.recommendedActions?.map((action, idx) => (
                      <li key={idx} className="text-sm text-gray-600 flex items-start">
                        <FiCheckCircle className="w-4 h-4 text-secondary-500 mr-2 mt-0.5 flex-shrink-0" />
                        {action}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Suggested Specialist */}
                {assessment.suggestedSpecialist && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700">Suggested Specialist</p>
                    <p className="text-sm text-gray-600">{assessment.suggestedSpecialist}</p>
                  </div>
                )}

                {/* Disclaimer */}
                <div className="bg-gray-50 rounded-lg p-3 mt-4">
                  <p className="text-xs text-gray-500">{assessment.disclaimer}</p>
                </div>
              </div>
            </Card>
          ) : (
            <Card>
              <div className="p-4 text-center">
                <FiCpu className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">
                  Complete the conversation to receive your health assessment
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default SymptomCheckerPage;
