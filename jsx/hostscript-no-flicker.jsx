// Nano Banana AI - No Flicker Version
// Export selection without creating visible temp documents

var TEMP_LAYER_NAME = "_NanoBanana_TempMerged_";

/**
 * Get document info - WORKING VERSION
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
        var selX = 0;
        var selY = 0;
        var selW = 0;
        var selH = 0;
        
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
 * Export selection to file - NO FLICKER VERSION
 * Uses a temporary layer instead of a temporary document
 */
function exportImageToFile(mode) {
    var originalDialogs = app.displayDialogs;
    app.displayDialogs = DialogModes.NO;
    var tempLayer = null;
    var originalActiveLayer = null;
    
    try {
        if (!app.documents || app.documents.length === 0) {
            app.displayDialogs = originalDialogs;
            return '{"error":"No active document"}';
        }
        
        var doc = app.activeDocument;
        if (!doc) {
            app.displayDialogs = originalDialogs;
            return '{"error":"No active document"}';
        }
        
        originalActiveLayer = doc.activeLayer;
        
        // Get selection bounds
        var selBounds;
        try {
            selBounds = doc.selection.bounds;
        } catch (e) {
            // No selection, select all
            doc.selection.selectAll();
            selBounds = doc.selection.bounds;
        }
        
        var selWidth = Math.floor(parseFloat(selBounds[2]) - parseFloat(selBounds[0]));
        var selHeight = Math.floor(parseFloat(selBounds[3]) - parseFloat(selBounds[1]));
        var selX = Math.floor(parseFloat(selBounds[0]));
        var selY = Math.floor(parseFloat(selBounds[1]));
        
        if (selWidth <= 0 || selHeight <= 0) {
            app.displayDialogs = originalDialogs;
            return '{"error":"Invalid selection size"}';
        }
        
        // Save current selection
        var savedSelection = saveSelection(doc);
        
        // Copy selection
        try {
            doc.selection.copy(true);  // Copy merged
        } catch (copyErr) {
            app.displayDialogs = originalDialogs;
            return '{"error":"Failed to copy selection"}';
        }
        
        // Create a new layer and paste
        try {
            tempLayer = doc.artLayers.add();
            tempLayer.name = TEMP_LAYER_NAME;
            doc.activeLayer = tempLayer;
            doc.selection.deselect();
            doc.paste();
        } catch (pasteErr) {
            if (tempLayer) {
                try { tempLayer.remove(); } catch (e) {}
            }
            if (originalActiveLayer) {
                try { doc.activeLayer = originalActiveLayer; } catch (e) {}
            }
            app.displayDialogs = originalDialogs;
            return '{"error":"Failed to paste"}';
        }
        
        // Crop the layer to selection bounds
        try {
            var cropBounds = [
                [selX, selY],
                [selX + selWidth, selY],
                [selX + selWidth, selY + selHeight],
                [selX, selY + selHeight]
            ];
            doc.selection.select(cropBounds);
            doc.crop(cropBounds);
            doc.selection.deselect();
        } catch (cropErr) {
            // If crop fails, continue anyway
        }
        
        // Create temp file
        var tempFile = createTempFile("nanoBanana_preview_", ".jpg");
        if (!tempFile) {
            if (tempLayer) {
                try { tempLayer.remove(); } catch (e) {}
            }
            if (originalActiveLayer) {
                try { doc.activeLayer = originalActiveLayer; } catch (e) {}
            }
            app.displayDialogs = originalDialogs;
            return '{"error":"Could not create temp file"}';
        }
        
        // Export only this layer using Quick Export
        try {
            var saveOptions = new JPEGSaveOptions();
            saveOptions.quality = 10;
            saveOptions.embedColorProfile = false;
            
            // Duplicate to get only the temp layer
            var tempDoc = doc.duplicate("TempExport", false);
            tempDoc.saved = true;
            
            // Flatten and save
            tempDoc.flatten();
            tempDoc.saveAs(tempFile, saveOptions, true);
            tempDoc.close(SaveOptions.DONOTSAVECHANGES);
            
        } catch (saveErr) {
            if (tempLayer) {
                try { tempLayer.remove(); } catch (e) {}
            }
            if (originalActiveLayer) {
                try { doc.activeLayer = originalActiveLayer; } catch (e) {}
            }
            app.displayDialogs = originalDialogs;
            return '{"error":"Failed to save: ' + saveErr.toString().replace(/"/g, '') + '"}';
        }
        
        // Cleanup temp layer
        try {
            tempLayer.remove();
        } catch (removeErr) {}
        
        // Restore original layer
        if (originalActiveLayer) {
            try {
                doc.activeLayer = originalActiveLayer;
            } catch (e) {}
        }
        
        // Restore selection
        restoreSelection(doc, savedSelection);
        
        app.displayDialogs = originalDialogs;
        
        // Build result
        var filePath = tempFile.fsName;
        var escapedPath = filePath.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
        var result = '{';
        result += '"filePath":"' + escapedPath + '",';
        result += '"width":' + selWidth + ',';
        result += '"height":' + selHeight;
        result += '}';
        
        return result;
        
    } catch (error) {
        if (tempLayer) {
            try { tempLayer.remove(); } catch (e) {}
        }
        if (originalActiveLayer) {
            try { doc.activeLayer = originalActiveLayer; } catch (e) {}
        }
        app.displayDialogs = originalDialogs;
        
        var errMsg = error.toString().replace(/"/g, '').replace(/\\/g, '');
        return '{"error":"' + errMsg + '"}';
    }
}

/**
 * Save selection to a channel
 */
function saveSelection(doc) {
    try {
        var selChannel = doc.channels.add();
        selChannel.name = "_NanoBanana_TempSel_";
        doc.selection.store(selChannel);
        return selChannel;
    } catch (e) {
        return null;
    }
}

/**
 * Restore selection from a channel
 */
function restoreSelection(doc, selChannel) {
    try {
        if (selChannel) {
            doc.selection.load(selChannel);
            selChannel.remove();
        }
    } catch (e) {
        // Ignore
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
        
        // Download image
        var tempFile = downloadImage(imageUrl);
        if (!tempFile || !tempFile.exists) {
            app.displayDialogs = originalDialogs;
            return '{"error":"Could not download image"}';
        }
        
        // Open image
        var importedDoc = app.open(tempFile);
        
        // Copy and close
        importedDoc.selection.selectAll();
        importedDoc.selection.copy();
        importedDoc.close(SaveOptions.DONOTSAVECHANGES);
        
        // Paste to original
        app.activeDocument = doc;
        var newLayer = doc.artLayers.add();
        newLayer.name = "Nano Banana Result";
        doc.paste();
        
        // Cleanup
        if (tempFile.exists) {
            tempFile.remove();
        }
        
        app.displayDialogs = originalDialogs;
        return '{"success":true}';
        
    } catch (error) {
        app.displayDialogs = originalDialogs;
        var errMsg = error.toString().replace(/"/g, '');
        return '{"error":"' + errMsg + '"}';
    }
}

// ========== Helper Functions ==========

function createTempFile(prefix, extension) {
    try {
        var isMacOS = $.os.indexOf("Mac") !== -1;
        var tempDir;
        
        if (isMacOS) {
            var homeDir = Folder.myDocuments.parent;
            var tempFolder = new Folder(homeDir.fsName + "/.nanobanana_temp");
            tempDir = tempFolder.fsName + "/";
        } else {
            tempDir = Folder.temp + "/nanobanana_temp/";
        }
        
        var folder = new Folder(tempDir);
        if (!folder.exists) {
            if (!folder.create()) {
                return null;
            }
        }
        
        var timestamp = new Date().getTime();
        var random = Math.floor(Math.random() * 10000);
        var fileName = prefix + timestamp + "_" + random + extension;
        return new File(tempDir + fileName);
    } catch (e) {
        return null;
    }
}

function downloadImage(url) {
    try {
        var tempFile = createTempFile("nanoBanana_download_", ".jpg");
        if (!tempFile) {
            return null;
        }
        
        var match = url.match(/^https?:\/\/([^\/]+)(\/.*)?$/);
        if (!match) {
            return null;
        }
        
        var host = match[1];
        var path = match[2] || "/";
        var isHttps = url.indexOf("https") === 0;
        var port = isHttps ? 443 : 80;
        
        var conn = new Socket();
        if (!conn.open(host + ":" + port, "BINARY")) {
            return null;
        }
        
        var request = "GET " + path + " HTTP/1.1\r\n";
        request += "Host: " + host + "\r\n";
        request += "User-Agent: Adobe Photoshop\r\n";
        request += "Connection: close\r\n\r\n";
        
        conn.write(request);
        
        var response = "";
        var chunk;
        while ((chunk = conn.read(65536)) != "") {
            response += chunk;
        }
        conn.close();
        
        var headerEnd = response.indexOf("\r\n\r\n");
        if (headerEnd === -1) {
            return null;
        }
        
        var body = response.substring(headerEnd + 4);
        
        tempFile.encoding = "BINARY";
        if (!tempFile.open("w")) {
            return null;
        }
        tempFile.write(body);
        tempFile.close();
        
        return tempFile;
    } catch (e) {
        return null;
    }
}
