// Nano Banana AI - 智能选区尺寸调整
// 自动调整选区到指定倍数，避免AI模型尺寸限制

/**
 * 调整选区到指定倍数
 * AI模型通常要求尺寸是64、32或16的倍数
 * @param {number} multiple 倍数（通常是64）
 * @returns {string} 调整结果JSON
 */
function adjustSelectionToMultiple(multiple) {
    try {
        if (!app.activeDocument) {
            return "ERROR: No active document";
        }
        
        var doc = app.activeDocument;
        
        // 检查是否有选区
        try {
            var bounds = doc.selection.bounds;
            if (!bounds || bounds[0] === bounds[2] || bounds[1] === bounds[3]) {
                return "ERROR: No selection";
            }
        } catch (e) {
            return "ERROR: No selection";
        }
        
        // 确保multiple是有效值
        if (!multiple || multiple <= 0) {
            multiple = 64; // 默认64
        }
        
        // 计算当前选区尺寸
        var bounds = doc.selection.bounds;
        var originalWidth = parseFloat(bounds[2]) - parseFloat(bounds[0]);
        var originalHeight = parseFloat(bounds[3]) - parseFloat(bounds[1]);
        
        // 向上取整到倍数
        var newWidth = Math.ceil(originalWidth / multiple) * multiple;
        var newHeight = Math.ceil(originalHeight / multiple) * multiple;
        
        // 如果尺寸已经符合要求，直接返回
        if (newWidth === originalWidth && newHeight === originalHeight) {
            return JSON.stringify({
                success: true,
                adjusted: false,
                width: originalWidth,
                height: originalHeight,
                message: "Selection size already valid (multiple of " + multiple + ")"
            });
        }
        
        // 计算需要扩展的像素数
        var expandWidth = newWidth - originalWidth;
        var expandHeight = newHeight - originalHeight;
        
        // 保存原始选区（用于后续恢复）
        var originalBounds = {
            left: parseFloat(bounds[0]),
            top: parseFloat(bounds[1]),
            right: parseFloat(bounds[2]),
            bottom: parseFloat(bounds[3])
        };
        
        // 计算新的选区边界（居中扩展）
        var halfExpandWidth = expandWidth / 2;
        var halfExpandHeight = expandHeight / 2;
        
        var newLeft = originalBounds.left - halfExpandWidth;
        var newTop = originalBounds.top - halfExpandHeight;
        var newRight = originalBounds.right + halfExpandWidth;
        var newBottom = originalBounds.bottom + halfExpandHeight;
        
        // 确保不超出文档边界
        if (newLeft < 0) newLeft = 0;
        if (newTop < 0) newTop = 0;
        if (newRight > doc.width) newRight = doc.width;
        if (newBottom > doc.height) newBottom = doc.height;
        
        // 创建新选区
        var selectionArray = [[newLeft, newTop], [newRight, newTop], 
                              [newRight, newBottom], [newLeft, newBottom]];
        doc.selection.select(selectionArray);
        
        // 验证新选区尺寸
        var newBounds = doc.selection.bounds;
        var finalWidth = parseFloat(newBounds[2]) - parseFloat(newBounds[0]);
        var finalHeight = parseFloat(newBounds[3]) - parseFloat(newBounds[1]);
        
        return JSON.stringify({
            success: true,
            adjusted: true,
            originalWidth: originalWidth,
            originalHeight: originalHeight,
            newWidth: finalWidth,
            newHeight: finalHeight,
            expandedWidth: expandWidth,
            expandedHeight: expandHeight,
            multiple: multiple,
            message: "Selection adjusted from " + originalWidth + "x" + originalHeight + 
                     " to " + finalWidth + "x" + finalHeight
        });
        
    } catch (error) {
        return "ERROR: " + error.message;
    }
}

/**
 * 检查选区尺寸是否符合倍数要求
 * @param {number} multiple 倍数
 * @returns {string} 检查结果JSON
 */
function checkSelectionSize(multiple) {
    try {
        if (!app.activeDocument) {
            return "ERROR: No active document";
        }
        
        var doc = app.activeDocument;
        
        // 检查是否有选区
        try {
            var bounds = doc.selection.bounds;
            if (!bounds || bounds[0] === bounds[2] || bounds[1] === bounds[3]) {
                return "ERROR: No selection";
            }
        } catch (e) {
            return "ERROR: No selection";
        }
        
        if (!multiple || multiple <= 0) {
            multiple = 64;
        }
        
        var bounds = doc.selection.bounds;
        var width = parseFloat(bounds[2]) - parseFloat(bounds[0]);
        var height = parseFloat(bounds[3]) - parseFloat(bounds[1]);
        
        var widthValid = (width % multiple) === 0;
        var heightValid = (height % multiple) === 0;
        var isValid = widthValid && heightValid;
        
        return JSON.stringify({
            success: true,
            width: width,
            height: height,
            multiple: multiple,
            widthValid: widthValid,
            heightValid: heightValid,
            isValid: isValid,
            needsAdjustment: !isValid
        });
        
    } catch (error) {
        return "ERROR: " + error.message;
    }
}
