# Clear CEP Cache and Reload Plugin

Write-Host "================================" -ForegroundColor Cyan
Write-Host "  CEP Cache Cleaner" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Close Photoshop if running
Write-Host "Checking for Photoshop processes..." -ForegroundColor Yellow
$psProcesses = Get-Process -Name "Photoshop" -ErrorAction SilentlyContinue
if ($psProcesses) {
    Write-Host "Found Photoshop running. Please close Photoshop manually and press Enter to continue..." -ForegroundColor Yellow
    Read-Host
} else {
    Write-Host "Photoshop is not running." -ForegroundColor Green
}

# Clear CEP cache
Write-Host ""
Write-Host "Clearing CEP cache..." -ForegroundColor Yellow

$cachePaths = @(
    "$env:APPDATA\Adobe\CEP\extensions\NanoBananaAI\.debug",
    "$env:LOCALAPPDATA\Temp\cep_cache",
    "$env:LOCALAPPDATA\Temp\Adobe\CEPServiceManager*"
)

foreach ($path in $cachePaths) {
    if (Test-Path $path) {
        Remove-Item -Path $path -Recurse -Force -ErrorAction SilentlyContinue
        Write-Host "  Cleared: $path" -ForegroundColor Green
    }
}

# Reinstall plugin
Write-Host ""
Write-Host "Reinstalling plugin..." -ForegroundColor Yellow
& "$PSScriptRoot\install.ps1"

Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "  Cache Cleared!" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. Start Photoshop" -ForegroundColor White
Write-Host "2. Window -> Extensions -> Nano Banana AI" -ForegroundColor White
Write-Host "3. If UI still looks wrong, press Ctrl+R to reload the extension" -ForegroundColor White
Write-Host ""
