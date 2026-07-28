@echo off
title Aastha Local Folder Diagnostic
cd /d "%~dp0"

call "_ensure_python_environment.bat"
if errorlevel 1 (
    echo.
    echo Python environment setup failed.
    pause
    exit /b 1
)

echo Checking this exact folder:
echo %CD%
echo.

".venv\Scripts\python.exe" scripts\diagnose_local_folder.py

echo.
for /f "delims=" %%F in ('dir /b /o-d "reports\local-folder-diagnostic-*.html" 2^>nul') do (
  start "" "reports\%%F"
  goto :done
)
:done
pause
