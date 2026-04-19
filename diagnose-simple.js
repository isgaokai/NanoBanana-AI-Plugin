// Simple diagnostic without external dependencies
const http = require('http');

console.log('🔍 Diagnosing ExtendScript communication issue...\n');

// Check if debug port is accessible
http.get('http://localhost:8088/json', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        try {
            const targets = JSON.parse(data);
            const panel = targets.find(t => t.title === 'Nano Banana AI');
            
            if (!panel) {
                console.error('❌ Panel not found in debug targets');
                console.log('Available targets:', targets.map(t => t.title));
                process.exit(1);
            }
            
            console.log('✅ Panel found:', panel.title);
            console.log('📍 URL:', panel.url);
            console.log('🔌 WebSocket:', panel.webSocketDebuggerUrl);
            console.log('\n📋 Diagnostic Summary:');
            console.log('   • CEP debug port: ✅ Accessible (8088)');
            console.log('   • Panel loaded: ✅ ' + panel.title);
            console.log('   • Issue: ExtendScript engine not responding');
            console.log('\n🔧 Possible causes:');
            console.log('   1. No document open in Photoshop (most common)');
            console.log('   2. ExtendScript disabled in Photoshop preferences');
            console.log('   3. Photoshop needs restart');
            console.log('\n💡 Solutions:');
            console.log('   1. Open or create a document in Photoshop');
            console.log('   2. File → New... (Ctrl+N)');
            console.log('   3. Restart Photoshop if issue persists');
            console.log('\n🧪 Manual test in DevTools Console:');
            console.log('   csInterface.evalScript("1+1", (r) => console.log(r))');
            
        } catch (e) {
            console.error('❌ Failed to parse response:', e.message);
        }
    });
}).on('error', e => {
    console.error('❌ Failed to connect to debug port:', e.message);
    console.log('\n💡 Make sure:');
    console.log('   • Photoshop is running');
    console.log('   • PlayerDebugMode is enabled (registry)');
    console.log('   • Port 8088 is not blocked');
});
