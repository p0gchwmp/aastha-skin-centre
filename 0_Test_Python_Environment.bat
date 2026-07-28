@echo off
title Aastha Python Environment Test
cd /d "%~dp0"

call "_ensure_python_environment.bat"
if errorlevel 1 (
    echo.
    echo Setup failed.
    pause
    exit /b 1
)

echo.
echo Python environment is ready:
".venv\Scripts\python.exe" -c "import sys, docx, lxml; print('Python executable:', sys.executable); print('Python version:', sys.version); print('python-docx:', docx.__file__); print('lxml:', lxml.__file__)"

echo.
echo SUCCESS: The importer can now use python-docx.
pause
