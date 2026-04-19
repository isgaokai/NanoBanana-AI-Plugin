// Base64 encoding utilities for ExtendScript

/**
 * Convert file to base64 string
 */
function fileToBase64(file) {
    try {
        file.encoding = "BINARY";
        if (!file.open("r")) {
            return "";
        }
        
        var content = file.read();
        file.close();
        
        return binaryToBase64(content);
    } catch (e) {
        return "";
    }
}

/**
 * Convert binary string to base64
 */
function binaryToBase64(binary) {
    var base64Chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    var base64 = "";
    var i = 0;
    
    while (i < binary.length) {
        var byte1 = binary.charCodeAt(i++) & 0xff;
        if (i === binary.length) {
            base64 += base64Chars.charAt(byte1 >> 2);
            base64 += base64Chars.charAt((byte1 & 0x3) << 4);
            base64 += "==";
            break;
        }
        
        var byte2 = binary.charCodeAt(i++) & 0xff;
        if (i === binary.length) {
            base64 += base64Chars.charAt(byte1 >> 2);
            base64 += base64Chars.charAt(((byte1 & 0x3) << 4) | (byte2 >> 4));
            base64 += base64Chars.charAt((byte2 & 0xf) << 2);
            base64 += "=";
            break;
        }
        
        var byte3 = binary.charCodeAt(i++) & 0xff;
        base64 += base64Chars.charAt(byte1 >> 2);
        base64 += base64Chars.charAt(((byte1 & 0x3) << 4) | (byte2 >> 4));
        base64 += base64Chars.charAt(((byte2 & 0xf) << 2) | (byte3 >> 6));
        base64 += base64Chars.charAt(byte3 & 0x3f);
    }
    
    return base64;
}
