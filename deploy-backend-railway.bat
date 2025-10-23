@echo off
echo ========================================
echo    Complete Railway Backend Deployment
echo ========================================
echo.

echo Step 1: Checking if Railway CLI is installed...
railway --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Railway CLI not found. Installing...
    npm install -g @railway/cli
    echo.
)

echo Step 2: Checking Git status...
git status
echo.

echo Step 3: Adding all changes...
git add .
echo.

echo Step 4: Committing changes...
git commit -m "Deploy backend to Railway - %date% %time%"
echo.

echo Step 5: Pushing to trigger Railway deployment...
git push origin master
echo.

echo Step 6: Checking Railway deployment...
echo Please wait while Railway builds and deploys your backend...
echo.

echo ========================================
echo    Deployment Commands Explained
echo ========================================
echo.
echo 1. git add . - Stages all changes for commit
echo 2. git commit -m "message" - Creates a commit with your changes
echo 3. git push origin master - Pushes to GitHub, which triggers Railway deployment
echo.
echo Railway automatically:
echo - Detects changes in your GitHub repo
echo - Builds your Docker container
echo - Deploys to their servers
echo - Assigns a new URL (if needed)
echo.

echo ========================================
echo    Next Steps
echo ========================================
echo.
echo 1. Check Railway dashboard: https://railway.app
echo 2. Verify your backend URL (should be something like):
echo    https://real-estate-3d-production.up.railway.app
echo 3. Test backend API: https://real-estate-3d-production.up.railway.app/api/floors
echo 4. If URL changed, update frontend config in src/config/environment.ts
echo 5. Redeploy frontend: firebase deploy --only hosting
echo.

echo ========================================
echo    Environment Variables Check
echo ========================================
echo.
echo Make sure these are set in Railway dashboard:
echo - FIREBASE_PROJECT_ID
echo - FIREBASE_CLIENT_EMAIL  
echo - FIREBASE_PRIVATE_KEY
echo - FIREBASE_STORAGE_BUCKET
echo - JWT_SECRET
echo.

pause
