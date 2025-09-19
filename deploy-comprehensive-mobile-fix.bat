@echo off
echo ========================================
echo DEPLOYING COMPREHENSIVE MOBILE FIX
echo ========================================
echo.
echo This fix includes:
echo - CSS touch-action overrides
echo - Enhanced Swiper configuration
echo - Force-enabled touch events
echo - Pointer events fixes
echo.
echo Building frontend...
npm run build
echo.
echo Deploying to Firebase...
firebase deploy --only hosting
echo.
echo ========================================
echo COMPREHENSIVE MOBILE FIX DEPLOYED!
echo ========================================
echo.
echo Mobile users should now be able to:
echo - Swipe left/right between images
echo - Use touch gestures properly
echo - Navigate smoothly on mobile
echo.
pause
