# SmartCare Testing Checklist

Complete manual testing checklist for all modules.

## Pre-Testing Setup

- [ ] Backend server running on `http://localhost:5000`
- [ ] Frontend running on `http://localhost:3000`
- [ ] MongoDB connection established
- [ ] All environment variables configured
- [ ] Email service configured
- [ ] OpenAI API key valid

---

## Module 1: Authentication

### Registration
- [ ] Register as Patient with valid data
- [ ] Register as Doctor with valid data
- [ ] Attempt registration with existing email (should fail)
- [ ] Attempt registration with invalid email format (should fail)
- [ ] Attempt registration with weak password (should fail)
- [ ] Verify email received after registration
- [ ] Click email verification link
- [ ] Verify account is activated after email confirmation

### Login
- [ ] Login with valid credentials (Patient)
- [ ] Login with valid credentials (Doctor)
- [ ] Attempt login with wrong password (should fail)
- [ ] Attempt login with non-existent email (should fail)
- [ ] Verify JWT token stored in localStorage
- [ ] Verify refresh token stored in localStorage

### Password Reset
- [ ] Request password reset
- [ ] Verify reset email received
- [ ] Click reset link
- [ ] Set new password
- [ ] Login with new password

### Logout
- [ ] Click logout button
- [ ] Verify tokens removed from localStorage
- [ ] Verify redirect to login page
- [ ] Attempt accessing protected route after logout (should redirect)

---

## Module 2: User Profile

### View Profile
- [ ] View own profile
- [ ] Verify all profile data displayed correctly
- [ ] Check role-specific fields (Patient/Doctor)

### Update Profile
- [ ] Update first name
- [ ] Update last name
- [ ] Update phone number
- [ ] Update date of birth
- [ ] Update gender
- [ ] Update address
- [ ] Upload profile picture
- [ ] Verify changes persist after refresh

### Patient Medical Profile
- [ ] Update blood type
- [ ] Add allergies
- [ ] Add chronic conditions
- [ ] Update height and weight
- [ ] Update lifestyle information
- [ ] Add emergency contact
- [ ] Add insurance information

### Change Password
- [ ] Change password with correct current password
- [ ] Attempt change with wrong current password (should fail)
- [ ] Login with new password

---

## Module 3: Doctor Management

### Doctor List (Public)
- [ ] View all doctors list
- [ ] Filter by specialization
- [ ] Filter by rating
- [ ] Filter by consultation fee
- [ ] Search doctors by name
- [ ] View doctor profile details
- [ ] Check doctor availability

### Doctor Dashboard (Doctor Only)
- [ ] View dashboard stats
- [ ] View today's appointments
- [ ] View upcoming appointments
- [ ] View total patients count
- [ ] View rating and reviews
- [ ] View monthly earnings

### Doctor Profile Management (Doctor Only)
- [ ] Update specialization
- [ ] Add qualifications
- [ ] Update consultation fee
- [ ] Update availability schedule
- [ ] Toggle telemedicine availability
- [ ] Toggle accepting new patients
- [ ] Add hospital affiliations

---

## Module 4: Appointments

### Booking (Patient)
- [ ] Browse doctors
- [ ] Select doctor
- [ ] Choose appointment type (in-person/telemedicine)
- [ ] Select date
- [ ] View available time slots
- [ ] Select time slot
- [ ] Enter reason for visit
- [ ] Enter symptoms
- [ ] Complete booking
- [ ] Verify confirmation email received
- [ ] Check appointment appears in list

### Appointment Management (Doctor)
- [ ] View pending appointments
- [ ] Confirm appointment
- [ ] View confirmed appointments
- [ ] Mark appointment as completed
- [ ] Add diagnosis notes
- [ ] Add follow-up recommendations

### Appointment Management (Patient)
- [ ] View upcoming appointments
- [ ] View past appointments
- [ ] Cancel appointment (within allowed time)
- [ ] Reschedule appointment
- [ ] Verify cancellation email received

### Video Consultation
- [ ] Join video call room
- [ ] Test audio/video
- [ ] End call
- [ ] Generate prescription after call

---

## Module 5: AI Symptom Checker

### Start Session
- [ ] Navigate to Symptom Checker
- [ ] Click "Start Symptom Check"
- [ ] Verify welcome message appears

### Conversation
- [ ] Enter symptoms description
- [ ] Answer AI follow-up questions
- [ ] Provide duration of symptoms
- [ ] Mention severity level
- [ ] Add any related symptoms

### Assessment
- [ ] Complete conversation
- [ ] Click "Complete Assessment"
- [ ] Verify possible conditions displayed
- [ ] Check urgency level
- [ ] Review recommended actions
- [ ] Check suggested specialist
- [ ] Verify disclaimer shown

### History
- [ ] View symptom check history
- [ ] View past assessments
- [ ] Check reported symptoms list

---

## Module 6: Medicine Reminders

### Create Reminder
- [ ] Click "Add Reminder"
- [ ] Enter medicine name
- [ ] Enter dosage
- [ ] Add instructions
- [ ] Select frequency (daily/weekly)
- [ ] Add multiple time slots
- [ ] Select reminder methods
- [ ] Save reminder
- [ ] Verify reminder appears in list

