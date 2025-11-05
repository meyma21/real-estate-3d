@echo off
setlocal enabledelayedexpansion

REM Change to repo root (this script's directory)
cd /d "%~dp0"

REM Verify we are in a git repo
git rev-parse --is-inside-work-tree >NUL 2>&1
if errorlevel 1 (
  echo [ERROR] This directory is not a Git repository: %cd%
  echo         Run this script from your project folder (e.g. C:\Projects\real-estate-3d)
  exit /b 1
)

REM Get ISO-like timestamp using WMIC (locale independent)
for /f "skip=1 delims=. tokens=1" %%i in ('wmic os get LocalDateTime') do if not defined ldt set ldt=%%i
set YYYY=%ldt:~0,4%
set MM=%ldt:~4,2%
set DD=%ldt:~6,2%
set HH=%ldt:~8,2%
set Min=%ldt:~10,2%
set SS=%ldt:~12,2%
set TS=%YYYY%-%MM%-%DD%_%HH%-%Min%-%SS%

set BRANCH=stable/working-%TS%

REM Ensure remote exists
git remote get-url origin >NUL 2>&1
if errorlevel 1 (
  echo [ERROR] No remote 'origin' configured. Add it first, e.g.:
  echo        git remote add origin https://github.com/USERNAME/real-estate-3d.git
  exit /b 1
)

REM Commit any pending changes (optional – safe if nothing to commit)
git add -A >NUL 2>&1
git diff --cached --quiet
if errorlevel 1 (
  git commit -m "Stable snapshot %TS%" >NUL 2>&1
)

REM Create the stable branch from current HEAD (or reuse if exists)
git show-ref --verify --quiet refs/heads/%BRANCH%
if errorlevel 1 (
  git checkout -b %BRANCH%
) else (
  git checkout %BRANCH%
)

REM Push and set upstream
git push -u origin %BRANCH%
if errorlevel 1 (
  echo [ERROR] Failed to push branch '%BRANCH%' to origin.
  exit /b 1
)

echo.
echo [OK] Saved stable version on branch: %BRANCH%
echo [SUCCESS] Stable snapshot created and pushed.
echo          To restore later: restore-stable-branch.bat %BRANCH%
echo.
pause
endlocal
exit /b 0


