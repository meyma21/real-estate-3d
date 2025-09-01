@echo off
echo ========================================
echo DEPLOYING SECURITY CONFIG FIX
echo ========================================
echo.
echo Committing security configuration changes...
git add .
git commit -m "Fix SecurityConfig CORS: Allow Firebase frontend domain"
echo.
echo Pushing to GitHub...
git push origin master
echo.
echo ========================================
echo SECURITY FIX DEPLOYED!
echo ========================================
echo.
echo Railway will auto-redeploy in 2-3 minutes
echo This should fix the 403 Forbidden errors!
echo.
pause
