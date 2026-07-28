@echo off
title Aastha Schema Upgrade Dry Check
cd /d "%~dp0"
call "_ensure_python_environment.bat"
if errorlevel 1 pause & exit /b 1
".venv\Scripts\python.exe" scripts\apply_saved_schema.py --dry-run
echo.
echo Open the newest schema-upgrade dry-run report inside reports.
pause
