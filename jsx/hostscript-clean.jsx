// Nano Banana AI - Clean ExtendScript Functions
// This file must be saved as UTF-8 WITHOUT BOM

// ========== Tool Selection Functions ==========
function selectTool(toolName) {
    try {
        var toolID;
        if (toolName === "rectangularMarquee") toolID = stringIDToTypeID("marqueeRectTool");
        else if (toolName === "ellipticalMarquee") toolID = stringIDToTypeID("marqueeEllipTool");
        else if (toolName === "lasso") toolID = stringIDToTypeID("lassoTool");
        else if (toolName === "polygonalLasso") toolID = stringIDToTypeID("polySelTool");
        else if (toolName === "quickSelection") toolID = stringIDToTypeID("quickSelectTool");
        else if (toolName === "magicWand") toolID = stringIDToTypeID("magicWandTool");
        else if (toolName === "brush") toolID = stringIDToTypeID("paintbrushTool");
        else if (toolName === "eraser") toolID = stringIDToTypeID("eraserTool");
        else if (toolName === "move") toolID = stringIDToTypeID("moveTool");
        else if (toolName === "hand") toolID = stringIDToTypeID("handTool");
        else if (toolName === "zoom" || toolName === "zoomIn" || toolName === "zoomOut") toolID = stringIDToTypeID("zoomTool");
        else if (toolName === "pen") toolID = stringIDToTypeID("penTool");
        else return '{"error":"Unknown tool: ' + toolName + '"}';
        
        var desc = new ActionDescriptor();
        var ref = new ActionReference();
        ref.putClass(toolID);
        desc.putReference(charIDToTypeID("null"), ref);
        executeAction(charIDToTypeID("slct"), desc, DialogModes.NO);
        
        return '{"success":true}';
    } catch (e) {
        return '{"error":"' + String(e).replace(/"/g, '') + '"}';
    }
}

// ========== Selection Functions ==========
function deselectAll() {
    try {
        app.activeDocument.selection.deselect();
        return '{"success":true}';
    } catch (e) {
        return '{"error":"' + String(e).replace(/"/g, '') + '"}';
    }
}

// ========== Color Functions ==========
function resetColors() {
    try {
        var fgColor = new SolidColor();
        fgColor.rgb.hexValue = "000000";
        app.foregroundColor = fgColor;
        
        var bgColor = new SolidColor();
        bgColor.rgb.hexValue = "FFFFFF";
        app.backgroundColor = bgColor;
        
        return '{"success":true}';
    } catch (e) {
        return '{"error":"' + String(e).replace(/"/g, '') + '"}';
    }
}

// ========== Document Info Functions ==========
function getDocumentInfo() {
    try {
        if (!app.documents.length) {
            return '{"error":"No document open"}';
        }
        
        var doc = app.activeDocument;
        var hasSelection = false;
        var bounds = null;
        
        try {
            bounds = doc.selection.bounds;
            var w = parseFloat(bounds[2]) - parseFloat(bounds[0]);
            var h = parseFloat(bounds[3]) - parseFloat(bounds[1]);
            hasSelection = (w > 0 && h > 0);
        } catch (e) {
            hasSelection = false;
        }
        
        var docWidth = Math.round(parseFloat(doc.width.as("px")));
        var docHeight = Math.round(parseFloat(doc.height.as("px")));
        
        var result = '{"width":' + docWidth + ',"height":' + docHeight + ',"hasSelection":' + hasSelection;
        
        if (hasSelection && bounds) {
            var selX = Math.round(parseFloat(bounds[0].as("px")));
            var selY = Math.round(parseFloat(bounds[1].as("px")));
            var selWidth = Math.round(parseFloat(bounds[2].as("px")) - parseFloat(bounds[0].as("px")));
            var selHeight = Math.round(parseFloat(bounds[3].as("px")) - parseFloat(bounds[1].as("px")));
            
            result += ',"selectionBounds":{"x":' + selX + ',"y":' + selY + ',"width":' + selWidth + ',"height":' + selHeight + '}';
        }
        
        result += '}';
        return result;
    } catch (e) {
        return '{"error":"' + String(e).replace(/"/g, '') + '"}';
    }
}

// ========== Export Functions ==========
var TEMP_LAYER_NAME = "_NanoBanana_TempMerged_";

function createTempFile(prefix, extension) {
    try {
        var tempDir = Folder.temp + "/nanobanana_temp/";
        var folder = new Folder(tempDir);
        
        if (!folder.exists) {
            folder.create();
        }
        
        var timestamp = new Date().getTime();
        var random = Math.floor(Math.random() * 10000);
        var filename = prefix + timestamp + "_" + random + extension;
        var filePath = tempDir + filename;
        
        return new File(filePath);
    } catch (e) {
        return null;
    }
}

