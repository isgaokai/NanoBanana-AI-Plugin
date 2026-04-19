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
        
        try {
            bounds = doc.selection.bounds;
            hasSelection = (bounds[0] !== bounds[2] && bounds[1] !== bounds[3]);
        } catch (e) {
            hasSelection = false;
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
            
            return '{"success":true,"filePath":"' + resultPath + '","width":' + exportWidth + ',"height":' + exportHeight + '}';
            
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
$.global.testJSXLoaded = testJSXLoaded;
