<div align="center">

# 🏥 SmartCare

### AI-Powered Healthcare Platform

[![React](https://img.shields.io/badge/React-18.2.0-61DAFB?logo=react)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18.x-339933?logo=node.js)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6.0-47A248?logo=mongodb)](https://mongodb.com/)
[![Express](https://img.shields.io/badge/Express-4.18-000000?logo=express)](https://expressjs.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

[Live Demo](https://smartcare-demo.vercel.app) • [Documentation](https://github.com/yourusername/smartcare/wiki) • [Report Bug](https://github.com/yourusername/smartcare/issues)

</div>

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Screenshots](#screenshots)
- [Installation](#installation)
- [Usage](#usage)
- [API Documentation](#api-documentation)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

---

## 🎯 Overview

SmartCare is a comprehensive healthcare platform that leverages artificial intelligence to provide personalized health services. Built with the MERN stack, it connects patients with healthcare providers while offering intelligent health assessment tools.

### Key Highlights

- 🧠 **AI-Powered** symptom checking and diet planning
- 👨‍⚕️ **Telemedicine** support for remote consultations
- 💊 **Smart reminders** for medication adherence
- 🩸 **Blood donation** network for emergencies
- 🔐 **Secure** authentication and role-based access

---

## ✨ Features

### For Patients

| Feature | Description |
|---------|-------------|
| 🤖 **AI Symptom Checker** | Conversational health assessment with possible conditions and urgency detection |
| 📅 **Appointment Booking** | Schedule in-person or video consultations with verified doctors |
| 💊 **Medicine Reminders** | Automated email reminders with adherence tracking |
| 🥗 **AI Diet Planner** | Personalized nutrition plans based on health goals |
| 🩸 **Blood Donation** | Request or donate blood in emergencies |
| 📋 **Prescriptions** | Digital prescriptions from consultations |

### For Doctors

| Feature | Description |
|---------|-------------|
| 📊 **Dashboard** | Overview of appointments, patients, and earnings |
| 📅 **Schedule Management** | Set availability and manage bookings |
| 💬 **Video Consultations** | Built-in telemedicine capabilities |
| 📝 **Prescriptions** | Create and manage patient prescriptions |
| ⭐ **Reviews** | Receive patient feedback and ratings |

### For Admins

| Feature | Description |
|---------|-------------|
| 👥 **User Management** | Manage patients and doctors |
| ✅ **Doctor Verification** | Verify doctor credentials and licenses |
| 📈 **Analytics** | Platform usage and performance metrics |
| ⚙️ **System Settings** | Configure platform parameters |

---

## 🛠️ Tech Stack

### Frontend
```
React 18          - UI Library
Tailwind CSS      - Styling Framework
Context API       - State Management
Axios             - HTTP Client
React Router      - Navigation
Chart.js          - Data Visualization
Socket.io-client  - Real-time Communication
```

### Backend
```
Node.js           - Runtime Environment
Express.js        - Web Framework
MongoDB           - Database
Mongoose          - ODM
JWT               - Authentication
Bcrypt            - Password Hashing
Nodemailer        - Email Service
OpenAI API        - AI Integration
Cloudinary        - File Storage
Socket.io         - Real-time Events
```

### DevOps & Tools
```
Render            - Backend Hosting
Vercel            - Frontend Hosting
MongoDB Atlas     - Database Hosting
GitHub Actions    - CI/CD (optional)
ESLint            - Code Linting
Prettier          - Code Formatting
```

---

## 📸 Screenshots

<div align="center">

| Landing Page | Patient Dashboard | AI Symptom Checker |
|-------------|-------------------|-------------------|
| ![Landing](docs/screenshots/landing.png) | ![Dashboard](docs/screenshots/dashboard.png) | ![Symptom](docs/screenshots/symptom.png) |

| Appointment Booking | Medicine Reminders | Diet Planner |
|--------------------|-------------------|--------------|
| ![Booking](docs/screenshots/booking.png) | ![Medicine](docs/screenshots/medicine.png) | ![Diet](docs/screenshots/diet.png) |

</div>

---

## 🚀 Installation

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or Atlas)
- npm or yarn
- Git

### Clone Repository

```bash
git clone https://github.com/yourusername/smartcare.git
cd smartcare
```

### Backend Setup

```bash
cd smartcare-backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env with your configuration
# (see Environment Variables section)

# Start development server
npm run dev
```

### Frontend Setup

```bash
cd smartcare-frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env with your API URL
REACT_APP_API_URL=http://localhost:5000/api

# Start development server
npm start
```

### Environment Variables

#### Backend (.env)

```env
# Server
NODE_ENV=development
PORT=5000
API_URL=http://localhost:5000
CLIENT_URL=http://localhost:3000

# Database
MONGODB_URI=mongodb://localhost:27017/smartcare

# JWT
JWT_SECRET=your-jwt-secret-min-32-characters
JWT_REFRESH_SECRET=your-refresh-secret-min-32-characters

# Email (Gmail SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# OpenAI
OPENAI_API_KEY=sk-your-openai-key

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

#### Frontend (.env)

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
```

---

## 💻 Usage

### Running in Development

```bash
# Terminal 1 - Backend
cd smartcare-backend
npm run dev

# Terminal 2 - Frontend
cd smartcare-frontend
npm start
```

Visit `http://localhost:3000` to access the application.

### Creating Test Accounts

1. **Patient Account**: Register with role "Patient"
2. **Doctor Account**: Register with role "Doctor" (requires admin verification)
3. **Admin Account**: Set role directly in database or use seed script

### Demo Credentials

```
Patient: patient@demo.com / password123
Doctor:  doctor@demo.com / password123
Admin:   admin@demo.com / password123
```

---

## 📚 API Documentation

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | User login |
| POST | `/api/auth/logout` | User logout |
| GET | `/api/auth/me` | Get current user |
| POST | `/api/auth/refresh-token` | Refresh access token |

### User Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users/profile` | Get profile |
| PUT | `/api/users/profile` | Update profile |
| PUT | `/api/users/change-password` | Change password |

### Doctor Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/doctors` | List doctors |
| GET | `/api/doctors/:id` | Get doctor details |
| GET | `/api/doctors/:id/availability` | Get availability |

### Appointment Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/appointments` | Get appointments |
| POST | `/api/appointments` | Book appointment |
| PUT | `/api/appointments/:id/cancel` | Cancel appointment |

### AI Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/ai/symptoms/start` | Start symptom check |
| POST | `/api/ai/symptoms/:id/message` | Send message |
| POST | `/api/ai/diet/generate` | Generate diet plan |

**Full API documentation:** [API Docs](https://documenter.getpostman.com/view/your-api-docs)

---

## 🌍 Deployment

### Deploy to Render (Backend)

1. Push code to GitHub
2. Create new Web Service on Render
3. Connect GitHub repository
4. Set environment variables
5. Deploy

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)

### Deploy to Vercel (Frontend)

1. Push code to GitHub
2. Import project on Vercel
3. Set environment variables
4. Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

**Detailed deployment guide:** [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)

---

## 🧪 Testing

```bash
# Run backend tests
cd smartcare-backend
npm test

# Run frontend tests
cd smartcare-frontend
npm test
```

**Manual testing checklist:** [TESTING_CHECKLIST.md](TESTING_CHECKLIST.md)

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details.

---

## 📄 License

This project is licensed under the MIT License - see [LICENSE](LICENSE) for details.

---

## 🙏 Acknowledgments

- [OpenAI](https://openai.com/) for GPT-4 API
- [MongoDB](https://mongodb.com/) for database
- [Render](https://render.com/) for hosting
- [Vercel](https://vercel.com/) for frontend hosting
- [Cloudinary](https://cloudinary.com/) for image storage

---

## 📞 Contact

Your Name - [@yourtwitter](https://twitter.com/yourtwitter) - email@example.com

Project Link: [https://github.com/yourusername/smartcare](https://github.com/yourusername/smartcare)

---

<div align="center">

**[⬆ Back to Top](#-smartcare)**

Made with ❤️ and ☕

</div>
