@echo off
title Aastha Website Local Preview
cd /d "%~dp0"
echo Website preview will open at http://localhost:8000
start http://localhost:8000
where py >nul 2>nul
if %errorlevel%==0 (
  py -m http.server 8000
) else (
  python -m http.server 8000
)
