@echo off
title Aastha Apply Blog Links
cd /d "%~dp0"
call "_ensure_python_environment.bat"
if errorlevel 1 pause & exit /b 1
".venv\Scripts\python.exe" scripts\link_blogs.py
echo.
echo Blog keyword links were applied. Run website QA next.
pause
