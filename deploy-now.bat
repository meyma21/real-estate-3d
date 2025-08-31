@echo off
echo Deploying updated environment configuration...
echo.
npm run build
echo.
firebase deploy --only hosting
echo.
echo Deployment complete! Check the console for environment logs.
pause
