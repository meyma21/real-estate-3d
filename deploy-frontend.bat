@echo off
echo ========================================
echo    Frontend Build & Deploy (Firebase)
echo ========================================
echo.
echo Current directory:
cd
echo.
echo Step 1: Install deps (optional if already installed)
call npm install
echo.
echo Step 2: Build production bundle
call npm run build
if %errorlevel% neq 0 (
  echo Build failed. Aborting.
  exit /b %errorlevel%
)
echo.
echo Step 3: Deploy to Firebase Hosting
call firebase deploy --only hosting
if %errorlevel% neq 0 (
  echo Deploy failed. Aborting.
  exit /b %errorlevel%
)
echo.
echo ========================================
echo    Deploy complete!
echo https://real-estate-vis-management-sys.web.app
echo ========================================
pause

@echo off
echo Building frontend...
npm run build
echo.
echo Deploying to Firebase Hosting...
firebase deploy --only hosting
echo.
echo Frontend deployment complete!
pause
