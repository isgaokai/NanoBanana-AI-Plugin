// Minimal working JSX for testing

function testJSXLoaded() {
    return '{"success":true,"message":"JSX loaded"}';
}

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
        var hasSelection = false;
        
        try {
            var bounds = doc.selection.bounds;
            if (bounds && bounds.length >= 4) {
                var selX = Math.floor(parseFloat(bounds[0]));
                var selY = Math.floor(parseFloat(bounds[1]));
                var x2 = Math.floor(parseFloat(bounds[2]));
                var y2 = Math.floor(parseFloat(bounds[3]));
                var selW = x2 - selX;
                var selH = y2 - selY;
                hasSelection = (selW > 0 && selH > 0);
            }
        } catch (selErr) {
            hasSelection = false;
        }
        
        return '{"name":"' + docName + '","width":' + docWidth + ',"height":' + docHeight + ',"hasSelection":' + hasSelection + '}';
    } catch (error) {
        return '{"error":"' + String(error).replace(/"/g, '') + '"}';
    }
}

function selectTool(toolName) {
    try {
        var toolID;
        
        switch (toolName) {
            case 'rectangularMarquee':
                toolID = stringIDToTypeID('marqueeTool');
                break;
            case 'ellipticalMarquee':
                toolID = stringIDToTypeID('ellipseTool');
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
            case 'move':
                toolID = stringIDToTypeID('moveTool');
                break;
            default:
                return '{"error":"Unknown tool"}';
        }
        
        var desc = new ActionDescriptor();
        var ref = new ActionReference();
        ref.putClass(toolID);
        desc.putReference(charIDToTypeID('null'), ref);
        executeAction(charIDToTypeID('slct'), desc, DialogModes.NO);
        
        return '{"success":true,"tool":"' + toolName + '"}';
    } catch (e) {
        return '{"error":"' + String(e.message || e).replace(/"/g, '') + '"}';
    }
}

function deselectAll() {
    try {
        if (!app.activeDocument) {
            return '{"error":"No active document"}';
        }
        app.activeDocument.selection.deselect();
        return '{"success":true}';
    } catch (error) {
        return '{"error":"' + String(error).replace(/"/g, '') + '"}';
    }
}

// Register functions
try {
    if (typeof $ !== 'undefined' && $ && $.global) {
        $.global.testJSXLoaded = testJSXLoaded;
        $.global.getDocumentInfo = getDocumentInfo;
        $.global.selectTool = selectTool;
        $.global.deselectAll = deselectAll;
    }
} catch (eReg) {
    // Ignore
}

'{"loaded":true}';
