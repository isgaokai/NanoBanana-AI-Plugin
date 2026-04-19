// Nano Banana AI - Icon Generator (Node.js version)
const fs = require('fs');
const { createCanvas } = require('canvas');

function drawLightIcon() {
    const canvas = createCanvas(512, 512);
    const ctx = canvas.getContext('2d');
    const size = 512;
    
    // 清空画布
    ctx.clearRect(0, 0, size, size);
    
    // 渐变背景
    const bgGradient = ctx.createLinearGradient(0, 0, size, size);
    bgGradient.addColorStop(0, '#6366f1');
    bgGradient.addColorStop(0.5, '#8b5cf6');
    bgGradient.addColorStop(1, '#a855f7');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, size, size);
    
    // 添加光泽效果
    const gloss = ctx.createRadialGradient(size * 0.3, size * 0.3, 0, size * 0.3, size * 0.3, size * 0.8);
    gloss.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
    gloss.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = gloss;
    ctx.fillRect(0, 0, size, size);
    
    // 绘制香蕉主体
    ctx.save();
    ctx.translate(size / 2, size / 2);
    
    // 香蕉外形
    ctx.beginPath();
    ctx.moveTo(-80, -120);
    ctx.bezierCurveTo(-100, -80, -110, 0, -100, 80);
    ctx.bezierCurveTo(-95, 120, -60, 140, -20, 130);
    ctx.bezierCurveTo(20, 125, 50, 100, 60, 60);
    ctx.bezierCurveTo(70, 20, 70, -40, 50, -80);
    ctx.bezierCurveTo(30, -110, 0, -125, -40, -120);
    ctx.closePath();
    
    // 香蕉填充渐变
    const bananaGradient = ctx.createLinearGradient(-100, -120, 60, 130);
    bananaGradient.addColorStop(0, '#fff4d4');
    bananaGradient.addColorStop(0.5, '#ffe66d');
    bananaGradient.addColorStop(1, '#ffd93d');
    ctx.fillStyle = bananaGradient;
    ctx.fill();
    
    // 香蕉阴影
    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
    ctx.shadowBlur = 20;
    ctx.shadowOffsetX = 5;
    ctx.shadowOffsetY = 5;
    ctx.fill();
    ctx.shadowColor = 'transparent';
    
    // 香蕉轮廓
    ctx.strokeStyle = '#e5b800';
    ctx.lineWidth = 4;
    ctx.stroke();
    
    // 香蕉纹理线条
    ctx.strokeStyle = 'rgba(229, 184, 0, 0.3)';
    ctx.lineWidth = 2;
    for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        ctx.moveTo(-70 + i * 20, -100);
        ctx.bezierCurveTo(-90 + i * 20, -60, -100 + i * 20, 20, -80 + i * 20, 100);
        ctx.stroke();
    }
    
    // AI 火花效果
    const sparkles = [
        { x: -120, y: -80, size: 20 },
        { x: 80, y: -60, size: 25 },
        { x: -90, y: 100, size: 18 },
        { x: 70, y: 80, size: 22 }
    ];
    
    sparkles.forEach(spark => {
        drawSparkle(ctx, spark.x, spark.y, spark.size, '#ffffff');
    });
    
    ctx.restore();
    
    // 添加 "AI" 文字
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 80px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 10;
    ctx.fillText('AI', size / 2, size / 2 + 10);
    ctx.shadowColor = 'transparent';
    
    return canvas;
}

