@echo off
title Aastha Predeployment Check
cd /d "%~dp0"

call "_ensure_python_environment.bat"
if errorlevel 1 (
    echo.
    echo Python environment setup failed.
    pause
    exit /b 1
)

echo Rebuilding sitemap before predeployment check...
".venv\Scripts\python.exe" scripts\rebuild_sitemap.py
if errorlevel 1 (
    echo.
    echo Sitemap rebuild failed.
    pause
    exit /b 1
)

echo.
echo Running strict predeployment check...
".venv\Scripts\python.exe" scripts\predeploy_check.py

echo.
echo Open the newest predeploy-check report inside the reports folder.
pause
