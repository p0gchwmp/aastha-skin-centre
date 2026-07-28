@echo off
setlocal
title Aastha Clean Deployment Build
cd /d "%~dp0"

call "_ensure_python_environment.bat"
if errorlevel 1 (
    echo.
    echo Python environment setup failed.
    pause
    exit /b 1
)

echo Rebuilding sitemap...
".venv\Scripts\python.exe" scripts\rebuild_sitemap.py
if errorlevel 1 (
    echo.
    echo ERROR: Sitemap rebuild failed.
    pause
    exit /b 1
)

echo.
echo Running strict predeployment check...
".venv\Scripts\python.exe" scripts\predeploy_check.py
if errorlevel 1 (
    echo.
    echo ERROR: Build stopped because the predeployment check found errors.
    pause
    exit /b 1
)

echo.
echo Creating clean public dist folder...
".venv\Scripts\python.exe" scripts\build_static_dist.py
if errorlevel 1 (
    echo.
    echo ERROR: The dist folder was NOT created.
    echo Fix the error above and run this file again.
    pause
    exit /b 1
)

echo.
echo SUCCESS: Clean deployment files are inside:
echo %CD%\dist
echo.
pause
