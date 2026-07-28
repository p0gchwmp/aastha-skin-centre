@echo off
title Aastha Blog Link Dry Check
cd /d "%~dp0"
call "_ensure_python_environment.bat"
if errorlevel 1 pause & exit /b 1
".venv\Scripts\python.exe" scripts\link_blogs.py --dry-run
echo.
echo Open the newest blog-links dry-run report inside reports.
pause
