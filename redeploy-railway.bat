@echo off
echo ========================================
echo    Railway Backend Redeploy Script
echo ========================================
echo.

echo Step 1: Checking Git status...
git status
echo.

echo Step 2: Adding all changes...
git add .
echo.

echo Step 3: Committing changes...
git commit -m "Redeploy backend to Railway - $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
echo.

echo Step 4: Pushing to Railway...
echo This will trigger a new deployment on Railway
git push origin master
echo.

echo Step 5: Checking deployment status...
echo Please check your Railway dashboard at: https://railway.app
echo Your backend should be available at: https://real-estate-3d-production.up.railway.app
echo.

echo ========================================
echo    Deployment Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Check Railway dashboard for deployment status
echo 2. Verify backend is running at: https://real-estate-3d-production.up.railway.app/api
echo 3. Test frontend at: https://real-estate-vis-management-sys.web.app/viewer/floors
echo.

pause
