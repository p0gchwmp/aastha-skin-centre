@echo off
title Aastha Website QA
cd /d "%~dp0"

call "_ensure_python_environment.bat"
if errorlevel 1 (
    echo.
    echo Python environment setup failed.
    pause
    exit /b 1
)

echo Rebuilding sitemap before QA...
".venv\Scripts\python.exe" scripts\rebuild_sitemap.py
if errorlevel 1 (
    echo.
    echo Sitemap rebuild failed.
    pause
    exit /b 1
)

echo.
echo Running website QA...
".venv\Scripts\python.exe" scripts\qa_site.py

echo.
echo Open the newest site QA report inside the reports folder.
pause
