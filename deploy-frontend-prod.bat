@echo off
echo Setting environment to production...
set NODE_ENV=production
echo.
echo Building frontend in PRODUCTION mode...
npm run build
echo.
echo Deploying to Firebase Hosting...
firebase deploy --only hosting
echo.
echo Production frontend deployment complete!
pause
