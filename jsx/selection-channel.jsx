// Nano Banana AI - 通道选区存储系统
// 基于釉光AI的选区管理方案，更可靠和精确

// 固定通道名称
var NANOBANA_SELECTION_CHANNEL = "NanoBanana_Selection";

/**
 * 保存选区到通道
 * 通道存储比localStorage更可靠，持久化到PSD文件
 * @returns {string} 操作结果
 */
function saveSelectionToChannel() {
    try {
        if (!app.activeDocument) {
            return "ERROR: No active document";
        }
        
        var doc = app.activeDocument;
        
        // 检查是否有有效选区
        try {
            var bounds = doc.selection.bounds;
            if (!bounds || bounds[0] === bounds[2] || bounds[1] === bounds[3]) {
                return "ERROR: No valid selection";
            }
        } catch (e) {
            return "ERROR: No selection";
        }
        
        // 删除旧通道（如果存在）
        try {
            for (var i = 0; i < doc.channels.length; i++) {
                if (doc.channels[i].name === NANOBANA_SELECTION_CHANNEL) {
                    doc.channels[i].remove();
                    break;
                }
            }
        } catch (removeError) {
            // 忽略删除错误
        }
        
        // 创建新通道并保存选区
        var newChannel = doc.channels.add();
        newChannel.name = NANOBANA_SELECTION_CHANNEL;
        
        // 将当前选区存储到通道
        doc.selection.store(newChannel);
        
        // 获取选区边界信息
        var selBounds = doc.selection.bounds;
        var result = {
            success: true,
            channelName: NANOBANA_SELECTION_CHANNEL,
            left: parseFloat(selBounds[0]),
            top: parseFloat(selBounds[1]),
            right: parseFloat(selBounds[2]),
            bottom: parseFloat(selBounds[3]),
            width: parseFloat(selBounds[2]) - parseFloat(selBounds[0]),
            height: parseFloat(selBounds[3]) - parseFloat(selBounds[1])
        };
        
        return JSON.stringify(result);
        
    } catch (error) {
        return "ERROR: " + error.message;
    }
}

/**
 * 从通道恢复选区
 * @returns {string} 选区信息JSON或错误信息
 */
function loadSelectionFromChannel() {
    try {
        if (!app.activeDocument) {
            return "ERROR: No active document";
        }
        
        var doc = app.activeDocument;
        
        // 查找选区通道
        var selChannel = null;
        for (var i = 0; i < doc.channels.length; i++) {
            if (doc.channels[i].name === NANOBANA_SELECTION_CHANNEL) {
                selChannel = doc.channels[i];
                break;
            }
        }
        
        if (!selChannel) {
            return "ERROR: Selection channel not found";
        }
        
        // 从通道加载选区
        doc.selection.load(selChannel);
        
        // 重要：切换回RGB复合通道
        // 避免后续操作在Alpha通道上进行
        doc.activeChannels = [doc.channels[0], doc.channels[1], doc.channels[2]];
        
        // 获取恢复后的选区边界
        var bounds = doc.selection.bounds;
        var result = {
            success: true,
            left: parseFloat(bounds[0]),
            top: parseFloat(bounds[1]),
            right: parseFloat(bounds[2]),
            bottom: parseFloat(bounds[3]),
            width: parseFloat(bounds[2]) - parseFloat(bounds[0]),
            height: parseFloat(bounds[3]) - parseFloat(bounds[1])
        };
        
        return JSON.stringify(result);
        
    } catch (error) {
        return "ERROR: " + error.message;
    }
}

/**
 * 清理临时选区通道
 * 操作完成后调用，保持文档整洁
 * @returns {string} 操作结果
 */
function cleanupSelectionChannel() {
    try {
        if (!app.activeDocument) {
            return "SUCCESS"; // 没有文档也算成功
        }
        
        var doc = app.activeDocument;
        
        // 查找并删除选区通道
        for (var i = 0; i < doc.channels.length; i++) {
            if (doc.channels[i].name === NANOBANA_SELECTION_CHANNEL) {
                doc.channels[i].remove();
                return "SUCCESS";
            }
        }
        
        return "SUCCESS"; // 通道不存在也算成功
        
    } catch (error) {
        // 清理失败不影响主流程
        return "SUCCESS";
    }
}

/**
 * 检查是否存在选区通道
 * @returns {string} "true" 或 "false"
 */
function hasSelectionChannel() {
    try {
        if (!app.activeDocument) {
            return "false";
        }
        
        var doc = app.activeDocument;
        
        for (var i = 0; i < doc.channels.length; i++) {
            if (doc.channels[i].name === NANOBANA_SELECTION_CHANNEL) {
                return "true";
            }
        }
        
        return "false";
        
    } catch (error) {
        return "false";
    }
}
