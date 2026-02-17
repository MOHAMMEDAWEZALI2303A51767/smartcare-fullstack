# SmartCare Deployment Guide

Step-by-step guide to deploy SmartCare to production.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [MongoDB Atlas Setup](#mongodb-atlas-setup)
3. [Cloudinary Setup](#cloudinary-setup)
4. [Gmail SMTP Setup](#gmail-smtp-setup)
5. [Backend Deployment (Render)](#backend-deployment-render)
6. [Frontend Deployment (Vercel)](#frontend-deployment-vercel)
7. [CORS Configuration](#cors-configuration)
8. [Post-Deployment Testing](#post-deployment-testing)
9. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before starting, ensure you have:

- [ ] GitHub account
- [ ] Render account (https://render.com)
- [ ] Vercel account (https://vercel.com)
- [ ] MongoDB Atlas account (https://mongodb.com/atlas)
- [ ] Cloudinary account (https://cloudinary.com)
- [ ] Gmail account (for SMTP)
- [ ] OpenAI API key (https://platform.openai.com)
- [ ] Code pushed to GitHub repository

---

## MongoDB Atlas Setup

### Step 1: Create Cluster

1. Go to https://mongodb.com/atlas and sign in
2. Click "Build a Database"
3. Choose "M0 Free" tier
4. Select your preferred cloud provider and region
5. Click "Create Cluster"

### Step 2: Configure Database Access

1. In the left sidebar, click "Database Access"
2. Click "Add New Database User"
3. Choose "Password" authentication
4. Enter username (e.g., `smartcare_admin`)
5. Click "Autogenerate Secure Password" and **SAVE IT**
6. Under "Database User Privileges", select "Read and write to any database"
7. Click "Add User"

### Step 3: Configure Network Access

1. In the left sidebar, click "Network Access"
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" (or add specific IPs)
4. Click "Confirm"

### Step 4: Get Connection String

1. Go back to "Database" → "Clusters"
2. Click "Connect" on your cluster
3. Click "Connect your application"
4. Select "Node.js" and copy the connection string
5. Replace `<password>` with your database user password
6. Replace `<dbname>` with `smartcare`

**Example:**
```
mongodb+srv://smartcare_admin:yourpassword@cluster0.xxxxx.mongodb.net/smartcare?retryWrites=true&w=majority
```

---

## Cloudinary Setup

### Step 1: Create Account

1. Go to https://cloudinary.com and sign up
2. Verify your email

### Step 2: Get Credentials

1. In the Dashboard, find your:
   - **Cloud Name** (e.g., `yourname`)
   - **API Key** (e.g., `123456789`)
   - **API Secret** (click to reveal)

2. Save these for later

### Step 3: Create Upload Preset (Optional)

1. Go to Settings → Upload
2. Scroll to "Upload presets"
3. Click "Add upload preset"
4. Set:
   - Name: `smartcare_profile`
   - Folder: `smartcare/profiles`
   - Unsigned: `Enabled`
5. Click "Save"

---

## Gmail SMTP Setup

### Step 1: Enable 2-Factor Authentication

1. Go to https://myaccount.google.com
2. Click "Security"
3. Enable "2-Step Verification"
4. Follow the setup process

### Step 2: Generate App Password

1. In Google Account → Security
2. Click "2-Step Verification"
3. Scroll down and click "App passwords"
4. Select app: "Mail"
5. Select device: "Other (Custom name)"
6. Enter name: "SmartCare"
7. Click "Generate"
8. **COPY THE 16-CHARACTER PASSWORD** (this is your SMTP_PASS)

### Step 3: Note Your Credentials

- **SMTP_USER**: Your Gmail address (e.g., `you@gmail.com`)
- **SMTP_PASS**: The 16-character app password

---

## Backend Deployment (Render)

### Step 1: Push Code to GitHub

```bash
cd smartcare-backend
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/smartcare-backend.git
git push -u origin main
```

### Step 2: Create Web Service on Render

1. Go to https://dashboard.render.com
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Select the `smartcare-backend` repository

### Step 3: Configure Service

Fill in the form:

| Field | Value |
|-------|-------|
| Name | `smartcare-api` |
| Environment | `Node` |
| Region | Choose closest to your users |
| Branch | `main` |
| Build Command | `npm install` |
| Start Command | `npm start` |
| Plan | `Free` |

### Step 4: Add Environment Variables

Click "Advanced" and add these environment variables:

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `PORT` | `10000` |
| `MONGODB_URI` | Your MongoDB Atlas connection string |
| `JWT_SECRET` | Generate: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"` |
| `JWT_REFRESH_SECRET` | Generate another random string |
| `JWT_EXPIRE` | `15m` |
| `JWT_REFRESH_EXPIRE` | `7d` |
| `SMTP_HOST` | `smtp.gmail.com` |
| `SMTP_PORT` | `587` |
| `SMTP_USER` | Your Gmail address |
| `SMTP_PASS` | Your Gmail app password |
| `FROM_EMAIL` | `noreply@smartcare.com` |
| `FROM_NAME` | `SmartCare Health` |
| `OPENAI_API_KEY` | Your OpenAI API key |
| `CLOUDINARY_CLOUD_NAME` | Your Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Your Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Your Cloudinary API secret |
| `CLIENT_URL` | `https://smartcare.vercel.app` (we'll update this after Vercel deploy) |

### Step 5: Deploy

1. Click "Create Web Service"
2. Wait for deployment to complete
3. Note your service URL (e.g., `https://smartcare-api.onrender.com`)

---

## Frontend Deployment (Vercel)

### Step 1: Push Code to GitHub

```bash
cd smartcare-frontend
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/smartcare-frontend.git
git push -u origin main
```

### Step 2: Import Project on Vercel

1. Go to https://vercel.com/dashboard
2. Click "Add New..." → "Project"
3. Import your `smartcare-frontend` repository
4. Click "Import"

### Step 3: Configure Project

| Field | Value |
|-------|-------|
| Framework Preset | `Create React App` |
| Root Directory | `./` (or `smartcare-frontend` if monorepo) |
| Build Command | `npm run build` (default) |
| Output Directory | `build` (default) |

### Step 4: Add Environment Variables

Click "Environment Variables" and add:

| Name | Value |
|------|-------|
| `REACT_APP_API_URL` | `https://smartcare-api.onrender.com/api` |
| `REACT_APP_SOCKET_URL` | `https://smartcare-api.onrender.com` |

### Step 5: Deploy

1. Click "Deploy"
2. Wait for build to complete
3. Note your deployed URL (e.g., `https://smartcare.vercel.app`)

---

## CORS Configuration

### Update Backend CORS Settings

1. Go to Render Dashboard → Your Service → Environment
2. Update `CLIENT_URL` with your actual Vercel URL:
   ```
   https://smartcare-yourusername.vercel.app
   ```
3. The change will auto-deploy

### Verify CORS is Working

Test from browser console on your Vercel site:
```javascript
fetch('https://your-api.onrender.com/api/health')
  .then(r => r.json())
  .then(console.log)
```

Should return: `{ "success": true, "message": "SmartCare API is running" }`

---

## Post-Deployment Testing

### Health Check

- [ ] Visit `https://your-api.onrender.com/api/health`
- [ ] Should return success message

### Frontend Load

- [ ] Visit your Vercel URL
- [ ] Homepage should load without errors
- [ ] Check browser console for errors

### Registration Flow

- [ ] Register a new account
- [ ] Check email for verification
- [ ] Verify email
- [ ] Login

### Core Features

- [ ] Book an appointment
- [ ] Use symptom checker
- [ ] Add medicine reminder
- [ ] Create blood request
- [ ] Generate diet plan

### Mobile Responsive

- [ ] Test on mobile device
- [ ] Test on tablet
- [ ] Verify all features work

---

## Troubleshooting

### Backend Won't Start

**Problem:** Build succeeds but service won't start

**Solution:**
1. Check logs in Render Dashboard
2. Verify all environment variables are set
3. Check MongoDB connection string is correct
4. Ensure `PORT` is set to `10000`

### CORS Errors

**Problem:** Frontend shows CORS errors

**Solution:**
1. Verify `CLIENT_URL` in backend matches your Vercel URL exactly
2. Check for trailing slashes
3. Ensure `https://` is included
4. Restart backend service after updating env vars

### Database Connection Failed

**Problem:** Cannot connect to MongoDB

**Solution:**
1. Verify connection string format
2. Check IP whitelist in MongoDB Atlas
3. Ensure password is URL-encoded (special characters)
4. Test connection locally first

### Images Not Uploading

**Problem:** Profile pictures won't upload

**Solution:**
1. Verify Cloudinary credentials
2. Check Cloudinary dashboard for upload limits
3. Ensure file size is under 5MB
4. Check browser console for errors

### Emails Not Sending

**Problem:** No emails received

**Solution:**
1. Verify Gmail app password (not regular password)
2. Check spam/junk folders
3. Verify `SMTP_USER` and `SMTP_PASS`
4. Check Render logs for email errors

### AI Features Not Working

**Problem:** Symptom checker or diet planner fails

**Solution:**
1. Verify OpenAI API key is valid
2. Check OpenAI dashboard for usage/quota
3. Verify API key has access to GPT-4
4. Check backend logs for API errors

---

## Maintenance

### Updating the Application

**Backend:**
1. Push changes to GitHub
2. Render auto-deploys

**Frontend:**
1. Push changes to GitHub
2. Vercel auto-deploys

### Monitoring

- **Render Dashboard:** Check service health and logs
- **Vercel Dashboard:** Check deployment status and analytics
- **MongoDB Atlas:** Monitor database performance
- **Cloudinary:** Monitor storage and bandwidth

### Backup Strategy

1. Enable MongoDB Atlas automated backups
2. Export important data regularly
3. Keep environment variables backed up securely

---

## Cost Estimation (Monthly)

| Service | Free Tier | Paid (if needed) |
|---------|-----------|------------------|
| Render | $0 | $7+ |
| Vercel | $0 | $20+ |
| MongoDB Atlas | $0 (512MB) | $9+ |
| Cloudinary | $0 (25GB) | $25+ |
| OpenAI | Pay per use | ~$5-20 |
| **Total** | **$0** | **$60+** |

---

## Support

If you encounter issues:

1. Check the logs in Render/Vercel dashboards
2. Review this troubleshooting section
3. Check GitHub Issues
4. Contact support with error messages

---

**Congratulations! Your SmartCare application is now live! 🎉**
