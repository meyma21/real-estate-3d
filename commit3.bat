@echo off
git add .
git commit -m "Fix FirebaseStorageConfig: Use environment variables instead of file"
git push origin master
echo Complete Firebase config fix committed and pushed!
pause
