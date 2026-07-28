@echo off
setlocal
cd /d "%~dp0"

set "VENV_PY=%CD%\.venv\Scripts\python.exe"

if exist "%VENV_PY%" goto CHECK_DOCX

echo Creating a private Python environment inside this website folder...

where py >nul 2>nul
if %errorlevel%==0 (
    py -3.13 -m venv ".venv" >nul 2>nul
    if not exist "%VENV_PY%" py -m venv ".venv"
) else (
    python -m venv ".venv"
)

if not exist "%VENV_PY%" (
    echo ERROR: Could not create the .venv Python environment.
    echo Make sure Python is installed and "Add Python to PATH" is enabled.
    exit /b 1
)

:CHECK_DOCX
"%VENV_PY%" -c "import docx, lxml" >nul 2>nul
if %errorlevel%==0 exit /b 0

echo Installing python-docx inside the private environment...
"%VENV_PY%" -m pip install --upgrade pip
"%VENV_PY%" -m pip uninstall -y docx >nul 2>nul
"%VENV_PY%" -m pip install --no-cache-dir --force-reinstall python-docx lxml

"%VENV_PY%" -c "import docx, lxml" >nul 2>nul
if not %errorlevel%==0 (
    echo ERROR: python-docx still cannot be imported.
    "%VENV_PY%" -c "import sys; print('Python:', sys.executable); import docx"
    exit /b 1
)

exit /b 0
