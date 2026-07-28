@echo off
title Aastha Content Dry Check
cd /d "%~dp0"

call "_ensure_python_environment.bat"
if errorlevel 1 (
    echo.
    echo Python environment setup failed.
    pause
    exit /b 1
)

".venv\Scripts\python.exe" scripts\import_exported_pages.py --dry-run

echo.
echo Open the newest dry-run HTML report inside the reports folder.
pause
