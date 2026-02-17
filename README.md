# SmartCare - AI Powered Healthcare Platform

A comprehensive full-stack healthcare platform built with the MERN stack (MongoDB, Express, React, Node.js) featuring AI-powered symptom checking, diet planning, appointment booking, medicine reminders, and blood donation network.

## Features

### Core Modules

1. **AI Symptom Checker**
   - Conversational AI health assessment
   - Possible conditions with probability scores
   - Urgency level detection
   - Doctor recommendations

2. **Doctor Appointment & Telemedicine**
   - Book appointments with verified doctors
   - Real-time availability checking
   - Video consultation support
   - Appointment management

3. **Medicine Reminder System**
   - Automated email reminders
   - Adherence tracking
   - Daily schedule management
   - Progress reports

4. **Blood Donation Network**
   - Donor registration
   - Emergency blood requests
   - Location-based donor matching
   - Blood type compatibility

5. **AI Diet Planner**
   - Personalized nutrition plans
   - Goal-based meal planning
   - Shopping list generation
   - Progress tracking

6. **Role-Based Dashboards**
   - Patient Dashboard
   - Doctor Dashboard
   - Admin Dashboard

## Tech Stack

### Backend
- **Node.js** + **Express.js** - Server framework
- **MongoDB** + **Mongoose** - Database
- **JWT** - Authentication
- **OpenAI API** - AI features
- **Nodemailer** - Email notifications
- **Socket.io** - Real-time features
- **Helmet** + **CORS** + **Rate Limiting** - Security

### Frontend
- **React 18** - UI library
- **Tailwind CSS** - Styling
- **Context API** - State management
- **Axios** - HTTP client
- **React Router** - Navigation
- **React Toastify** - Notifications
- **Chart.js** - Data visualization

## Project Structure

```
smartcare/
├── smartcare-backend/          # Node.js + Express API
│   ├── config/                 # Configuration files
│   ├── controllers/            # Route controllers
│   ├── middleware/             # Express middleware
│   ├── models/                 # Mongoose models
│   ├── routes/                 # API routes
│   ├── services/               # Business logic
│   ├── jobs/                   # Background jobs
│   ├── utils/                  # Utility functions
│   ├── validators/             # Input validation
│   ├── templates/              # Email templates
│   ├── server.js               # Entry point
│   └── app.js                  # Express app
│
└── smartcare-frontend/         # React application
    ├── public/                 # Static files
    ├── src/
    │   ├── api/                # API integration
    │   ├── components/         # React components
    │   ├── context/            # Context providers
    │   ├── hooks/              # Custom hooks
    │   ├── pages/              # Page components
    │   ├── routes/             # Route definitions
    │   └── utils/              # Utilities
    ├── package.json
    └── tailwind.config.js
```

## Setup Instructions

### Prerequisites
- Node.js (v18+)
- MongoDB (local or Atlas)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd smartcare-backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```bash
cp .env.example .env
```

4. Update `.env` with your configuration:
```env
# Server
NODE_ENV=development
PORT=5000
API_URL=http://localhost:5000
CLIENT_URL=http://localhost:3000

# Database
MONGODB_URI=mongodb://localhost:27017/smartcare

# JWT
JWT_SECRET=your-super-secret-jwt-key-min-32-characters-long
JWT_REFRESH_SECRET=your-refresh-secret-key-min-32-characters
JWT_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d

# Email (Nodemailer)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FROM_EMAIL=noreply@smartcare.com
FROM_NAME=SmartCare Health

# OpenAI
OPENAI_API_KEY=sk-your-openai-api-key

# Cloudinary (optional)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

5. Start the server:
```bash
# Development
npm run dev

# Production
npm start
```

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd smartcare-frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```bash
cp .env.example .env
```

4. Update `.env`:
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
```

5. Start the development server:
```bash
npm start
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user
- `POST /api/auth/refresh-token` - Refresh access token
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password/:token` - Reset password

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update profile
- `PUT /api/users/change-password` - Change password

### Doctors
- `GET /api/doctors` - List all doctors
- `GET /api/doctors/:id` - Get doctor details
- `GET /api/doctors/:id/availability` - Get doctor availability
- `PUT /api/doctors/profile` - Update doctor profile (Doctor only)

### Appointments
- `GET /api/appointments` - Get appointments
- `POST /api/appointments` - Book appointment (Patient only)
- `PUT /api/appointments/:id/cancel` - Cancel appointment
- `PUT /api/appointments/:id/confirm` - Confirm appointment (Doctor only)
- `PUT /api/appointments/:id/complete` - Complete appointment (Doctor only)

### Medicine Reminders
- `GET /api/medicines/reminders` - Get reminders
- `POST /api/medicines/reminders` - Create reminder
- `PUT /api/medicines/reminders/:id` - Update reminder
- `DELETE /api/medicines/reminders/:id` - Delete reminder
- `GET /api/medicines/adherence` - Get adherence report

### Blood Donation
- `POST /api/blood-donation/donor/register` - Register as donor
- `GET /api/blood-donation/requests` - Get blood requests
- `POST /api/blood-donation/requests` - Create blood request
- `PUT /api/blood-donation/requests/:id/respond` - Respond to request

### AI Features
- `POST /api/ai/symptoms/start` - Start symptom check
- `POST /api/ai/symptoms/:id/message` - Send message to AI
- `POST /api/ai/symptoms/:id/complete` - Complete assessment
- `POST /api/ai/diet/generate` - Generate diet plan
- `GET /api/ai/diet/plans` - Get diet plans

## User Roles

### Patient
- Book appointments
- Use AI symptom checker
- Manage medicine reminders
- Access diet planner
- Participate in blood donation network

### Doctor
- Manage schedule and availability
- View and confirm appointments
- Create prescriptions
- View patient history
- Update profile and verification

### Admin
- Manage users
- Verify doctors
- View analytics
- System settings

## Security Features

- JWT-based authentication with refresh tokens
- Password hashing with bcrypt
- Rate limiting on sensitive endpoints
- CORS protection
- Helmet security headers
- Input validation
- Role-based access control

## Email Notifications

The system sends automated emails for:
- Account verification
- Password reset
- Appointment confirmations
- Medicine reminders
- Blood donation requests

## Background Jobs

- **Medicine Reminder Scheduler**: Checks every minute for upcoming doses and sends email reminders
- **Missed Dose Tracker**: Marks doses as missed after grace period

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License

## Support

For support, email support@smartcare.com or join our Slack channel.

---

Built with ❤️ by the SmartCare Team