function exportImageToFile(mode) {
    var originalDialogs = app.displayDialogs;
    app.displayDialogs = DialogModes.NO;
    
    try {
        if (!app.documents.length) {
            app.displayDialogs = originalDialogs;
            return '{"error":"No document open"}';
        }
        
        var doc = app.activeDocument;
        var hasSelection = false;
        var bounds = null;
        var activeLayerIndex = -1;
        var activeLayerName = "";
        
        try {
            bounds = doc.selection.bounds;
            hasSelection = (bounds[0] !== bounds[2] && bounds[1] !== bounds[3]);
        } catch (e) {
            hasSelection = false;
        }
        
        // 🆕 保存当前图层信息
        try {
            activeLayerIndex = doc.activeLayer.itemIndex;
            activeLayerName = doc.activeLayer.name;
        } catch (e) {
            activeLayerIndex = -1;
        }
        
        var tempFile = createTempFile("nanoBanana_" + mode + "_", ".jpg");
        if (!tempFile) {
            app.displayDialogs = originalDialogs;
            return '{"error":"Could not create temp file"}';
        }
        
        var dupDoc = null;
        var originalState = doc.activeHistoryState;
        
        try {
            dupDoc = doc.duplicate();
            
            if (hasSelection && mode === "selection") {
                dupDoc.crop(bounds);
            }
            
            dupDoc.flatten();
            
            var jpegOptions = new JPEGSaveOptions();
            jpegOptions.quality = 10;
            jpegOptions.embedColorProfile = true;
            jpegOptions.formatOptions = FormatOptions.STANDARDBASELINE;
            jpegOptions.matte = MatteType.NONE;
            
            dupDoc.saveAs(tempFile, jpegOptions, true, Extension.LOWERCASE);
            
            var exportWidth = Math.round(parseFloat(dupDoc.width.as("px")));
            var exportHeight = Math.round(parseFloat(dupDoc.height.as("px")));
            
            dupDoc.close(SaveOptions.DONOTSAVECHANGES);
            dupDoc = null;
            
            doc.activeHistoryState = originalState;
            
            var resultPath = tempFile.fsName.replace(/\\/g, '/');
            app.displayDialogs = originalDialogs;
            
            // 🆕 返回图层位置信息（手动构建 JSON 字符串，因为 ExtendScript 没有 JSON 对象）
            var resultJSON = '{"success":true,' +
                '"filePath":"' + resultPath.replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '",' +
                '"width":' + exportWidth + ',' +
                '"height":' + exportHeight + ',' +
                '"layerIndex":' + activeLayerIndex + ',' +
                '"layerName":"' + String(activeLayerName).replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '",' +
                '"hasSelection":' + hasSelection;
            
            if (hasSelection && bounds) {
                var boundsLeft = Math.round(parseFloat(bounds[0].as("px")));
                var boundsTop = Math.round(parseFloat(bounds[1].as("px")));
                var boundsRight = Math.round(parseFloat(bounds[2].as("px")));
                var boundsBottom = Math.round(parseFloat(bounds[3].as("px")));
                
                resultJSON += ',"selectionBounds":{' +
                    '"left":' + boundsLeft + ',' +
                    '"top":' + boundsTop + ',' +
                    '"right":' + boundsRight + ',' +
                    '"bottom":' + boundsBottom +
                '}';
            }
            
            resultJSON += '}';
            
            return resultJSON;
            
        } catch (exportError) {
            if (dupDoc) {
                try { dupDoc.close(SaveOptions.DONOTSAVECHANGES); } catch (e) {}
            }
            doc.activeHistoryState = originalState;
            app.displayDialogs = originalDialogs;
            throw exportError;
        }
        
    } catch (e) {
        app.displayDialogs = originalDialogs;
        return '{"error":"' + String(e).replace(/"/g, '') + '"}';
    }
}

