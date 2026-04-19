# Nano Banana AI Plugin - 重新安装脚本
# 使用方法: 右键 -> 使用 PowerShell 运行

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Nano Banana AI Plugin - 重新安装" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 定义路径
$sourcePath = Split-Path -Parent $MyInvocation.MyCommand.Path
$targetPath = "$env:APPDATA\Adobe\CEP\extensions\NanoBanana-AI-Plugin"

# Step 1: 删除旧版本
Write-Host "[1/4] 删除旧版本..." -ForegroundColor Yellow
if (Test-Path $targetPath) {
    Remove-Item -Path $targetPath -Recurse -Force
    Write-Host "✓ 已删除旧版本" -ForegroundColor Green
} else {
    Write-Host "✓ 未找到旧版本（首次安装）" -ForegroundColor Green
}
Write-Host ""

# Step 2: 创建目标目录
Write-Host "[2/4] 创建目标目录..." -ForegroundColor Yellow
New-Item -ItemType Directory -Path $targetPath -Force | Out-Null
Write-Host "✓ 目录已创建: $targetPath" -ForegroundColor Green
Write-Host ""

# Step 3: 复制插件文件
Write-Host "[3/4] 复制插件文件..." -ForegroundColor Yellow
Copy-Item -Path "$sourcePath\*" -Destination $targetPath -Recurse -Force -Exclude ".git"
Write-Host "✓ 插件文件复制完成" -ForegroundColor Green
Write-Host ""

# Step 4: 启用调试模式
Write-Host "[4/4] 启用 CEP 调试模式..." -ForegroundColor Yellow
$csxsVersions = @("CSXS.7", "CSXS.8", "CSXS.9", "CSXS.10", "CSXS.11")
foreach ($ver in $csxsVersions) {
    $regPath = "HKCU:\Software\Adobe\$ver"
    if (-not (Test-Path $regPath)) {
        New-Item -Path $regPath -Force | Out-Null
    }
    Set-ItemProperty -Path $regPath -Name "PlayerDebugMode" -Value "1" -Type String -Force
}
Write-Host "✓ 调试模式已启用" -ForegroundColor Green
Write-Host ""

# 验证安装
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  验证安装" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$files = @("index.html", "CSXS\manifest.xml", "js\main.js", "jsx\hostscript-clean.jsx", "css\style.css")
$allOk = $true

foreach ($file in $files) {
    $fullPath = Join-Path $targetPath $file
    if (Test-Path $fullPath) {
        $size = (Get-Item $fullPath).Length
        $sizeMB = [math]::Round($size / 1KB, 2)
        Write-Host "✓ $file - $sizeMB KB" -ForegroundColor Green
    } else {
        Write-Host "✗ $file - 缺失!" -ForegroundColor Red
        $allOk = $false
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan

if ($allOk) {
    Write-Host "✓ 插件安装成功！" -ForegroundColor Green
    Write-Host ""
    Write-Host "下一步操作：" -ForegroundColor Yellow
    Write-Host "1. 完全关闭 Photoshop（如果正在运行）" -ForegroundColor White
    Write-Host "2. 重新启动 Photoshop" -ForegroundColor White
    Write-Host "3. 打开 窗口 -> 扩展 -> Nano Banana AI" -ForegroundColor White
    Write-Host ""
    Write-Host "提示：如果插件未出现，请尝试清理 CEP 缓存" -ForegroundColor Cyan
    Write-Host "运行脚本: clear-cache-and-restart.ps1" -ForegroundColor Cyan
} else {
    Write-Host "✗ 安装过程中发现问题，请检查文件" -ForegroundColor Red
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "按任意键退出..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
