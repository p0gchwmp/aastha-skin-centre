@echo off
title Aastha Rebuild Sitemap
cd /d "%~dp0"

call "_ensure_python_environment.bat"
if errorlevel 1 pause & exit /b 1

".venv\Scripts\python.exe" scripts\rebuild_sitemap.py

echo.
pause
