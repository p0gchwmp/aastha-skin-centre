@echo off
title Aastha Fresh Website Preview
cd /d "%~dp0"

echo.
echo Previewing this exact folder:
echo %CD%
echo.

echo Stopping any older preview server on port 8000...
for /f "tokens=5" %%P in ('netstat -aon ^| findstr ":8000" ^| findstr "LISTENING"') do (
  taskkill /PID %%P /F >nul 2>nul
)

set CACHE=%RANDOM%%RANDOM%
start "" "http://127.0.0.1:8000/?refresh=%CACHE%"
start "" "http://127.0.0.1:8000/treatments/acne-treatment/?refresh=%CACHE%"

where py >nul 2>nul
if %errorlevel%==0 (
  py -m http.server 8000 --bind 127.0.0.1
) else (
  python -m http.server 8000 --bind 127.0.0.1
)
