@echo off
echo Building frontend...
npm run build
echo.
echo Deploying to Firebase Hosting...
firebase deploy --only hosting
echo.
echo Frontend deployment complete!
pause
