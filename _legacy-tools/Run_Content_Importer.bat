@echo off
title Aastha Medical Page Importer
cd /d "%~dp0"

where py >nul 2>nul
if %errorlevel%==0 (
    py -m pip install --user python-docx
    py scripts\import_exported_pages.py
) else (
    python -m pip install --user python-docx
    python scripts\import_exported_pages.py
)

echo.
pause
