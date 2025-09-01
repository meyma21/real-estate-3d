@echo off
echo ========================================
echo DEPLOYING ENHANCEMENTS
echo ========================================
echo.
echo Committing enhancements:
echo - Default route changed to /viewer/floors
echo - Fixed mobile image scrolling
echo.
git add .
git commit -m "Enhancements: Set /viewer/floors as default page and fix mobile scrolling"
echo.
echo Pushing to GitHub...
git push origin master
echo.
echo ========================================
echo ENHANCEMENTS DEPLOYED!
echo ========================================
echo.
echo Railway will auto-redeploy in 2-3 minutes
echo After deployment:
echo - https://real-estate-vis-management-sys.web.app will redirect to /viewer/floors
echo - Mobile users can now scroll between images
echo.
pause
