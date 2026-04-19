// Nano Banana AI - Enhanced Version with Channel Selection Storage
// Export by cropping the original document temporarily

var TEMP_LAYER_NAME = "_NanoBanana_TempMerged_";

// ========== Channel Selection Storage System ==========
var NANOBANA_SELECTION_CHANNEL = "NanoBanana_Selection";

function saveSelectionToChannel() {
    try {
        if (!app.activeDocument) {
            return "ERROR: No active document";
        }
        
        var doc = app.activeDocument;
        
        try {
            var bounds = doc.selection.bounds;
            if (!bounds || bounds[0] === bounds[2] || bounds[1] === bounds[3]) {
                return "ERROR: No valid selection";
            }
        } catch (e) {
            return "ERROR: No selection";
        }
        
        try {
            for (var i = 0; i < doc.channels.length; i++) {
                if (doc.channels[i].name === NANOBANA_SELECTION_CHANNEL) {
                    doc.channels[i].remove();
                    break;
                }
            }
        } catch (removeError) {
            // Ignore
        }
        
        var newChannel = doc.channels.add();
        newChannel.name = NANOBANA_SELECTION_CHANNEL;
        doc.selection.store(newChannel);
        
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

function loadSelectionFromChannel() {
    try {
        if (!app.activeDocument) {
            return "ERROR: No active document";
        }
        
        var doc = app.activeDocument;
        
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
        
        doc.selection.load(selChannel);
        doc.activeChannels = [doc.channels[0], doc.channels[1], doc.channels[2]];
        
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

function cleanupSelectionChannel() {
    try {
        if (!app.activeDocument) {
            return "SUCCESS";
        }
        
        var doc = app.activeDocument;
        
        for (var i = 0; i < doc.channels.length; i++) {
            if (doc.channels[i].name === NANOBANA_SELECTION_CHANNEL) {
                doc.channels[i].remove();
                return "SUCCESS";
            }
        }
        
        return "SUCCESS";
        
    } catch (error) {
        return "SUCCESS";
    }
}

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

// [Comment removed - encoding issue]
function adjustSelectionToMultiple(multiple) {
    try {
        if (!app.activeDocument) {
            return "ERROR: No active document";
        }
        
        var doc = app.activeDocument;
        
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
        var originalWidth = parseFloat(bounds[2]) - parseFloat(bounds[0]);
        var originalHeight = parseFloat(bounds[3]) - parseFloat(bounds[1]);
        
        var newWidth = Math.ceil(originalWidth / multiple) * multiple;
        var newHeight = Math.ceil(originalHeight / multiple) * multiple;
        
        if (newWidth === originalWidth && newHeight === originalHeight) {
            return JSON.stringify({
                success: true,
                adjusted: false,
                width: originalWidth,
                height: originalHeight,
                message: "Selection size already valid (multiple of " + multiple + ")"
            });
        }
        
        var expandWidth = newWidth - originalWidth;
        var expandHeight = newHeight - originalHeight;
        
        var originalBounds = {
            left: parseFloat(bounds[0]),
            top: parseFloat(bounds[1]),
            right: parseFloat(bounds[2]),
            bottom: parseFloat(bounds[3])
        };
        
        var halfExpandWidth = expandWidth / 2;
        var halfExpandHeight = expandHeight / 2;
        
        var newLeft = originalBounds.left - halfExpandWidth;
        var newTop = originalBounds.top - halfExpandHeight;
        var newRight = originalBounds.right + halfExpandWidth;
        var newBottom = originalBounds.bottom + halfExpandHeight;
        
        if (newLeft < 0) newLeft = 0;
        if (newTop < 0) newTop = 0;
        if (newRight > doc.width) newRight = doc.width;
        if (newBottom > doc.height) newBottom = doc.height;
        
        var selectionArray = [[newLeft, newTop], [newRight, newTop], 
                              [newRight, newBottom], [newLeft, newBottom]];
        doc.selection.select(selectionArray);
        
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

function checkSelectionSize(multiple) {
    try {
        if (!app.activeDocument) {
            return "ERROR: No active document";
        }
        
        var doc = app.activeDocument;
        
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

// [Comment removed - encoding issue]
function stampVisibleLayersUpward() {
    try {
        if (!app.activeDocument) {
            return "ERROR: No active document";
        }
        
        var doc = app.activeDocument;
        var debugInfo = "STAMP: Starting stamp visible layers upward";
        
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
        
        var layerCountBefore = doc.layers.length;
        debugInfo += "\nSTAMP: Layer count before: " + layerCountBefore;
        
        try {
            debugInfo += "\nSTAMP: Copying merged content...";
            doc.selection.copy(true);
            debugInfo += "\nSTAMP: Copy merged completed";
            
            debugInfo += "\nSTAMP: Pasting as new layer...";
            doc.paste();
            debugInfo += "\nSTAMP: Paste completed";
            
            var layerCountAfter = doc.layers.length;
            debugInfo += "\nSTAMP: Layer count after: " + layerCountAfter;
            
            if (layerCountAfter > layerCountBefore) {
                var newLayer = doc.activeLayer;
                
                var now = new Date();
                var timestamp = now.toLocaleString('zh-CN', {
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    hour12: false
                }).replace(/\//g, '-');
                
                var newLayerName = " " + timestamp;
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
            debugInfo += "\nSTAMP: Trying fallback method...";
            
            try {
                doc.selection.copy();
                doc.paste();
                
                var fallbackLayer = doc.activeLayer;
                var fallbackName = "() " + new Date().toLocaleTimeString();
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

function stampAndMergeToLayer(targetLayerName) {
    try {
        if (!app.activeDocument) {
            return "ERROR: No active document";
        }
        
        var doc = app.activeDocument;
        
        var stampResult = stampVisibleLayersUpward();
        
        if (stampResult.indexOf("ERROR") === 0) {
            return stampResult;
        }
        
        var resultObj = JSON.parse(stampResult);
        var stampedLayerName = resultObj.layerName;
        
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
        
        var stampedLayer = doc.activeLayer;
        stampedLayer.move(targetLayer, ElementPlacement.PLACEBEFORE);
        
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

/**
 * Minimal test function to verify JSX is loaded
 */
function testJSXLoaded() {
    return '{"success":true,"message":"hostscript.jsx loaded successfully"}';
}

/**
 * Select Photoshop tool
 */
function selectTool(toolName) {
    try {
        // Diagnostic: log entry
        if (typeof app !== 'undefined' && app.documents && app.documents.length > 0) {
            // OK, PS is available
        }
        
        var toolID;
        
        // Map tool names to Photoshop tool IDs (string IDs must match PS locale/engine)
        switch (toolName) {
            case 'rectangularMarquee':
                toolID = stringIDToTypeID('marqueeRectTool');
                break;
            case 'ellipticalMarquee':
                toolID = stringIDToTypeID('marqueeEllipTool');
                break;

            case 'lasso':
                toolID = stringIDToTypeID('lassoTool');
                break;
            case 'polygonalLasso':
                toolID = stringIDToTypeID('polySelTool');
                break;
            case 'magneticLasso':
                toolID = stringIDToTypeID('magneticLassoTool');
                break;
            case 'quickSelection':
                toolID = stringIDToTypeID('quickSelectTool');
                break;
            case 'magicWand':
                toolID = stringIDToTypeID('magicWandTool');
                break;
            case 'brush':
                toolID = stringIDToTypeID('paintbrushTool');
                break;
            case 'eraser':
                toolID = stringIDToTypeID('eraserTool');
                break;
            case 'move':
                toolID = stringIDToTypeID('moveTool');
                break;
            case 'hand':
                toolID = stringIDToTypeID('handTool');
                break;
            case 'zoom':
            case 'zoomIn':
            case 'zoomOut':
                toolID = stringIDToTypeID('zoomTool');
                break;
            default:
                return '{"error":"Unknown tool: ' + toolName + '"}';
        }
        
        // Select the tool using ActionDescriptor
        var desc = new ActionDescriptor();
        var ref = new ActionReference();
        ref.putClass(toolID);
        desc.putReference(charIDToTypeID('null'), ref);
        executeAction(charIDToTypeID('slct'), desc, DialogModes.NO);
        
        return '{"success":true,"tool":"' + toolName + '"}';
        
    } catch (e) {
        var errorMsg = e.message || String(e);
        errorMsg = errorMsg.replace(/"/g, '\\"');
        return '{"error":"Tool selection failed: ' + errorMsg + '"}';
    }
}

/**
 * Get document info
 */
function getDocumentInfo() {
    try {
        if (!app.documents || app.documents.length === 0) {
            return '{"error":"No active document"}';
        }
        
        var doc = app.activeDocument;
        if (!doc) {
            return '{"error":"No active document"}';
        }
        
        var docName = doc.name || "untitled";
        var docWidth = Math.floor(doc.width.as('px'));
        var docHeight = Math.floor(doc.height.as('px'));
        var docResolution = doc.resolution;
        
        var hasSelection = false;
        var selX = 0, selY = 0, selW = 0, selH = 0;
        
        try {
            var bounds = doc.selection.bounds;
            if (bounds && bounds.length >= 4) {
                selX = Math.floor(parseFloat(bounds[0]));
                selY = Math.floor(parseFloat(bounds[1]));
                var x2 = Math.floor(parseFloat(bounds[2]));
                var y2 = Math.floor(parseFloat(bounds[3]));
                selW = x2 - selX;
                selH = y2 - selY;
                hasSelection = (selW > 0 && selH > 0);
            }
        } catch (selErr) {
            hasSelection = false;
        }
        
        var result = '{';
        result += '"name":"' + docName + '",';
        result += '"width":' + docWidth + ',';
        result += '"height":' + docHeight + ',';
        result += '"resolution":' + docResolution + ',';
        result += '"hasSelection":' + (hasSelection ? 'true' : 'false');
        if (hasSelection) {
            result += ',"selectionBounds":{"x":' + selX + ',"y":' + selY + ',"width":' + selW + ',"height":' + selH + '}';
        }
        result += '}';
        
        return result;
    } catch (error) {
        return '{"error":"' + error.toString().replace(/"/g, '') + '"}';
    }
}

/**
 * Export selection - NO FLICKER VERSION
 * Uses duplicate + crop + export, then undo history
 */
function exportImageToFile(mode) {
    var originalDialogs = app.displayDialogs;
    app.displayDialogs = DialogModes.NO;
    var originalRulerUnits = app.preferences.rulerUnits;
    app.preferences.rulerUnits = Units.PIXELS;
    
    try {
        if (!app.documents || app.documents.length === 0) {
            app.displayDialogs = originalDialogs;
            app.preferences.rulerUnits = originalRulerUnits;
            return '{"error":"No active document"}';
        }
        
        var doc = app.activeDocument;
        
// [Comment removed - encoding issue]
        var SELECTION_CHANNEL = "NanoBanana_Selection";
        var selectionSaved = false;
        
        try {
// [Comment removed - encoding issue]
            var hasSelection = false;
            try {
                var testBounds = doc.selection.bounds;
                var testWidth = parseFloat(testBounds[2]) - parseFloat(testBounds[0]);
                var testHeight = parseFloat(testBounds[3]) - parseFloat(testBounds[1]);
                hasSelection = (testWidth > 0 && testHeight > 0);
            } catch (e) {
                hasSelection = false;
            }
            
            if (hasSelection) {
// [Comment removed - encoding issue]
                for (var i = doc.channels.length - 1; i >= 0; i--) {
                    if (doc.channels[i].name === SELECTION_CHANNEL) {
                        doc.channels[i].remove();
                        break;
                    }
                }
                
// [Comment removed - encoding issue]
                var selChannel = doc.channels.add();
                selChannel.name = SELECTION_CHANNEL;
                doc.selection.store(selChannel);
                
// [Comment removed - encoding issue]
                doc.activeChannels = [doc.channels[0], doc.channels[1], doc.channels[2]];
                
                selectionSaved = true;
            }
        } catch (channelError) {
// [Comment removed - encoding issue]
        }
        
        // Get selection bounds
        var bounds;
        try {
            bounds = doc.selection.bounds;
        } catch (e) {
            doc.selection.selectAll();
            bounds = doc.selection.bounds;
        }
        
        var selX = Math.floor(parseFloat(bounds[0]));
        var selY = Math.floor(parseFloat(bounds[1]));
        var selWidth = Math.floor(parseFloat(bounds[2]) - parseFloat(bounds[0]));
        var selHeight = Math.floor(parseFloat(bounds[3]) - parseFloat(bounds[1]));
        
        if (selWidth <= 0 || selHeight <= 0) {
            app.displayDialogs = originalDialogs;
            app.preferences.rulerUnits = originalRulerUnits;
            return '{"error":"Invalid selection"}';
        }
        
        // Create temp file
        var tempFile = createTempFile("nanoBanana_preview_", ".jpg");
        if (!tempFile) {
            app.displayDialogs = originalDialogs;
            app.preferences.rulerUnits = originalRulerUnits;
            return '{"error":"Could not create temp file"}';
        }
        
        // Strategy: Duplicate doc, crop, save, close duplicate
        // The duplicate() method is faster and doesn't show in UI
        var dupDoc = null;
        
        try {
            // Duplicate the document (this is MUCH faster and less visible)
            dupDoc = doc.duplicate("TempExport", false);
            
            // Get document dimensions
            var docWidth = dupDoc.width.as('px');
            var docHeight = dupDoc.height.as('px');
            
            // Ensure crop bounds are within document
            var cropX1 = Math.max(0, Math.min(selX, docWidth));
            var cropY1 = Math.max(0, Math.min(selY, docHeight));
            var cropX2 = Math.max(0, Math.min(selX + selWidth, docWidth));
            var cropY2 = Math.max(0, Math.min(selY + selHeight, docHeight));
            
            // Crop to selection bounds
            dupDoc.crop([cropX1, cropY1, cropX2, cropY2]);
            
            // Flatten for smaller file
            if (dupDoc.layers.length > 1) {
                dupDoc.flatten();
            }
            
            // Save as JPEG
            var saveOptions = new JPEGSaveOptions();
            saveOptions.quality = 10;
            saveOptions.embedColorProfile = false;
            dupDoc.saveAs(tempFile, saveOptions, true);
            
            // Close duplicate immediately
            dupDoc.close(SaveOptions.DONOTSAVECHANGES);
            dupDoc = null;
            
            // Ensure original doc is still active
            app.activeDocument = doc;
            
        } catch (exportErr) {
            if (dupDoc) {
                try { dupDoc.close(SaveOptions.DONOTSAVECHANGES); } catch (e) {}
            }
            app.displayDialogs = originalDialogs;
            app.preferences.rulerUnits = originalRulerUnits;
            return '{"error":"Export failed: ' + exportErr.toString().replace(/"/g, '') + '"}';
        }
        
        app.displayDialogs = originalDialogs;
        app.preferences.rulerUnits = originalRulerUnits;
        
        var filePath = tempFile.fsName.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
        return '{"filePath":"' + filePath + '","width":' + selWidth + ',"height":' + selHeight + '}';
        
    } catch (error) {
        app.displayDialogs = originalDialogs;
        app.preferences.rulerUnits = originalRulerUnits;
        return '{"error":"' + error.toString().replace(/"/g, '') + '"}';
    }
}

/**
 * Export selection to Base64 - For API upload
 * Returns file path for JavaScript to convert
 */
function exportImageToBase64(mode) {
    var originalDialogs = app.displayDialogs;
    app.displayDialogs = DialogModes.NO;
    var originalRulerUnits = app.preferences.rulerUnits;
    app.preferences.rulerUnits = Units.PIXELS;
    
    try {
        if (!app.documents || app.documents.length === 0) {
            app.displayDialogs = originalDialogs;
            app.preferences.rulerUnits = originalRulerUnits;
            return '{"error":"No active document"}';
        }
        
        var doc = app.activeDocument;
        
        // Get selection bounds
        var bounds;
        try {
            bounds = doc.selection.bounds;
        } catch (e) {
            doc.selection.selectAll();
            bounds = doc.selection.bounds;
        }
        
        var selX = Math.floor(parseFloat(bounds[0]));
        var selY = Math.floor(parseFloat(bounds[1]));
        var selWidth = Math.floor(parseFloat(bounds[2]) - parseFloat(bounds[0]));
        var selHeight = Math.floor(parseFloat(bounds[3]) - parseFloat(bounds[1]));
        
        if (selWidth <= 0 || selHeight <= 0) {
            app.displayDialogs = originalDialogs;
            app.preferences.rulerUnits = originalRulerUnits;
            return '{"error":"Invalid selection"}';
        }
        
        // Create temp file
        var tempFile = createTempFile("nanoBanana_upload_", ".jpg");
        if (!tempFile) {
            app.displayDialogs = originalDialogs;
            app.preferences.rulerUnits = originalRulerUnits;
            return '{"error":"Could not create temp file"}';
        }
        
        // Use EXACTLY the same method as preview (which works)
        var dupDoc = null;
        
        try {
            // Duplicate the document
            dupDoc = doc.duplicate("TempExport", false);
            
            // Get document dimensions (after duplicate)
            var docWidth = dupDoc.width.as('px');
            var docHeight = dupDoc.height.as('px');
            
            // Ensure crop bounds are within document (same as preview)
            var cropX1 = Math.max(0, Math.min(selX, docWidth));
            var cropY1 = Math.max(0, Math.min(selY, docHeight));
            var cropX2 = Math.max(0, Math.min(selX + selWidth, docWidth));
            var cropY2 = Math.max(0, Math.min(selY + selHeight, docHeight));
            
            // Crop to selection bounds
            dupDoc.crop([cropX1, cropY1, cropX2, cropY2]);
            
            // Flatten
            if (dupDoc.layers.length > 1) {
                dupDoc.flatten();
            }
            
            // Save with high quality
            var saveOptions = new JPEGSaveOptions();
            saveOptions.quality = 90;  // Higher quality for API
            saveOptions.embedColorProfile = false;
            dupDoc.saveAs(tempFile, saveOptions, true);
            
            // Close
            dupDoc.close(SaveOptions.DONOTSAVECHANGES);
            dupDoc = null;
            
            // Restore
            app.activeDocument = doc;
            
        } catch (exportErr) {
            if (dupDoc) {
                try { dupDoc.close(SaveOptions.DONOTSAVECHANGES); } catch (e) {}
            }
            app.displayDialogs = originalDialogs;
            app.preferences.rulerUnits = originalRulerUnits;
            return '{"error":"Export failed: ' + exportErr.toString().replace(/"/g, '') + '"}';
        }
        
        app.displayDialogs = originalDialogs;
        app.preferences.rulerUnits = originalRulerUnits;
        
        // Return file path for JavaScript to read and convert to base64
        var filePath = tempFile.fsName.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
        return '{"filePath":"' + filePath + '","width":' + selWidth + ',"height":' + selHeight + '}';
        
    } catch (error) {
        app.displayDialogs = originalDialogs;
        app.preferences.rulerUnits = originalRulerUnits;
        return '{"error":"' + error.toString().replace(/"/g, '') + '"}';
    }
}

/**
 * Import image from URL
 */
/**
 * hotoshop - 
 * AI? */
function importImageFromURL(imageUrl) {
    var originalDialogs = app.displayDialogs;
    app.displayDialogs = DialogModes.NO;
    
    try {
        if (!app.documents || app.documents.length === 0) {
            app.displayDialogs = originalDialogs;
            return '{"error":"No active document"}';
        }
        
        var doc = app.activeDocument;
        var debugInfo = "IMPORT_START: " + imageUrl;
        
// [Comment removed - encoding issue]
        var SELECTION_CHANNEL = "NanoBanana_Selection";
        var hasSelection = false;
        var selectionBounds = null;
        
        try {
            var selChannel = null;
            for (var i = 0; i < doc.channels.length; i++) {
                if (doc.channels[i].name === SELECTION_CHANNEL) {
                    selChannel = doc.channels[i];
                    break;
                }
            }
            
            if (selChannel) {
                doc.selection.load(selChannel);
// [Comment removed - encoding issue]
                doc.activeChannels = [doc.channels[0], doc.channels[1], doc.channels[2]];
                
                var bounds = doc.selection.bounds;
                if (bounds && bounds.length >= 4) {
                    var left = parseFloat(bounds[0]);
                    var top = parseFloat(bounds[1]);
                    var right = parseFloat(bounds[2]);
                    var bottom = parseFloat(bounds[3]);
                    if (right > left && bottom > top) {
                        hasSelection = true;
                        selectionBounds = {
                            left: left,
                            top: top,
                            right: right,
                            bottom: bottom,
                            width: right - left,
                            height: bottom - top
                        };
                        debugInfo += "\nSELECTION_RESTORED: (" + left + "," + top + "," + right + "," + bottom + ")";
                    }
                }
            }
        } catch (channelError) {
            debugInfo += "\nSELECTION_LOAD_FAILED: " + channelError.message;
        }
        
// [Comment removed - encoding issue]
        debugInfo += "\nUSING_LOCAL_FILE: " + imageUrl;
        
// [Comment removed - encoding issue]
        var tempFile = new File(imageUrl);
        
        if (!tempFile.exists) {
            app.displayDialogs = originalDialogs;
            return '{"error":"Local file not found: ' + imageUrl.replace(/"/g, '\\\\"') + '"}';
        }
        
        debugInfo += "\nLOCAL_FILE_FOUND: " + tempFile.fsName + " (" + tempFile.length + " bytes)";
        
// [Comment removed - encoding issue]
        var importedDoc = null;
        var openSuccess = false;
        var lastError = "";
        
        try {
            debugInfo += "\nMETHOD1_TRY: Standard open";
            importedDoc = app.open(tempFile);
            openSuccess = true;
            debugInfo += "\nMETHOD1_SUCCESS";
        } catch (e1) {
            lastError = e1.message;
            debugInfo += "\nMETHOD1_FAILED: " + e1.message;
            
// [Comment removed - encoding issue]
            try {
                debugInfo += "\nMETHOD2_TRY: ActionDescriptor with forced RGB";
                
                var desc2 = new ActionDescriptor();
                desc2.putPath(charIDToTypeID("null"), tempFile);
                
// [Comment removed - encoding issue]
                var openDesc = new ActionDescriptor();
                openDesc.putEnumerated(charIDToTypeID("Md  "), 
                                      charIDToTypeID("ClrS"), 
                                      charIDToTypeID("RGBC"));
                openDesc.putUnitDouble(charIDToTypeID("Rslt"), 
                                      charIDToTypeID("#Rsl"), 72.0);
                desc2.putObject(charIDToTypeID("As  "), 
                               charIDToTypeID("Phtg"), openDesc);
                
                executeAction(charIDToTypeID("Opn "), desc2, DialogModes.NO);
                importedDoc = app.activeDocument;
                openSuccess = true;
                debugInfo += "\nMETHOD2_SUCCESS";
            } catch (e2) {
                lastError = e2.message;
                debugInfo += "\nMETHOD2_FAILED: " + e2.message;
                
// [Comment removed - encoding issue]
                try {
                    debugInfo += "\nMETHOD3_TRY: Temp document + place";
                    
                    var tempDoc = app.documents.add(1000, 1000, 72, "TempImport", NewDocumentMode.RGB);
                    
                    var desc3 = new ActionDescriptor();
                    desc3.putPath(charIDToTypeID("null"), tempFile);
                    desc3.putEnumerated(charIDToTypeID("FTcs"), 
                                       charIDToTypeID("QCSt"), 
                                       charIDToTypeID("Qcsa"));
                    executeAction(charIDToTypeID("Plc "), desc3, DialogModes.NO);
                    
// [Comment removed - encoding issue]
                        executeAction(stringIDToTypeID("rasterizeLayer"), 
                                    new ActionDescriptor(), DialogModes.NO);
                    } catch (rasterError) {
// [Comment removed - encoding issue]
                    
                    importedDoc = tempDoc;
                    openSuccess = true;
                    debugInfo += "\nMETHOD3_SUCCESS";
                } catch (e3) {
                    lastError = e3.message;
                    debugInfo += "\nMETHOD3_FAILED: " + e3.message;
                }
            }
        }
        
// [Comment removed - encoding issue]
        if (!openSuccess) {
            if (tempFile.exists) tempFile.remove();
            app.displayDialogs = originalDialogs;
            debugInfo += "\nALL_METHODS_FAILED";
            return '{"error":"All import methods failed: ' + lastError.replace(/"/g, '\\"') + '","debug":"' + debugInfo.replace(/"/g, '\\"').replace(/\n/g, '\\n') + '"}';
        }
        
// [Comment removed - encoding issue]
        debugInfo += "\nCOPYING_CONTENT";
        
        try {
            importedDoc.selection.selectAll();
            importedDoc.selection.copy();
            debugInfo += "\nCOPY_SUCCESS";
        } catch (copyError) {
            importedDoc.close(SaveOptions.DONOTSAVECHANGES);
            if (tempFile.exists) tempFile.remove();
            app.displayDialogs = originalDialogs;
            return '{"error":"Copy failed: ' + copyError.message.replace(/"/g, '\\"') + '"}';
        }
        
// [Comment removed - encoding issue]
        debugInfo += "\nIMPORTED_DOC_CLOSED";
        
// [Comment removed - encoding issue]
        app.activeDocument = doc;
        
// [Comment removed - encoding issue]
        debugInfo += "\nPASTING_IMAGE";
        
        var pastedLayer;
        try {
// [Comment removed - encoding issue]
            doc.selection.deselect();
            
            pastedLayer = doc.paste();
            pastedLayer.name = "Nano Banana Result";
            debugInfo += "\nPASTE_SUCCESS";
            
// [Comment removed - encoding issue]
                try {
// [Comment removed - encoding issue]
// [Comment removed - encoding issue]
                    var desc1 = new ActionDescriptor();
                    var ref1 = new ActionReference();
                    ref1.putName(charIDToTypeID('Lyr '), pastedLayer.name);
                    desc1.putReference(charIDToTypeID('null'), ref1);
                    desc1.putBoolean(charIDToTypeID('MkVs'), false);
                    executeAction(charIDToTypeID('slct'), desc1, DialogModes.NO);
                    
// [Comment removed - encoding issue]
                    var desc2 = new ActionDescriptor();
                    var ref2 = new ActionReference();
                    ref2.putEnumerated(charIDToTypeID('Lyr '), charIDToTypeID('Ordn'), charIDToTypeID('Trgt'));
                    desc2.putReference(charIDToTypeID('null'), ref2);
                    desc2.putEnumerated(charIDToTypeID('Usng'), charIDToTypeID('ADSt'), stringIDToTypeID('ADSCentersH'));
                    executeAction(charIDToTypeID('Algn'), desc2, DialogModes.NO);
                    
// [Comment removed - encoding issue]
                    var desc3 = new ActionDescriptor();
                    var ref3 = new ActionReference();
                    ref3.putEnumerated(charIDToTypeID('Lyr '), charIDToTypeID('Ordn'), charIDToTypeID('Trgt'));
                    desc3.putReference(charIDToTypeID('null'), ref3);
                    desc3.putEnumerated(charIDToTypeID('Usng'), charIDToTypeID('ADSt'), stringIDToTypeID('ADSCentersV'));
                    executeAction(charIDToTypeID('Algn'), desc3, DialogModes.NO);
                    
                    debugInfo += "\nLAYER_CENTERED_TO_CANVAS";
                } catch (centerError) {
                    debugInfo += "\nCENTER_FAILED:" + centerError.message;
// [Comment removed - encoding issue]
                }
            }
        } catch (pasteError) {
            if (tempFile.exists) tempFile.remove();
            app.displayDialogs = originalDialogs;
            return '{"error":"Paste failed: ' + pasteError.message.replace(/"/g, '\\"') + '"}';
        }
        
// [Comment removed - encoding issue]
        if (hasSelection && selectionBounds) {
            try {
                debugInfo += "\nALIGNING_TO_SELECTION";
                
// [Comment removed - encoding issue]
                var selRegion = [
                    [selectionBounds.left, selectionBounds.top],
                    [selectionBounds.right, selectionBounds.top],
                    [selectionBounds.right, selectionBounds.bottom],
                    [selectionBounds.left, selectionBounds.bottom]
                ];
                doc.selection.select(selRegion);
                
// [Comment removed - encoding issue]
                var layerBounds = pastedLayer.bounds;
                var layerLeft = parseFloat(layerBounds[0]);
                var layerTop = parseFloat(layerBounds[1]);
                var layerRight = parseFloat(layerBounds[2]);
                var layerBottom = parseFloat(layerBounds[3]);
                var layerWidth = layerRight - layerLeft;
                var layerHeight = layerBottom - layerTop;
                
// [Comment removed - encoding issue]
                var scaleY = selectionBounds.height / layerHeight * 100;
                
// [Comment removed - encoding issue]
                if (Math.abs(scaleX - 100) > 0.1 || Math.abs(scaleY - 100) > 0.1) {
                    pastedLayer.resize(scaleX, scaleY, AnchorPosition.TOPLEFT);
                    debugInfo += "\nRESIZED: " + scaleX.toFixed(2) + "%, " + scaleY.toFixed(2) + "%";
                }
                
// [Comment removed - encoding issue]
                var scaledBounds = pastedLayer.bounds;
                var scaledLeft = parseFloat(scaledBounds[0]);
                var scaledTop = parseFloat(scaledBounds[1]);
                var moveX = selectionBounds.left - scaledLeft;
                var moveY = selectionBounds.top - scaledTop;
                
                if (Math.abs(moveX) > 0.1 || Math.abs(moveY) > 0.1) {
                    pastedLayer.translate(moveX, moveY);
                    debugInfo += "\nMOVED: " + moveX.toFixed(2) + ", " + moveY.toFixed(2);
                }
                
                debugInfo += "\nALIGNMENT_SUCCESS";
            } catch (alignError) {
                debugInfo += "\nALIGNMENT_FAILED: " + alignError.message;
// [Comment removed - encoding issue]
        }
        
// [Comment removed - encoding issue]
        try {
            doc.selection.deselect();
        } catch (e) {
// [Comment removed - encoding issue]
        }
        
// [Comment removed - encoding issue]
        try {
            for (var ci = doc.channels.length - 1; ci >= 0; ci--) {
                if (doc.channels[ci].name === SELECTION_CHANNEL) {
                    doc.channels[ci].remove();
                    debugInfo += "\nCHANNEL_CLEANED";
                    break;
                }
            }
        } catch (cleanError) {
            debugInfo += "\nCHANNEL_CLEAN_FAILED: " + cleanError.message;
        }
        
// [Comment removed - encoding issue]
        if (tempFile.exists) {
            tempFile.remove();
            debugInfo += "\nTEMP_FILE_REMOVED";
        }
        
        app.displayDialogs = originalDialogs;
        debugInfo += "\nIMPORT_COMPLETE";
        
        return '{"success":true,"layerName":"Nano Banana Result","debug":"' + debugInfo.replace(/"/g, '\\"').replace(/\n/g, '\\n') + '"}';
        
    } catch (error) {
        app.displayDialogs = originalDialogs;
        return '{"error":"' + error.toString().replace(/"/g, '\\"') + '"}';
    }
}

// ========== Helper Functions ==========

function createTempFile(prefix, extension) {
    try {
        var tempDir = Folder.temp + "/nanobanana_temp/";
        var folder = new Folder(tempDir);
        
        if (!folder.exists) {
            folder.create();
        }
        
        var timestamp = new Date().getTime();
        var random = Math.floor(Math.random() * 10000);
        return new File(tempDir + prefix + timestamp + "_" + random + extension);
    } catch (e) {
        return null;
    }
}

/**
 * Import image from Base64 data
 * More reliable than URL download
 */
function importImageFromBase64(base64Data) {
    var originalDialogs = app.displayDialogs;
    app.displayDialogs = DialogModes.NO;
    
    try {
        if (!app.documents || app.documents.length === 0) {
            app.displayDialogs = originalDialogs;
            return '{"error":"No active document"}';
        }
        
        var doc = app.activeDocument;
        
// [Comment removed - encoding issue]
        var base64String = String(base64Data);
        
// [Comment removed - encoding issue]
        var tempFile = createTempFile("nanoBanana_import_", ".png");
        if (!tempFile) {
            app.displayDialogs = originalDialogs;
            return '{"error":"Could not create temp file"}';
        }
        
// [Comment removed - encoding issue]
        var commaIndex = base64String.indexOf(',');
        if (commaIndex > -1) {
            base64Content = base64String.substring(commaIndex + 1);
        }
        
// [Comment removed - encoding issue]
        tempFile.open("w");
        
        var decoded = decodeBase64Fast(base64Content);
        if (!decoded) {
            tempFile.close();
            if (tempFile.exists) tempFile.remove();
            app.displayDialogs = originalDialogs;
            return '{"error":"Base64 decode failed"}';
        }
        
        tempFile.write(decoded);
        tempFile.close();
        
// [Comment removed - encoding issue]
        if (!tempFile.exists || tempFile.length === 0) {
            if (tempFile.exists) tempFile.remove();
            app.displayDialogs = originalDialogs;
            return '{"error":"Failed to write image file"}';
        }
        
// [Comment removed - encoding issue]
        var importedDoc = app.open(tempFile);
        importedDoc.selection.selectAll();
        importedDoc.selection.copy();
        importedDoc.close(SaveOptions.DONOTSAVECHANGES);
        
// [Comment removed - encoding issue]
        var newLayer = doc.artLayers.add();
        newLayer.name = "Nano Banana Result";
        doc.paste();
        
// [Comment removed - encoding issue]
        if (tempFile.exists) {
            tempFile.remove();
        }
        
        app.displayDialogs = originalDialogs;
        return '{"success":true,"layerName":"Nano Banana Result"}';
    } catch (e) {
        app.displayDialogs = originalDialogs;
        return '{"error":"' + e.toString().replace(/"/g, '\\"') + '"}';
    }
}

/**
 * Fast Base64 decoder using array (much faster than string concatenation)
 */
function decodeBase64Fast(base64Str) {
    try {
        var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
        var output = [];
        var len = base64Str.length;
        
// [Comment removed - encoding issue]
        for (var i = 0; i < len; i += 4) {
            var enc1 = chars.indexOf(base64Str.charAt(i));
            var enc2 = chars.indexOf(base64Str.charAt(i + 1));
            var enc3 = chars.indexOf(base64Str.charAt(i + 2));
            var enc4 = chars.indexOf(base64Str.charAt(i + 3));
            
            if (enc1 === -1 || enc2 === -1) continue;
            
            var chr1 = (enc1 << 2) | (enc2 >> 4);
            output.push(String.fromCharCode(chr1));
            
            if (enc3 !== 64 && enc3 !== -1) {
                var chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
                output.push(String.fromCharCode(chr2));
            }
            
            if (enc4 !== 64 && enc4 !== -1) {
                var chr3 = ((enc3 & 3) << 6) | enc4;
                output.push(String.fromCharCode(chr3));
            }
        }
        
        return output.join('');
    } catch (e) {
        return null;
    }
}

/**
 * Legacy Base64 decoder (kept for reference)
 */
function decodeBase64(base64Str) {
    return decodeBase64Fast(base64Str);
}

/**
 *  + ? * AIanana-post-processing.jsx
 * 
 * @param {string} layerName - 
 * @param {number} radius - 1.0-2.0?.5? * @returns {string} JSON? */
function applySharpenEnhancement(layerName, radius) {
    var originalDialogs = app.displayDialogs;
    app.displayDialogs = DialogModes.NO;
    
    try {
        if (!app.documents || app.documents.length === 0) {
            app.displayDialogs = originalDialogs;
            return '{"error":"No active document"}';
        }
        
        var doc = app.activeDocument;
        var debugInfo = "SHARPEN_START: " + layerName + ", radius=" + radius;
        
// [Comment removed - encoding issue]
        var targetLayer = null;
        for (var i = 0; i < doc.layers.length; i++) {
            if (doc.layers[i].name === layerName) {
                targetLayer = doc.layers[i];
                break;
            }
        }
        
        if (!targetLayer) {
            app.displayDialogs = originalDialogs;
            return '{"error":"Layer not found: ' + layerName.replace(/"/g, '\\\\"') + '"}';
        }
        
        debugInfo += "\nLAYER_FOUND: " + targetLayer.name;
        
// [Comment removed - encoding issue]
        doc.activeLayer = targetLayer;
        var sharpenLayer = targetLayer.duplicate();
        sharpenLayer.name = layerName + " ()";
        debugInfo += "\nLAYER_DUPLICATED: " + sharpenLayer.name;
        
// [Comment removed - encoding issue]
        var highPassDesc = new ActionDescriptor();
        highPassDesc.putUnitDouble(charIDToTypeID('Rds '), charIDToTypeID('#Pxl'), parseFloat(radius));
        executeAction(charIDToTypeID('HghP'), highPassDesc, DialogModes.NO);
        debugInfo += "\nHIGH_PASS_APPLIED: " + radius + "px";
        
// [Comment removed - encoding issue]
        debugInfo += "\nBLEND_MODE_SET: Overlay";
        
// [Comment removed - encoding issue]
        doc.activeLayer = sharpenLayer;
        var mergeDownDesc = new ActionDescriptor();
        executeAction(charIDToTypeID('Mrg2'), mergeDownDesc, DialogModes.NO);
        debugInfo += "\nLAYERS_MERGED";
        
// [Comment removed - encoding issue]
        mergedLayer.name = layerName;
        debugInfo += "\nLAYER_RENAMED: " + mergedLayer.name;
        debugInfo += "\nSHARPEN_COMPLETE";
        
        app.displayDialogs = originalDialogs;
        return '{"success":true,"layerName":"' + mergedLayer.name.replace(/"/g, '\\\\"') + 
               '","debug":"' + debugInfo.replace(/"/g, '\\\\"').replace(/\n/g, '\\\\n') + '"}';
        
    } catch (error) {
        app.displayDialogs = originalDialogs;
        return '{"error":"' + error.toString().replace(/"/g, '\\\\"') + '"}';
    }
}

/**
 * ? * @param {string} oldName - ? * @param {string} newName - ? * @returns {string} JSON? */
function renameLayer(oldName, newName) {
    try {
        if (!app.documents || app.documents.length === 0) {
            return '{"error":"No active document"}';
        }
        
        var doc = app.activeDocument;
        
// [Comment removed - encoding issue]
        for (var i = 0; i < doc.layers.length; i++) {
            if (doc.layers[i].name === oldName) {
                doc.layers[i].name = newName;
                return '{"success":true,"oldName":"' + oldName.replace(/"/g, '\\\\"') + 
                       '","newName":"' + newName.replace(/"/g, '\\\\"') + '"}';
            }
        }
        
        return '{"error":"Layer not found: ' + oldName.replace(/"/g, '\\\\"') + '"}';
    } catch (error) {
        return '{"error":"' + error.toString().replace(/"/g, '\\\\"') + '"}';
    }
}

/**
 * Create a layer group (folder)
 */
function createLayerGroup(groupName) {
    try {
        if (!app.documents || app.documents.length === 0) {
            return '{"error":"No active document"}';
        }
        
        var doc = app.activeDocument;
        
        // Check if group already exists
        for (var i = 0; i < doc.layerSets.length; i++) {
            if (doc.layerSets[i].name === groupName) {
                return '{"success":true,"groupName":"' + groupName.replace(/"/g, '\\\\"') + '","existed":true}';
            }
        }
        
        // Create new group
        var layerSet = doc.layerSets.add();
        layerSet.name = groupName;
        
        return '{"success":true,"groupName":"' + groupName.replace(/"/g, '\\\\"') + '","existed":false}';
    } catch (error) {
        return '{"error":"' + error.toString().replace(/"/g, '\\\\"') + '"}';
    }
}

/**
 * Move layer to group
 */
function moveLayerToGroup(layerName, groupName) {
    try {
        if (!app.documents || app.documents.length === 0) {
            return '{"error":"No active document"}';
        }
        
        var doc = app.activeDocument;
        var targetLayer = null;
        var targetGroup = null;
        
        // Find the layer
        for (var i = 0; i < doc.layers.length; i++) {
            if (doc.layers[i].name === layerName) {
                targetLayer = doc.layers[i];
                break;
            }
        }
        
        if (!targetLayer) {
            return '{"error":"Layer not found: ' + layerName.replace(/"/g, '\\\\"') + '"}';
        }
        
        // Find the group
        for (var j = 0; j < doc.layerSets.length; j++) {
            if (doc.layerSets[j].name === groupName) {
                targetGroup = doc.layerSets[j];
                break;
            }
        }
        
        if (!targetGroup) {
            return '{"error":"Group not found: ' + groupName.replace(/"/g, '\\\\"') + '"}';
        }
        
        // Move layer to group
        targetLayer.move(targetGroup, ElementPlacement.INSIDE);
        
        return '{"success":true,"layerName":"' + layerName.replace(/"/g, '\\\\"') + 
               '","groupName":"' + groupName.replace(/"/g, '\\\\"') + '"}';
    } catch (error) {
        return '{"error":"' + error.toString().replace(/"/g, '\\\\"') + '"}';
    }
}

/**
 * [?v1.8.1] Download image from URL using Socket
 * 
 * 
 * 1. ?SocketTTPS20%
 * 2. ?avaScriptode.jsttps?9.9%
 * 3. ?JavaScriptJSX
 * 4. ?JSX? * 
 * 
 */
function downloadImage_DEPRECATED(url) {
    try {
        var tempFile = createTempFile("nanoBanana_download_", ".jpg");
        if (!tempFile) return null;
        
        var match = url.match(/^https?:\/\/([^\/]+)(\/.*)?$/);
        if (!match) return null;
        
        var host = match[1];
        var path = match[2] || "/";
        var port = url.indexOf("https") === 0 ? 443 : 80;
        
        var conn = new Socket();
        if (!conn.open(host + ":" + port, "BINARY")) return null;
        
        conn.write("GET " + path + " HTTP/1.1\r\nHost: " + host + "\r\nConnection: close\r\n\r\n");
        
        var response = "";
        var chunk;
        while ((chunk = conn.read(65536)) != "") {
            response += chunk;
        }
        conn.close();
        
        var headerEnd = response.indexOf("\r\n\r\n");
        if (headerEnd === -1) return null;
        
        tempFile.encoding = "BINARY";
        tempFile.open("w");
        tempFile.write(response.substring(headerEnd + 4));
        tempFile.close();
        
        return tempFile;
    } catch (e) {
        return null;
    }
}

/**
 * 
 * @param {string} layerName - 
 * @returns {string} JSON result
 */
function alignLayerToSelection(layerName) {
    try {
        if (!app.activeDocument) {
            return "ERROR: No active document";
        }
        
        var doc = app.activeDocument;
        
// [Comment removed - encoding issue]
        var selectionBounds;
        try {
            selectionBounds = doc.selection.bounds;
            if (!selectionBounds || selectionBounds[0] === selectionBounds[2]) {
                return "ERROR: No active selection";
            }
        } catch (e) {
            return "ERROR: No active selection";
        }
        
// [Comment removed - encoding issue]
        var selLeft = parseFloat(selectionBounds[0]);
        var selTop = parseFloat(selectionBounds[1]);
        var selRight = parseFloat(selectionBounds[2]);
        var selBottom = parseFloat(selectionBounds[3]);
        var selWidth = selRight - selLeft;
        var selHeight = selBottom - selTop;
        var selCenterX = selLeft + selWidth / 2;
        var selCenterY = selTop + selHeight / 2;
        
// [Comment removed - encoding issue]
        var targetLayer = null;
        for (var i = 0; i < doc.layers.length; i++) {
            if (doc.layers[i].name === layerName) {
                targetLayer = doc.layers[i];
                break;
            }
        }
        
        if (!targetLayer) {
            return "ERROR: Layer not found: " + layerName;
        }
        
// [Comment removed - encoding issue]
        
// [Comment removed - encoding issue]
        var layerLeft = parseFloat(layerBounds[0]);
        var layerTop = parseFloat(layerBounds[1]);
        var layerRight = parseFloat(layerBounds[2]);
        var layerBottom = parseFloat(layerBounds[3]);
        var layerWidth = layerRight - layerLeft;
        var layerHeight = layerBottom - layerTop;
        var layerCenterX = layerLeft + layerWidth / 2;
        var layerCenterY = layerTop + layerHeight / 2;
        
// [Comment removed - encoding issue]
        var scaleY = (selHeight / layerHeight) * 100;
        
// [Comment removed - encoding issue]
            targetLayer.resize(scaleX, scaleY, AnchorPosition.MIDDLECENTER);
            
// [Comment removed - encoding issue]
            layerBounds = targetLayer.bounds;
            layerLeft = parseFloat(layerBounds[0]);
            layerTop = parseFloat(layerBounds[1]);
            layerRight = parseFloat(layerBounds[2]);
            layerBottom = parseFloat(layerBounds[3]);
            layerWidth = layerRight - layerLeft;
            layerHeight = layerBottom - layerTop;
            layerCenterX = layerLeft + layerWidth / 2;
            layerCenterY = layerTop + layerHeight / 2;
        }
        
// [Comment removed - encoding issue]
        var deltaY = selCenterY - layerCenterY;
        
// [Comment removed - encoding issue]
        if (Math.abs(deltaX) > 0.1 || Math.abs(deltaY) > 0.1) {
            targetLayer.translate(deltaX, deltaY);
        }
        
// [Comment removed - encoding issue]
        
        return JSON.stringify({
            success: true,
            layerName: layerName,
            scaled: {
                scaleX: scaleX,
                scaleY: scaleY
            },
            moved: {
                deltaX: deltaX,
                deltaY: deltaY
            },
            selection: {
                x: selLeft,
                y: selTop,
                width: selWidth,
                height: selHeight
            },
            finalPosition: {
                left: parseFloat(finalBounds[0]),
                top: parseFloat(finalBounds[1]),
                right: parseFloat(finalBounds[2]),
                bottom: parseFloat(finalBounds[3])
            }
        });
        
    } catch (error) {
        return "ERROR: " + error.message;
    }
}

// ========== Global Function Registration ==========
// CEP evalScript() may not resolve top-level functions from ScriptPath on some PS builds
// Register all functions to $.global for reliable access
try {
    if (typeof $ !== 'undefined' && $ && $.global) {
        $.global.testJSXLoaded = testJSXLoaded;
        $.global.selectTool = selectTool;
        $.global.getDocumentInfo = getDocumentInfo;
        $.global.deselectAll = deselectAll;
        $.global.exportImageToFile = exportImageToFile;
        $.global.importImageFromURL = importImageFromURL;
        $.global.applySharpenEnhancement = applySharpenEnhancement;
        $.global.saveSelectionToChannel = saveSelectionToChannel;
        $.global.loadSelectionFromChannel = loadSelectionFromChannel;
        $.global.cleanupSelectionChannel = cleanupSelectionChannel;
        $.global.hasSelectionChannel = hasSelectionChannel;
        $.global.adjustSelectionToMultiple = adjustSelectionToMultiple;
        $.global.checkSelectionSize = checkSelectionSize;
        $.global.stampVisibleLayersUpward = stampVisibleLayersUpward;
        $.global.alignLayerToSelection = alignLayerToSelection;
    }
} catch (eReg) {
    // Ignore if $ is unavailable
}
