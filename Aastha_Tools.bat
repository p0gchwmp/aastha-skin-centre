@echo off
setlocal
title Aastha Website Tools
cd /d "%~dp0"

:MENU
cls
echo ============================================================
echo              AASTHA WEBSITE CONTROL MENU
echo ============================================================
echo.
echo  1. Test Python environment
echo  2. Dry-check all imported content
echo  3. Import all content
echo  4. Apply global settings
echo  5. Rebuild sitemap and run website QA
echo  6. Preview website fresh
echo  7. Dry-check blog keyword links
echo  8. Apply blog keyword links
echo  9. Dry-check saved JSON-LD upgrade
echo 10. Apply saved JSON-LD upgrade
echo 11. Run strict predeployment check
echo 12. Build clean deployment folder
echo 13. Rebuild sitemap only
echo 14. Open reports folder
echo 15. Open content-drop folder
echo 16. Show all hidden work files
echo 17. Hide clutter again
echo  0. Exit
echo.
set /p choice=Choose an option: 

if "%choice%"=="1" call "0_Test_Python_Environment.bat" & goto MENU
if "%choice%"=="2" call "1_Dry_Check_All_Content.bat" & goto MENU
if "%choice%"=="3" call "2_Import_All_Content.bat" & goto MENU
if "%choice%"=="4" call "1_Apply_Global_Settings.bat" & goto MENU
if "%choice%"=="5" call "3_Run_Website_QA.bat" & goto MENU
if "%choice%"=="6" call "4_Preview_Website_FRESH.bat" & goto MENU
if "%choice%"=="7" call "5_Dry_Check_Blog_Links.bat" & goto MENU
if "%choice%"=="8" call "6_Apply_Blog_Links.bat" & goto MENU
if "%choice%"=="9" call "7_Dry_Check_Schema_Upgrade.bat" & goto MENU
if "%choice%"=="10" call "8_Apply_Schema_Upgrade.bat" & goto MENU
if "%choice%"=="11" call "9_Run_Predeploy_Check.bat" & goto MENU
if "%choice%"=="12" call "10_Build_Clean_Deployment_Folder.bat" & goto MENU
if "%choice%"=="13" call "11_Rebuild_Sitemap.bat" & goto MENU
if "%choice%"=="14" start "" "reports" & goto MENU
if "%choice%"=="15" start "" "content-drop" & goto MENU
if "%choice%"=="16" call "13_Show_All_Project_Files.bat" & goto MENU
if "%choice%"=="17" call "12_Clean_Project_View.bat" & goto MENU
if "%choice%"=="0" exit /b 0

echo.
echo Invalid choice.
pause
goto MENU
