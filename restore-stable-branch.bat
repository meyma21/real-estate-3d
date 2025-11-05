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

REM Require the stable branch name as an argument
if "%~1"=="" (
  echo Usage: restore-stable-branch.bat stable/working-YYYY-MM-DD_HH-MM-SS
  echo Example: restore-stable-branch.bat stable/working-2025-11-05_14-22-10
  echo Tip: your last save printed the exact branch name to use.
  exit /b 1
)

set TARGET=%~1

REM Fetch latest refs
git fetch --all --prune

REM Check if the target exists on remote
git show-ref --verify --quiet refs/remotes/origin/%TARGET%
if errorlevel 1 (
  REM Maybe it's already local?
  git show-ref --verify --quiet refs/heads/%TARGET%
  if errorlevel 1 (
    echo [ERROR] Could not find branch '%TARGET%' locally or on origin.
    exit /b 1
  ) else (
    git checkout %TARGET%
    goto :done
  )
) else (
  REM Create/Reset a local branch to track the remote stable branch
  git checkout -B %TARGET% origin/%TARGET%
)

:done
echo.
echo [OK] Restored working tree to branch: %TARGET%
echo [SUCCESS] Restore completed.
echo         Current HEAD:
git --no-pager log -1 --pretty=oneline
echo.
pause
endlocal
exit /b 0


