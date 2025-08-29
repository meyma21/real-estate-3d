# 🚀 Full-Stack Deployment Guide

## 📋 Overview
Your app consists of:
- **Frontend**: React + TypeScript (currently on Firebase Hosting)
- **Backend**: Spring Boot Java application (needs proper hosting)

## 🔧 Current Issue
Firebase Hosting only serves static files. Your backend needs a proper server environment.

## 🎯 Recommended Solution: Render.com (Free Tier)

### Step 1: Deploy Backend to Render

1. **Go to [render.com](https://render.com)**
2. **Sign up/Login**
3. **Click "New +" → "Web Service"**
4. **Connect your GitHub repository**
5. **Configure:**
   - **Name**: `real-estate-backend`
   - **Environment**: `Docker`
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Port**: `8081`

### Step 2: Update Frontend Configuration

1. **Get your backend URL** from Render (e.g., `https://your-app.onrender.com`)
2. **Update** `src/config/environment.ts`:
   ```typescript
   production: {
     apiUrl: 'https://your-app.onrender.com/api'
   }
   ```

### Step 3: Redeploy Frontend

```bash
npm run build
firebase deploy --only hosting
```

## 🌐 Alternative Hosting Options

### Railway.app
- Good for full-stack apps
- Easy deployment
- Reasonable pricing

### Heroku
- Classic choice
- Good Java support
- Paid but reliable

### DigitalOcean App Platform
- Professional hosting
- Good performance
- Moderate pricing

## ⚠️ Important Notes

1. **Backend must be running** for frontend to work properly
2. **Update CORS settings** in backend for production domain
3. **Environment variables** for sensitive data (JWT secrets, Firebase keys)
4. **Database considerations** - Firebase Firestore is fine for this setup

## 🔄 Deployment Workflow

```bash
# 1. Make changes
git add .
git commit -m "Your changes"

# 2. Deploy backend (if changed)
# Push to GitHub → Render auto-deploys

# 3. Deploy frontend
npm run build
firebase deploy --only hosting
```

## 📞 Need Help?
- Render documentation: https://render.com/docs
- Firebase hosting: https://firebase.google.com/docs/hosting
- Spring Boot deployment: https://spring.io/guides/gs/spring-boot-docker/
