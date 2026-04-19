// Nano Banana AI - Simplified Photoshop Host Script
// Safe implementation with manual JSON building

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
        try {
            var bounds = doc.selection.bounds;
            if (bounds && bounds.length >= 4) {
                var w = parseFloat(bounds[2]) - parseFloat(bounds[0]);
                var h = parseFloat(bounds[3]) - parseFloat(bounds[1]);
                hasSelection = (w > 0 && h > 0);
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
        result += '}';
        
        return result;
        
    } catch (error) {
        return '{"error":"' + error.toString().replace(/"/g, '') + '"}';
    }
}

/**
 * Export selection to file - SIMPLIFIED VERSION
 */
function exportImageToFile(mode) {
    var originalDialogs = app.displayDialogs;
    app.displayDialogs = DialogModes.NO;
    var tempDoc = null;
    
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
        
        if (selWidth <= 0 || selHeight <= 0) {
            app.displayDialogs = originalDialogs;
            return '{"error":"Invalid selection size"}';
        }
        
        // Copy selection
        try {
            doc.selection.copy();
        } catch (copyErr) {
            app.displayDialogs = originalDialogs;
            return '{"error":"Failed to copy selection"}';
        }
        
        // Create temp document
        try {
            tempDoc = app.documents.add(
                selWidth, 
                selHeight, 
                doc.resolution, 
                "TempExport", 
                NewDocumentMode.RGB
            );
            tempDoc.saved = true;
        } catch (createErr) {
            app.displayDialogs = originalDialogs;
            return '{"error":"Failed to create temp document"}';
        }
        
        // Paste and flatten
        try {
            tempDoc.paste();
            tempDoc.flatten();
            tempDoc.saved = true;
        } catch (pasteErr) {
            if (tempDoc) tempDoc.close(SaveOptions.DONOTSAVECHANGES);
            app.displayDialogs = originalDialogs;
            return '{"error":"Failed to paste"}';
        }
        
        // Create temp file
        var tempFile = createTempFile("nanoBanana_preview_", ".jpg");
        if (!tempFile) {
            if (tempDoc) tempDoc.close(SaveOptions.DONOTSAVECHANGES);
            app.displayDialogs = originalDialogs;
            return '{"error":"Could not create temp file"}';
        }
        
        // Export as JPEG
        try {
            var saveOptions = new JPEGSaveOptions();
            saveOptions.quality = 10;  // Lower quality for preview
            saveOptions.embedColorProfile = false;
            
            tempDoc.saveAs(tempFile, saveOptions, true);
        } catch (saveErr) {
            if (tempDoc) tempDoc.close(SaveOptions.DONOTSAVECHANGES);
            app.displayDialogs = originalDialogs;
            return '{"error":"Failed to save: ' + saveErr.toString().replace(/"/g, '') + '"}';
        }
        
        // Get file path
        var filePath = tempFile.fsName;
        
        // Close temp doc
        try {
            tempDoc.close(SaveOptions.DONOTSAVECHANGES);
        } catch (closeErr) {}
        tempDoc = null;
        
        // Switch back
        try {
            app.activeDocument = doc;
        } catch (switchErr) {}
        
        app.displayDialogs = originalDialogs;
        
        // Build result (escape backslashes for JSON)
        var escapedPath = filePath.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
        var result = '{';
        result += '"filePath":"' + escapedPath + '",';
        result += '"width":' + selWidth + ',';
        result += '"height":' + selHeight;
        result += '}';
        
        return result;
        
    } catch (error) {
        if (tempDoc) {
            try {
                tempDoc.close(SaveOptions.DONOTSAVECHANGES);
            } catch (e) {}
        }
        app.displayDialogs = originalDialogs;
        
        var errMsg = error.toString().replace(/"/g, '').replace(/\\/g, '');
        return '{"error":"' + errMsg + '"}';
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
