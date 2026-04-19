# Clear CEP Cache and Restart

Write-Host "================================" -ForegroundColor Cyan
Write-Host "  清除CEP缓存" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Close Photoshop
Write-Host "正在关闭 Photoshop..." -ForegroundColor Yellow
$psProcess = Get-Process -Name "Photoshop" -ErrorAction SilentlyContinue
if ($psProcess) {
    $psProcess | Stop-Process -Force
    Start-Sleep -Seconds 2
    Write-Host "Photoshop 已关闭" -ForegroundColor Green
} else {
    Write-Host "Photoshop 未运行" -ForegroundColor Yellow
}

# Clear CEP cache
Write-Host ""
Write-Host "正在清除缓存..." -ForegroundColor Yellow

$cachePaths = @(
    "$env:LOCALAPPDATA\Temp\cep_cache",
    "$env:LOCALAPPDATA\Temp\Adobe\CEPServiceManager*",
    "$env:APPDATA\Adobe\CEP\extensions\NanoBananaAI\.debug"
)

foreach ($path in $cachePaths) {
    if (Test-Path $path) {
        Remove-Item -Path $path -Recurse -Force -ErrorAction SilentlyContinue
        Write-Host "  已清除: $path" -ForegroundColor Green
    }
}

# Reinstall plugin
Write-Host ""
Write-Host "正在重新安装插件..." -ForegroundColor Yellow
& "$PSScriptRoot\install.ps1"

Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "  完成！" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "请重新启动 Photoshop，然后打开插件：" -ForegroundColor Yellow
Write-Host "Window -> Extensions -> Nano Banana AI" -ForegroundColor White
Write-Host ""
Write-Host "图标应该已经更新了！" -ForegroundColor Green
Write-Host ""
