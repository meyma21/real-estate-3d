@echo off
git add .
git commit -m "Fix Firebase config: Add missing required fields for service account JSON"
git push origin master
echo Firebase config fix committed and pushed!
pause