function drawDarkIcon() {
    const canvas = createCanvas(512, 512);
    const ctx = canvas.getContext('2d');
    const size = 512;
    
    // 清空画布
    ctx.clearRect(0, 0, size, size);
    
    // 深色渐变背景
    const bgGradient = ctx.createLinearGradient(0, 0, size, size);
    bgGradient.addColorStop(0, '#1a1a2e');
    bgGradient.addColorStop(0.5, '#16213e');
    bgGradient.addColorStop(1, '#0f3460');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, size, size);
    
    // 添加光泽效果
    const gloss = ctx.createRadialGradient(size * 0.3, size * 0.3, 0, size * 0.3, size * 0.3, size * 0.8);
    gloss.addColorStop(0, 'rgba(99, 102, 241, 0.2)');
    gloss.addColorStop(1, 'rgba(99, 102, 241, 0)');
    ctx.fillStyle = gloss;
    ctx.fillRect(0, 0, size, size);
    
    // 绘制香蕉主体
    ctx.save();
    ctx.translate(size / 2, size / 2);
    
    // 香蕉外形（霓虹发光效果）
    ctx.beginPath();
    ctx.moveTo(-80, -120);
    ctx.bezierCurveTo(-100, -80, -110, 0, -100, 80);
    ctx.bezierCurveTo(-95, 120, -60, 140, -20, 130);
    ctx.bezierCurveTo(20, 125, 50, 100, 60, 60);
    ctx.bezierCurveTo(70, 20, 70, -40, 50, -80);
    ctx.bezierCurveTo(30, -110, 0, -125, -40, -120);
    ctx.closePath();
    
    // 多层发光效果
    for (let i = 0; i < 3; i++) {
        ctx.shadowColor = '#ffd93d';
        ctx.shadowBlur = 30 + i * 10;
        ctx.strokeStyle = `rgba(255, 217, 61, ${0.8 - i * 0.2})`;
        ctx.lineWidth = 8 - i * 2;
        ctx.stroke();
    }
    
    // 香蕉填充渐变
    const bananaGradient = ctx.createLinearGradient(-100, -120, 60, 130);
    bananaGradient.addColorStop(0, '#ffe66d');
    bananaGradient.addColorStop(0.5, '#ffd93d');
    bananaGradient.addColorStop(1, '#ffb700');
    ctx.fillStyle = bananaGradient;
    ctx.shadowColor = 'transparent';
    ctx.fill();
    
    // 内部高光
    const highlight = ctx.createLinearGradient(-60, -100, -20, -40);
    highlight.addColorStop(0, 'rgba(255, 255, 255, 0.6)');
    highlight.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = highlight;
    ctx.fill();
    
    // AI 火花效果（更明亮）
    const sparkles = [
        { x: -120, y: -80, size: 20 },
        { x: 80, y: -60, size: 25 },
        { x: -90, y: 100, size: 18 },
        { x: 70, y: 80, size: 22 }
    ];
    
    sparkles.forEach(spark => {
        drawSparkle(ctx, spark.x, spark.y, spark.size, '#6366f1', true);
    });
    
    ctx.restore();
    
    // 添加 "AI" 文字（霓虹效果）
    ctx.shadowColor = '#6366f1';
    ctx.shadowBlur = 20;
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 80px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('AI', size / 2, size / 2 + 10);
    
    // 重复绘制增强发光
    ctx.shadowBlur = 40;
    ctx.fillText('AI', size / 2, size / 2 + 10);
    ctx.shadowColor = 'transparent';
    
    return canvas;
}

function drawSparkle(ctx, x, y, size, color, glow = false) {
    ctx.save();
    ctx.translate(x, y);
    
    if (glow) {
        ctx.shadowColor = color;
        ctx.shadowBlur = 15;
    }
    
    ctx.fillStyle = color;
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    
    // 绘制四芒星
    ctx.beginPath();
    for (let i = 0; i < 4; i++) {
        const angle = (Math.PI / 2) * i;
        const x1 = Math.cos(angle) * size;
        const y1 = Math.sin(angle) * size;
        const x2 = Math.cos(angle + Math.PI / 4) * (size * 0.3);
        const y2 = Math.sin(angle + Math.PI / 4) * (size * 0.3);
        
        if (i === 0) {
            ctx.moveTo(x1, y1);
        } else {
            ctx.lineTo(x1, y1);
        }
        ctx.lineTo(x2, y2);
    }
    ctx.closePath();
    ctx.fill();
    
    // 中心圆点
    ctx.beginPath();
    ctx.arc(0, 0, size * 0.2, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
}

// 生成图标
console.log('Generating icons...');

try {
    const lightIcon = drawLightIcon();
    const darkIcon = drawDarkIcon();
    
    const lightBuffer = lightIcon.toBuffer('image/png');
    const darkBuffer = darkIcon.toBuffer('image/png');
    
    fs.writeFileSync(__dirname + '/icon.png', lightBuffer);
    fs.writeFileSync(__dirname + '/icon-dark.png', darkBuffer);
    
    console.log('✅ Icons generated successfully!');
    console.log('   - icon.png (512x512)');
    console.log('   - icon-dark.png (512x512)');
} catch (error) {
    console.error('❌ Error generating icons:', error.message);
    console.log('\n💡 To use this script, install canvas package:');
    console.log('   npm install canvas');
}
