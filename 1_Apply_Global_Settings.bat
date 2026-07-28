@echo off
title Aastha Global Site Settings
cd /d "%~dp0"
call "_ensure_python_environment.bat"
if errorlevel 1 pause & exit /b 1
".venv\Scripts\python.exe" scripts\apply_global_settings.py
echo.
echo Global fees, contact details, maps and theme support were applied.
pause
