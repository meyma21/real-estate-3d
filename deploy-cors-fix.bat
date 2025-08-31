@echo off
echo ========================================
echo DEPLOYING CORS FIX TO RAILWAY
echo ========================================
echo.
echo Committing CORS configuration changes...
git add .
git commit -m "Fix CORS: Allow Firebase frontend domain"
echo.
echo Pushing to GitHub...
git push origin master
echo.
echo ========================================
echo CORS FIX DEPLOYED!
echo ========================================
echo.
echo Railway will auto-redeploy in 2-3 minutes
echo After redeployment, your frontend should work!
echo.
pause
