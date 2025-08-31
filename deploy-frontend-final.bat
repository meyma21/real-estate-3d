@echo off
echo ========================================
echo PRODUCTION FRONTEND DEPLOYMENT
echo ========================================
echo.
echo Setting environment variables...
set NODE_ENV=production
set VITE_MODE=production
echo.
echo Cleaning previous build...
if exist dist rmdir /s /q dist
echo.
echo Installing dependencies...
npm install
echo.
echo Building frontend in PRODUCTION mode...
npm run build
echo.
echo Checking build output...
if exist dist\index.html (
    echo ✅ Build successful!
    echo.
    echo Deploying to Firebase Hosting...
    firebase deploy --only hosting
    echo.
    echo 🎉 Production frontend deployment complete!
) else (
    echo ❌ Build failed! Check for errors above.
)
echo.
pause
