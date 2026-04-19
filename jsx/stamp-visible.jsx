// Nano Banana AI - 向上盖印可见图层
// 基于釉光AI的盖印方案，保留原图层

/**
 * 向上盖印可见图层（仅选区内）
 * 相当于"复制合并"（Ctrl+Shift+C）+ "粘贴"（Ctrl+V）
 * 优势：保留原图层，方便后续调整和对比
 * @returns {string} 操作结果
 */
function stampVisibleLayersUpward() {
    try {
        if (!app.activeDocument) {
            return "ERROR: No active document";
        }
        
        var doc = app.activeDocument;
        var debugInfo = "STAMP: Starting stamp visible layers upward";
        
        // 检查是否有选区
        try {
            var bounds = doc.selection.bounds;
            if (!bounds || bounds[0] === bounds[2] || bounds[1] === bounds[3]) {
                debugInfo += "\nSTAMP: No selection found";
                return "ERROR: No selection - stamp requires a selection";
            }
        } catch (e) {
            debugInfo += "\nSTAMP: No selection - " + e.message;
            return "ERROR: No selection";
        }
        
        debugInfo += "\nSTAMP: Valid selection detected";
        
        // 记录操作前的图层数量
        var layerCountBefore = doc.layers.length;
        debugInfo += "\nSTAMP: Layer count before: " + layerCountBefore;
        
        try {
            // 步骤1: 复制选区的合成内容（copyMerged）
            // copy(true) 相当于 "复制合并"，会复制所有可见图层的合成结果
            debugInfo += "\nSTAMP: Copying merged content...";
            doc.selection.copy(true);
            debugInfo += "\nSTAMP: Copy merged completed";
            
            // 步骤2: 粘贴为新图层
            debugInfo += "\nSTAMP: Pasting as new layer...";
            doc.paste();
            debugInfo += "\nSTAMP: Paste completed";
            
            // 步骤3: 验证是否成功创建了新图层
            var layerCountAfter = doc.layers.length;
            debugInfo += "\nSTAMP: Layer count after: " + layerCountAfter;
            
            if (layerCountAfter > layerCountBefore) {
                var newLayer = doc.activeLayer;
                
                // 生成带时间戳的图层名称
                var now = new Date();
                var timestamp = now.toLocaleString('zh-CN', {
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    hour12: false
                }).replace(/\//g, '-');
                
                var newLayerName = "盖印图层 " + timestamp;
                newLayer.name = newLayerName;
                
                debugInfo += "\nSTAMP: New layer created - " + newLayerName;
                debugInfo += "\nSTAMP: Original layers preserved";
                
                var result = {
                    success: true,
                    layerName: newLayerName,
                    layerCountBefore: layerCountBefore,
                    layerCountAfter: layerCountAfter,
                    message: "Stamped visible layers successfully"
                };
                
                return JSON.stringify(result);
            } else {
                throw new Error("Failed to create new layer - layer count did not increase");
            }
            
        } catch (copyError) {
            debugInfo += "\nSTAMP: CopyMerged method failed - " + copyError.message;
            
            // 备用方法: 简单复制粘贴（只复制当前活动图层）
            debugInfo += "\nSTAMP: Trying fallback method...";
            
            try {
                doc.selection.copy();
                doc.paste();
                
                var fallbackLayer = doc.activeLayer;
                var fallbackName = "盖印图层(单层) " + new Date().toLocaleTimeString();
                fallbackLayer.name = fallbackName;
                
                debugInfo += "\nSTAMP: Fallback method succeeded - " + fallbackName;
                debugInfo += "\nSTAMP: Note: Only copied active layer (not merged)";
                
                var result = {
                    success: true,
                    layerName: fallbackName,
                    fallback: true,
                    message: "Stamped active layer (fallback method)"
                };
                
                return JSON.stringify(result);
                
            } catch (fallbackError) {
                debugInfo += "\nSTAMP: Fallback method also failed - " + fallbackError.message;
                return "ERROR: All stamp methods failed - " + fallbackError.message;
            }
        }
        
    } catch (error) {
        var errorInfo = "ERROR: Stamp failed - " + error.message;
        if (error.line) {
            errorInfo += " (line: " + error.line + ")";
        }
        return errorInfo;
    }
}

/**
 * 向上盖印并合并到指定图层
 * 适用于需要将盖印结果直接应用到特定图层的场景
 * @param {string} targetLayerName 目标图层名称
 * @returns {string} 操作结果
 */
function stampAndMergeToLayer(targetLayerName) {
    try {
        if (!app.activeDocument) {
            return "ERROR: No active document";
        }
        
        var doc = app.activeDocument;
        
        // 先执行向上盖印
        var stampResult = stampVisibleLayersUpward();
        
        // 检查盖印是否成功
        if (stampResult.indexOf("ERROR") === 0) {
            return stampResult;
        }
        
        var resultObj = JSON.parse(stampResult);
        var stampedLayerName = resultObj.layerName;
        
        // 查找目标图层
        var targetLayer = null;
        for (var i = 0; i < doc.layers.length; i++) {
            if (doc.layers[i].name === targetLayerName) {
                targetLayer = doc.layers[i];
                break;
            }
        }
        
        if (!targetLayer) {
            return "ERROR: Target layer '" + targetLayerName + "' not found";
        }
        
        // 将盖印图层移到目标图层上方
        var stampedLayer = doc.activeLayer;
        stampedLayer.move(targetLayer, ElementPlacement.PLACEBEFORE);
        
        // 合并向下
        doc.activeLayer = stampedLayer;
        stampedLayer.merge();
        
        return JSON.stringify({
            success: true,
            message: "Stamped and merged to layer: " + targetLayerName
        });
        
    } catch (error) {
        return "ERROR: Stamp and merge failed - " + error.message;
    }
}
