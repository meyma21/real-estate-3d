@echo off
echo ========================================
echo    Railway Environment Setup
echo ========================================
echo.

echo This script helps you set up Railway environment variables
echo.

echo Step 1: Install Railway CLI (if not already installed)
echo Run: npm install -g @railway/cli
echo.

echo Step 2: Login to Railway
echo Run: railway login
echo.

echo Step 3: Link your project
echo Run: railway link
echo.

echo Step 4: Set environment variables
echo You need to set these variables in Railway dashboard:
echo.
echo FIREBASE_PROJECT_ID=your-project-id
echo FIREBASE_CLIENT_EMAIL=your-service-account-email
echo FIREBASE_PRIVATE_KEY=your-private-key-with-newlines
echo FIREBASE_STORAGE_BUCKET=your-storage-bucket
echo JWT_SECRET=your-jwt-secret
echo.

echo Step 5: Deploy
echo Run: railway up
echo.

echo ========================================
echo    Manual Steps Required
echo ========================================
echo.
echo 1. Go to Railway dashboard: https://railway.app
echo 2. Select your project: real-estate-3d
echo 3. Go to Variables tab
echo 4. Add the environment variables listed above
echo 5. Go to Deployments tab
echo 6. Click "Redeploy" or push new code
echo.

pause
