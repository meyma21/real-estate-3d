@echo off
git add .
git commit -m "Update Firebase config to use environment variables and fix frontend API URL"
git push origin master
echo Changes committed and pushed!
pause
