# TransportPro ERP - GitHub Auto-Sync Script
# Automatically stages, commits, and pushes any code updates
param (
    [string] = 'Update TransportPro ERP'
)

 = Split-Path -Parent System.Management.Automation.InvocationInfo.MyCommand.Path
Set-Location 

 = git status --porcelain
if () {
    Write-Host '[+] Changes detected. Staging & pushing to GitHub...' -ForegroundColor Cyan
    git add .
    git commit -m "  - 2026-10-09 19:14:02 \
 git push origin main
 Write-Host '[✓] Successfully synced to https://github.com/yadavchintu0012-lang/Transport_Erp' -ForegroundColor Green
} else {
 Write-Host '[✓] Repository up to date.' -ForegroundColor Green
}
