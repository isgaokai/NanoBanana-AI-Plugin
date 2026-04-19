# Nano Banana AI - Installer
$ErrorActionPreference = "Stop"

Write-Host "================================" -ForegroundColor Cyan
Write-Host "  Nano Banana AI Installer" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

$sourceDir = $PSScriptRoot
$targetDir = "$env:APPDATA\Adobe\CEP\extensions\NanoBananaAI"

Write-Host "Source: $sourceDir" -ForegroundColor Gray
Write-Host "Target: $targetDir" -ForegroundColor Gray
Write-Host ""

# Remove existing installation
if (Test-Path $targetDir) {
    Write-Host "Removing existing installation..." -ForegroundColor Yellow
    Remove-Item -Path $targetDir -Recurse -Force
}

# Create target directory
Write-Host "Creating directories..." -ForegroundColor Green
New-Item -ItemType Directory -Path $targetDir -Force | Out-Null

# Copy files
Write-Host "Copying files..." -ForegroundColor Green
Copy-Item -Path "$sourceDir\*" -Destination $targetDir -Recurse -Force -Exclude "install.ps1","README.md"

Write-Host ""
Write-Host "================================" -ForegroundColor Green
Write-Host "  Installation Complete!" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. Enable debug mode (run this command):" -ForegroundColor White
Write-Host '   reg add "HKEY_CURRENT_USER\Software\Adobe\CSXS.7" /v PlayerDebugMode /t REG_SZ /d 1 /f' -ForegroundColor Cyan
Write-Host ""
Write-Host "2. Restart Photoshop" -ForegroundColor White
Write-Host ""
Write-Host "3. Open: Window -> Extensions -> Nano Banana AI" -ForegroundColor White
Write-Host ""
