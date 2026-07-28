@echo off
title Aastha Bulk Content Import
cd /d "%~dp0"

call "_ensure_python_environment.bat"
if errorlevel 1 (
    echo.
    echo Python environment setup failed.
    pause
    exit /b 1
)

".venv\Scripts\python.exe" scripts\import_exported_pages.py

echo.
echo Open the newest import HTML report inside the reports folder.
pause
