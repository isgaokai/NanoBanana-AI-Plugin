# Clear CEP Cache Script
# This script clears the CEP cache to force Photoshop to reload the extension icons

Write-Host "================================" -ForegroundColor Cyan
Write-Host "  Clear CEP Cache" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# CEP cache locations
$cepCachePaths = @(
    "$env:APPDATA\Adobe\CEP\extensions\.localStore",
    "$env:APPDATA\Adobe\CEP\cache",
    "$env:LOCALAPPDATA\Temp\cep_cache",
    "$env:LOCALAPPDATA\Adobe\CEP\cache"
)

$cleared = 0

foreach ($path in $cepCachePaths) {
    if (Test-Path $path) {
        Write-Host "Clearing: $path" -ForegroundColor Yellow
        try {
            Remove-Item -Path $path -Recurse -Force -ErrorAction SilentlyContinue
            $cleared++
            Write-Host "  ✓ Cleared" -ForegroundColor Green
        } catch {
            Write-Host "  ✗ Failed: $($_.Exception.Message)" -ForegroundColor Red
        }
    } else {
        Write-Host "Not found: $path" -ForegroundColor Gray
    }
}

Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "  Cache Clearing Complete!" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Cleared $cleared cache location(s)" -ForegroundColor Green
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. Close Photoshop completely"
Write-Host "2. Restart Photoshop"
Write-Host "3. The new icon should now appear"
Write-Host ""
