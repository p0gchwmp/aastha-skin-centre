@echo off
setlocal
title Aastha Verify Dist Folder
cd /d "%~dp0"

if not exist "dist\index.html" (
    echo ERROR: dist\index.html is missing.
    echo Run 10_Build_Clean_Deployment_Folder.bat first.
    pause
    exit /b 1
)

if not exist "dist\assets\css\styles.css" (
    echo ERROR: dist\assets\css\styles.css is missing.
    pause
    exit /b 1
)

if not exist "dist\assets\js\site.js" (
    echo ERROR: dist\assets\js\site.js is missing.
    pause
    exit /b 1
)

echo SUCCESS: The dist folder contains the required public files.
echo.
echo Opening dist...
start "" "%CD%\dist"
pause
