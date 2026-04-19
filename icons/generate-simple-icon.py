#!/usr/bin/env python3
"""
Nano Banana AI - Simple Icon Generator
生成简单但专业的PNG图标
"""

from PIL import Image, ImageDraw, ImageFont
import os

def create_simple_icon(filename, bg_colors, is_dark=False):
    """创建简单的图标"""
    size = 512
    img = Image.new('RGB', (size, size), color=bg_colors[0])
    draw = ImageDraw.Draw(img)
    
    # 绘制渐变背景（简化版）
    for y in range(size):
        ratio = y / size
        if ratio < 0.5:
            r = int(bg_colors[0][0] + (bg_colors[1][0] - bg_colors[0][0]) * ratio * 2)
            g = int(bg_colors[0][1] + (bg_colors[1][1] - bg_colors[0][1]) * ratio * 2)
            b = int(bg_colors[0][2] + (bg_colors[1][2] - bg_colors[0][2]) * ratio * 2)
        else:
            r = int(bg_colors[1][0] + (bg_colors[2][0] - bg_colors[1][0]) * (ratio - 0.5) * 2)
            g = int(bg_colors[1][1] + (bg_colors[2][1] - bg_colors[1][1]) * (ratio - 0.5) * 2)
            b = int(bg_colors[1][2] + (bg_colors[2][1] - bg_colors[1][2]) * (ratio - 0.5) * 2)
        draw.line([(0, y), (size, y)], fill=(r, g, b))
    
    # 绘制香蕉形状（简化为椭圆）
    center_x, center_y = size // 2, size // 2
    banana_color = (255, 217, 61) if not is_dark else (255, 230, 109)
    
    # 香蕉主体
    draw.ellipse([center_x - 100, center_y - 150, center_x + 100, center_y + 150], 
                 fill=banana_color, outline=(229, 184, 0), width=4)
    
    # 绘制"NB"或"AI"文字
    try:
        # 尝试使用系统字体
        font = ImageFont.truetype("arial.ttf", 120)
    except:
        font = ImageFont.load_default()
    
    text = "AI"
    
    # 获取文字大小
    bbox = draw.textbbox((0, 0), text, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    
    # 文字位置
    text_x = (size - text_width) // 2
    text_y = (size - text_height) // 2
    
    # 绘制文字阴影
    shadow_offset = 4
    draw.text((text_x + shadow_offset, text_y + shadow_offset), text, 
              fill=(0, 0, 0, 128), font=font)
    
    # 绘制白色文字
    draw.text((text_x, text_y), text, fill=(255, 255, 255), font=font)
    
    # 保存
    script_dir = os.path.dirname(os.path.abspath(__file__))
    filepath = os.path.join(script_dir, filename)
    img.save(filepath, 'PNG')
    print(f"✅ Generated: {filename}")
    
    return img

# 生成亮色主题图标
print("🎨 Generating Nano Banana AI Icons...")
print()

# 亮色主题 - 紫色渐变
light_colors = [
    (99, 102, 241),    # #6366f1
    (139, 92, 246),    # #8b5cf6
    (168, 85, 247)     # #a855f7
]

# 暗色主题 - 深蓝渐变
dark_colors = [
    (26, 26, 46),      # #1a1a2e
    (22, 33, 62),      # #16213e
    (15, 52, 96)       # #0f3460
]

try:
    create_simple_icon('icon.png', light_colors, is_dark=False)
    create_simple_icon('icon-dark.png', dark_colors, is_dark=True)
    print()
    print("🎉 All icons generated successfully!")
    print("📂 Location: icons/")
    print("   - icon.png (512x512)")
    print("   - icon-dark.png (512x512)")
except Exception as e:
    print(f"❌ Error: {e}")
    print()
    print("💡 To use this script, install Pillow:")
    print("   pip install Pillow")
