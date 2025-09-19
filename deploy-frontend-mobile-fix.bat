@echo off
echo Deploying frontend mobile fix...
npm run build
firebase deploy --only hosting
echo Mobile scrolling fix deployed!
pause
