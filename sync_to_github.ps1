# TransportPro ERP - Automatic GitHub Sync Tool
# Runs automatically or can be invoked on changes
param (
    [string] = " Auto-update TransportPro ERP\
)

 = Split-Path -Parent System.Management.Automation.InvocationInfo.MyCommand.Path
Set-Location 

 = git status --porcelain
if () {
 Write-Host \[+] Detected updates. Staging and committing...\ -ForegroundColor Cyan
 git add .
 git commit -m " - 2026-10-09 19:09:26 \
    Write-Host \[+] Pushing to https://github.com/yadavchintu0012-lang/Transport_Erp.git...\ -ForegroundColor Green
    git push origin main
} else {
    Write-Host \[✓] Working directory clean. Syncing with remote...\ -ForegroundColor Green
    git push origin main
}
