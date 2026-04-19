# CEP 缓存清理脚本（快速版）
# 适用于插件更新后刷新

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  CEP 缓存清理工具" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 检查 Photoshop 是否运行
$psProcess = Get-Process -Name "Photoshop" -ErrorAction SilentlyContinue
if ($psProcess) {
    Write-Host "⚠️  请先关闭 Photoshop！" -ForegroundColor Red
    Write-Host ""
    Write-Host "检测到 Photoshop 正在运行（PID: $($psProcess.Id)）" -ForegroundColor Yellow
    Write-Host "请关闭 Photoshop 后再运行此脚本" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "按任意键退出..." -ForegroundColor Gray
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    exit
}

Write-Host "✓ Photoshop 未运行，开始清理缓存..." -ForegroundColor Green
Write-Host ""

# 清理 CEP 缓存
$cachePaths = @(
    "$env:APPDATA\Adobe\CEP\extensions\.cloud",
    "$env:LOCALAPPDATA\Temp\cep_cache",
    "$env:LOCALAPPDATA\Temp\Adobe\CEP"
)

$cleanedCount = 0

foreach ($path in $cachePaths) {
    if (Test-Path $path) {
        try {
            Remove-Item -Path $path -Recurse -Force -ErrorAction Stop
            Write-Host "✓ 已清理: $path" -ForegroundColor Green
            $cleanedCount++
        } catch {
            Write-Host "⚠️  无法清理: $path" -ForegroundColor Yellow
        }
    } else {
        Write-Host "○ 不存在: $path" -ForegroundColor Gray
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan

if ($cleanedCount -gt 0) {
    Write-Host "✓ 缓存清理完成！（清理了 $cleanedCount 个位置）" -ForegroundColor Green
} else {
    Write-Host "○ 未找到需要清理的缓存" -ForegroundColor Gray
}

Write-Host ""
Write-Host "下一步：" -ForegroundColor Yellow
Write-Host "1. 启动 Photoshop" -ForegroundColor White
Write-Host "2. 打开 窗口 -> 扩展 -> Nano Banana AI" -ForegroundColor White
Write-Host "3. 如果插件仍未出现，按 Ctrl+R 刷新插件面板" -ForegroundColor White
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "按任意键退出..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
