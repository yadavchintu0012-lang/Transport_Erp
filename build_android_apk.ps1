# ========================================================
#  TransportPro ERP - Local Android APK Builder Script
# ========================================================
# Run this script whenever you want to generate app-debug.apk locally
# Requires Android Studio / Java JDK installed on your PC

 = Split-Path -Parent System.Management.Automation.InvocationInfo.MyCommand.Path
Set-Location " \frontend\

Write-Host \[1/3] Building Web Application...\ -ForegroundColor Cyan
npm run build

Write-Host \[2/3] Syncing Web Assets with Android Platform...\ -ForegroundColor Cyan
npx cap sync android

Write-Host \[3/3] Building Android APK via Gradle...\ -ForegroundColor Cyan
Set-Location \\frontend\android\
if (Test-Path \.\gradlew.bat\) {
 .\gradlew.bat assembleDebug
 Write-Host \
[✓] APK generated successfully at:\ -ForegroundColor Green
 Write-Host \frontend\android\app\build\outputs\apk\debug\app-debug.apk\ -ForegroundColor Yellow
} else {
 Write-Host \Gradle wrapper not found. Please open frontend/android in Android Studio.\ -ForegroundColor Red
}

Set-Location 
