// Nano Banana AI - True No Flicker Version
// Export by cropping the original document temporarily

var TEMP_LAYER_NAME = "_NanoBanana_TempMerged_";

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
            
            // Crop to selection bounds
            dupDoc.crop([selX, selY, selX + selWidth, selY + selHeight]);
            
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
 * Import image from URL
 */
function importImageFromURL(imageUrl) {
    var originalDialogs = app.displayDialogs;
    app.displayDialogs = DialogModes.NO;
    
    try {
        if (!app.documents || app.documents.length === 0) {
            app.displayDialogs = originalDialogs;
            return '{"error":"No active document"}';
        }
        
        var doc = app.activeDocument;
        var tempFile = downloadImage(imageUrl);
        
        if (!tempFile || !tempFile.exists) {
            app.displayDialogs = originalDialogs;
            return '{"error":"Could not download image"}';
        }
        
        var importedDoc = app.open(tempFile);
        importedDoc.selection.selectAll();
        importedDoc.selection.copy();
        importedDoc.close(SaveOptions.DONOTSAVECHANGES);
        
        app.activeDocument = doc;
        var newLayer = doc.artLayers.add();
        newLayer.name = "Nano Banana Result";
        doc.paste();
        
        if (tempFile.exists) {
            tempFile.remove();
        }
        
        app.displayDialogs = originalDialogs;
        return '{"success":true}';
        
    } catch (error) {
        app.displayDialogs = originalDialogs;
        return '{"error":"' + error.toString().replace(/"/g, '') + '"}';
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

function downloadImage(url) {
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
