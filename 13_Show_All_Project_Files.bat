@echo off
setlocal
title Aastha Show Project Work Files
cd /d "%~dp0"

for %%D in (
  ".venv"
  ".github"
  "_project-docs"
  "_legacy-tools"
  "backups"
  "reports"
  "content-drop"
  "schema-drop"
  "content"
  "tools"
  "deployment"
) do (
  if exist "%%~D" attrib -h "%%~D" >nul 2>nul
)

for %%F in (
  "_ensure_python_environment.bat"
  "0_Test_Python_Environment.bat"
  "1_Dry_Check_All_Content.bat"
  "1_Apply_Global_Settings.bat"
  "2_Import_All_Content.bat"
  "3_Run_Website_QA.bat"
  "4_Preview_Website_FRESH.bat"
  "5_Dry_Check_Blog_Links.bat"
  "6_Apply_Blog_Links.bat"
  "7_Dry_Check_Schema_Upgrade.bat"
  "8_Apply_Schema_Upgrade.bat"
  "9_Run_Predeploy_Check.bat"
  "10_Build_Clean_Deployment_Folder.bat"
  "11_Rebuild_Sitemap.bat"
  "12_Clean_Project_View.bat"
  "13_Show_All_Project_Files.bat"
) do (
  if exist "%%~F" attrib -h "%%~F" >nul 2>nul
)

echo.
echo Hidden project files are visible again.
pause
