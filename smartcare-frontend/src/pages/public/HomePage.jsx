import React from 'react';
import { Link } from 'react-router-dom';
import { FiActivity, FiCalendar, FiHeart, FiDroplet, FiMessageSquare } from 'react-icons/fi';

const HomePage = () => {
  const features = [
    {
      icon: FiMessageSquare,
      title: 'AI Symptom Checker',
      description: 'Get instant health assessments powered by advanced AI technology.',
    },
    {
      icon: FiCalendar,
      title: 'Easy Appointments',
      description: 'Book appointments with top doctors online or for telemedicine.',
    },
    {
      icon: FiHeart,
      title: 'AI Diet Planner',
      description: 'Personalized nutrition plans tailored to your health goals.',
    },
    {
      icon: FiActivity,
      title: 'Medicine Reminders',
      description: 'Never miss a dose with smart medication tracking.',
    },
    {
      icon: FiDroplet,
      title: 'Blood Donation Network',
      description: 'Connect with donors and save lives in emergencies.',
    },
  ];

  const stats = [
    { value: '10,000+', label: 'Patients Served' },
    { value: '500+', label: 'Expert Doctors' },
    { value: '50,000+', label: 'Appointments' },
    { value: '99%', label: 'Satisfaction Rate' },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-600 to-primary-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl font-bold mb-6 leading-tight">
                Your Health, <br />
                <span className="text-secondary-300">Powered by AI</span>
              </h1>
              <p className="text-xl text-primary-100 mb-8">
                SmartCare combines cutting-edge AI technology with expert healthcare 
                professionals to provide you with personalized, accessible, and 
                efficient healthcare services.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  to="/register"
                  className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-primary-50 transition-colors"
                >
                  Get Started
                </Link>
                <Link
                  to="/doctors"
                  className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-primary-600 transition-colors"
                >
                  Find Doctors
                </Link>
              </div>
            </div>
            <div className="hidden lg:block">
              <div className="relative">
                <div className="absolute inset-0 bg-white/10 rounded-3xl transform rotate-3"></div>
                <div className="bg-white/20 backdrop-blur-lg rounded-3xl p-8 relative">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4 bg-white/90 rounded-xl p-4">
                      <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                        <FiActivity className="w-6 h-6 text-primary-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">AI Health Assessment</p>
                        <p className="text-sm text-gray-500">Check your symptoms instantly</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4 bg-white/90 rounded-xl p-4">
                      <div className="w-12 h-12 bg-secondary-100 rounded-full flex items-center justify-center">
                        <FiCalendar className="w-6 h-6 text-secondary-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">Book Appointment</p>
                        <p className="text-sm text-gray-500">Schedule with top doctors</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4 bg-white/90 rounded-xl p-4">
                      <div className="w-12 h-12 bg-warning-100 rounded-full flex items-center justify-center">
                        <FiHeart className="w-6 h-6 text-warning-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">Diet Planning</p>
                        <p className="text-sm text-gray-500">Personalized nutrition plans</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <p className="text-4xl font-bold text-primary-600 mb-2">{stat.value}</p>
                <p className="text-gray-600">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Comprehensive Healthcare Services
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need for your health and wellness, all in one place.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white rounded-xl p-8 shadow-sm hover:shadow-lg transition-shadow"
              >
                <div className="w-14 h-14 bg-primary-100 rounded-xl flex items-center justify-center mb-6">
                  <feature.icon className="w-7 h-7 text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Ready to Take Control of Your Health?
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Join thousands of users who trust SmartCare for their healthcare needs.
          </p>
          <Link
            to="/register"
            className="inline-block bg-white text-primary-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-primary-50 transition-colors"
          >
            Create Free Account
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-white font-bold text-lg mb-4">SmartCare</h3>
              <p className="text-sm">
                AI-powered healthcare platform connecting patients with expert doctors.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Services</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/doctors" className="hover:text-white">Find Doctors</Link></li>
                <li><Link to="/symptom-checker" className="hover:text-white">Symptom Checker</Link></li>
                <li><Link to="/diet-planner" className="hover:text-white">Diet Planner</Link></li>
                <li><Link to="/blood-donation" className="hover:text-white">Blood Donation</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/about" className="hover:text-white">About Us</Link></li>
                <li><Link to="/contact" className="hover:text-white">Contact</Link></li>
                <li><Link to="/privacy" className="hover:text-white">Privacy Policy</Link></li>
                <li><Link to="/terms" className="hover:text-white">Terms of Service</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-sm">
                <li>support@smartcare.com</li>
                <li>1-800-SMARTCARE</li>
                <li>123 Health Street, Medical City</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
            <p>&copy; 2024 SmartCare. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