// ========== Import Image Function ==========
// 支持可选的大小和位置参数
function importImageFromURL(localFilePath, targetWidth, targetHeight, targetX, targetY) {
    var originalDialogs = app.displayDialogs;
    app.displayDialogs = DialogModes.NO;
    
    try {
        if (!app.documents.length) {
            app.displayDialogs = originalDialogs;
            return '{"error":"No document open"}';
        }
        
        // 检查文件是否存在
        var file = new File(localFilePath);
        if (!file.exists) {
            app.displayDialogs = originalDialogs;
            return '{"error":"File not found: ' + localFilePath + '"}';
        }
        
        var doc = app.activeDocument;
        
        // 打开图片文件
        var importedDoc = app.open(file);
        
        if (!importedDoc) {
            app.displayDialogs = originalDialogs;
            return '{"error":"Failed to open image file"}';
        }
        
        // 选择所有图层并复制
        importedDoc.selection.selectAll();
        importedDoc.selection.copy();
        
        var importedWidth = Math.round(parseFloat(importedDoc.width.as("px")));
        var importedHeight = Math.round(parseFloat(importedDoc.height.as("px")));
        
        // 关闭导入的文档
        importedDoc.close(SaveOptions.DONOTSAVECHANGES);
        
        // 粘贴到当前文档
        doc.paste();
        
        var newLayer = doc.activeLayer;
        var layerName = "Nano Banana AI - " + new Date().toLocaleString();
        
        try {
            newLayer.name = layerName;
        } catch (e) {
            // 图层命名失败不影响主流程
        }
        
        // 🆕 如果提供了目标大小和位置，进行调整
        if (targetWidth && targetHeight) {
            try {
                // 计算缩放比例
                var scaleX = (targetWidth / importedWidth) * 100;
                var scaleY = (targetHeight / importedHeight) * 100;
                
                // 调整图层大小
                newLayer.resize(scaleX, scaleY, AnchorPosition.TOPLEFT);
                
                // 如果提供了位置，移动图层
                if (targetX !== undefined && targetY !== undefined) {
                    // 计算当前图层的边界
                    var bounds = newLayer.bounds;
                    var currentX = parseFloat(bounds[0].as("px"));
                    var currentY = parseFloat(bounds[1].as("px"));
                    
                    // 计算需要移动的距离
                    var deltaX = targetX - currentX;
                    var deltaY = targetY - currentY;
                    
                    // 移动图层
                    newLayer.translate(new UnitValue(deltaX, "px"), new UnitValue(deltaY, "px"));
                }
                
            } catch (transformError) {
                // 变换失败不影响主流程，记录错误
                return '{"success":true,"layerName":"' + String(layerName).replace(/"/g, '\\"') + '","width":' + importedWidth + ',"height":' + importedHeight + ',"warning":"Transform failed: ' + String(transformError).replace(/"/g, '') + '"}';
            }
        }
        
        app.displayDialogs = originalDialogs;
        
        return '{"success":true,"layerName":"' + String(layerName).replace(/"/g, '\\"') + '","width":' + importedWidth + ',"height":' + importedHeight + '}';
        
    } catch (e) {
        app.displayDialogs = originalDialogs;
        return '{"error":"' + String(e).replace(/"/g, '') + '"}';
    }
}

// ========== Move Layer to Index ==========
// 注意：Photoshop 的 itemIndex 从 1 开始，layers 数组从 0 开始
function moveLayerToIndex(targetIndex) {
    try {
        if (!app.documents.length) {
            return '{"error":"No document open"}';
        }
        
        var doc = app.activeDocument;
        var currentLayer = doc.activeLayer;
        
        // 验证目标索引（itemIndex 是从 1 开始的）
        if (targetIndex < 1 || targetIndex > doc.layers.length) {
            return '{"error":"Invalid layer index: ' + targetIndex + ' (total layers: ' + doc.layers.length + ')"}';
        }
        
        // 移动到目标位置
        try {
            // 如果已经在目标位置，不需要移动
            if (currentLayer.itemIndex === targetIndex) {
                return '{"success":true,"message":"Layer already at target position","layerIndex":' + currentLayer.itemIndex + '}';
            }
            
            // 🔧 使用 ActionDescriptor 进行更精确的图层重新排序
            var idmove = stringIDToTypeID("move");
            var desc = new ActionDescriptor();
            
            // 指定要移动的图层（当前活动图层）
            var idnull = stringIDToTypeID("null");
            var ref = new ActionReference();
            ref.putEnumerated(stringIDToTypeID("layer"), stringIDToTypeID("ordinal"), stringIDToTypeID("targetEnum"));
            desc.putReference(idnull, ref);
            
            // 指定目标位置
            var idT = stringIDToTypeID("to");
            var ref2 = new ActionReference();
            ref2.putIndex(stringIDToTypeID("layer"), targetIndex);
            desc.putReference(idT, ref2);
            
            executeAction(idmove, desc, DialogModes.NO);
            
            return '{"success":true,"layerIndex":' + doc.activeLayer.itemIndex + ',"targetIndex":' + targetIndex + '}';
            
        } catch (moveError) {
            return '{"error":"Failed to move layer: ' + String(moveError).replace(/"/g, '') + '"}';
        }
        
    } catch (e) {
        return '{"error":"' + String(e).replace(/"/g, '') + '"}';
    }
}

// ========== Test Function ==========
function testJSXLoaded() {
    return "JSX_LOADED_OK";
}

// Register functions to global scope
$.global.selectTool = selectTool;
$.global.deselectAll = deselectAll;
$.global.resetColors = resetColors;
$.global.getDocumentInfo = getDocumentInfo;
$.global.exportImageToFile = exportImageToFile;
$.global.importImageFromURL = importImageFromURL;
$.global.moveLayerToIndex = moveLayerToIndex;
$.global.testJSXLoaded = testJSXLoaded;
