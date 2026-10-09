@echo off
echo ========================================================
echo  TransportPro ERP - Automated GitHub Sync
echo ========================================================
cd /d " %~dp0\

git add .
git commit -m \Auto-update TransportPro ERP: %date% %time%\
git push origin main

echo.
echo Sync completed successfully!
pause