### Manage Reminders
- [ ] View all reminders
- [ ] Toggle reminder on/off
- [ ] Edit reminder details
- [ ] Delete reminder
- [ ] Verify deleted reminder removed

### Adherence Tracking
- [ ] View adherence report
- [ ] Check overall adherence rate
- [ ] View daily adherence breakdown
- [ ] Check doses taken count
- [ ] Check doses missed count
- [ ] View today's schedule
- [ ] Mark medicine as taken
- [ ] Mark medicine as missed

### Email Reminders
- [ ] Wait for scheduled reminder time
- [ ] Verify reminder email received
- [ ] Click "Mark as Taken" from email
- [ ] Verify status updated in app

---

## Module 7: Blood Donation Network

### Donor Registration
- [ ] Navigate to Blood Donation
- [ ] Click "Register as Donor"
- [ ] Select blood type
- [ ] Set preferred radius
- [ ] Set travel willingness
- [ ] Complete registration
- [ ] Verify donor profile created

### Donor Management
- [ ] View donor profile
- [ ] Toggle availability status
- [ ] Update profile information
- [ ] View donation history
- [ ] Check eligibility status

### Blood Requests
- [ ] Create blood request
- [ ] Enter patient name
- [ ] Select blood type
- [ ] Enter units needed
- [ ] Select urgency level
- [ ] Enter hospital details
- [ ] Add reason
- [ ] Set required by date
- [ ] Submit request
- [ ] Verify request appears in list

### Responding to Requests (Donor)
- [ ] View active blood requests
- [ ] Accept blood request
- [ ] Decline blood request
- [ ] Verify response notification sent

### Blood Compatibility
- [ ] View blood compatibility chart
- [ ] Check compatible blood types
- [ ] Verify universal donor/recipient info

---

## Module 8: AI Diet Planner

### Generate Plan
- [ ] Navigate to Diet Planner
- [ ] Click "Generate New Plan"
- [ ] Select health goals
- [ ] Select dietary restrictions
- [ ] Enter allergies
- [ ] Set calorie target
- [ ] Set duration
- [ ] Generate plan
- [ ] Wait for AI generation
- [ ] Verify plan created

### View Plan
- [ ] View plan details
- [ ] Check daily meals
- [ ] View nutritional breakdown
- [ ] Check shopping list
- [ ] Read preparation tips
- [ ] View AI insights

### Track Progress
- [ ] Log daily meals
- [ ] Mark meals as followed
- [ ] Add substitutions
- [ ] Log water intake
- [ ] Log weight
- [ ] Check adherence rate

---

## Module 9: Prescriptions

### Create Prescription (Doctor)
- [ ] Navigate to appointment
- [ ] Click "Create Prescription"
- [ ] Enter diagnosis
- [ ] Add medications
- [ ] Enter dosage for each
- [ ] Set frequency
- [ ] Set duration
- [ ] Add instructions
- [ ] Add additional notes
- [ ] Save prescription
- [ ] Verify prescription linked to appointment

### View Prescriptions (Patient)
- [ ] View all prescriptions
- [ ] View prescription details
- [ ] Check medications list
- [ ] View validity period
- [ ] Download/print prescription

### Renew Prescription (Doctor)
- [ ] Find existing prescription
- [ ] Click "Renew"
- [ ] Modify if needed
- [ ] Set new validity period
- [ ] Save renewed prescription

---

## Module 10: Admin Features

### User Management
- [ ] View all users
- [ ] Filter by role
- [ ] Search users
- [ ] Deactivate user
- [ ] Reactivate user

### Doctor Verification
- [ ] View pending doctor verifications
- [ ] Review doctor documents
- [ ] Verify doctor license
- [ ] Approve doctor
- [ ] Reject doctor with reason

### Analytics
- [ ] View dashboard stats
- [ ] Check total users
- [ ] Check total appointments
- [ ] View revenue metrics
- [ ] Check system status

---

## Security Testing

### Authentication Security
- [ ] Attempt accessing protected route without token (should fail)
- [ ] Attempt with expired token (should redirect to login)
- [ ] Attempt with invalid token (should fail)
- [ ] Verify token refresh works

### Authorization Security
- [ ] Patient attempts doctor route (should fail)
- [ ] Doctor attempts admin route (should fail)
- [ ] User accesses own data only
- [ ] Attempt accessing other user's data (should fail)

### Input Validation
- [ ] Submit SQL injection attempt (should be sanitized)
- [ ] Submit XSS attempt (should be escaped)
- [ ] Submit oversized input (should be rejected)
- [ ] Submit invalid data types (should be rejected)

### Rate Limiting
- [ ] Send multiple rapid requests (should be throttled)
- [ ] Verify rate limit headers
- [ ] Test login rate limiting

---

## Cross-Browser Testing

- [ ] Test on Chrome
- [ ] Test on Firefox
- [ ] Test on Safari
- [ ] Test on Edge
- [ ] Test responsive design on mobile
- [ ] Test responsive design on tablet

---

## Performance Testing

- [ ] Page load time < 3 seconds
- [ ] API response time < 500ms
- [ ] Image loading optimized
- [ ] No console errors
- [ ] Smooth animations

---

## Sign-off

| Tester | Date | Result |
|--------|------|--------|
|        |      | ⬜ Pass / ⬜ Fail |

**Notes:**
