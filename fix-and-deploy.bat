@echo off
echo ========================================
echo FIXING TYPESCRIPT AND DEPLOYING
echo ========================================
echo.
echo Installing TypeScript locally...
npm install typescript --save-dev
echo.
echo Installing other dependencies...
npm install
echo.
echo Building frontend...
npm run build
echo.
echo Deploying to Firebase...
firebase deploy --only hosting
echo.
echo ========================================
echo DEPLOYMENT COMPLETE!
echo ========================================
echo.
echo Now refresh your browser and check the console
echo You should see environment detection messages
echo.
pause
