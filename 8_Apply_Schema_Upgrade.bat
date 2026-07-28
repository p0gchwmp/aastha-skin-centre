@echo off
title Aastha Apply Full JSON-LD
cd /d "%~dp0"
call "_ensure_python_environment.bat"
if errorlevel 1 pause & exit /b 1
".venv\Scripts\python.exe" scripts\apply_saved_schema.py
echo.
echo Saved full JSON-LD files were applied. Run website QA next.
pause
