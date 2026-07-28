@echo off
setlocal
title Aastha Clean Project View
cd /d "%~dp0"

echo Organising documentation...
if not exist "_project-docs" mkdir "_project-docs"
if not exist "_legacy-tools" mkdir "_legacy-tools"

for %%F in (
  "ADMIN_PANEL_BACKLOG.md"
  "FORMATTING_POLISH_BACKLOG.md"
  "ROADMAP.md"
  "BUILD_SUMMARY.json"
  "BULK_IMPORT_INSTRUCTIONS.txt"
  "DEPLOYMENT_CHECKLIST.md"
  "DOMAIN_STRATEGY.md"
  "README.md"
  "README.txt"
) do (
  if exist "%%~F" move /Y "%%~F" "_project-docs\" >nul
)

for %%F in (
  "4_Preview_Website.bat"
  "5_Diagnose_Current_Folder.bat"
  "Run_Content_Importer.bat"
) do (
  if exist "%%~F" move /Y "%%~F" "_legacy-tools\" >nul
)

echo Hiding technical work folders and individual tools...
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
  if exist "%%~D" attrib +h "%%~D" >nul 2>nul
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
  if exist "%%~F" attrib +h "%%~F" >nul 2>nul
)

echo.
echo Done.
echo Use Aastha_Tools.bat for all normal tasks.
echo Run option 16 in the menu whenever you need to see every hidden file.
pause
