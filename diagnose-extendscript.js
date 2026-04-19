// Diagnose and fix ExtendScript communication issue
const WebSocket = require('ws');

const wsUrl = 'ws://localhost:8088/devtools/page/D49E62DB60E2828EFC9B5F49E295ED81';
console.log('🔌 Connecting to:', wsUrl);

const ws = new WebSocket(wsUrl);
let msgId = 1;

function send(method, params = {}) {
    const msg = { id: msgId++, method, params };
    console.log('📤 Send:', method);
    ws.send(JSON.stringify(msg));
}

ws.on('open', () => {
    console.log('✅ WebSocket connected\n');
    
    // Step 1: Check if CSInterface exists
    console.log('🧪 Test 1: Check CSInterface...');
    send('Runtime.evaluate', {
        expression: 'typeof CSInterface',
        returnByValue: true
    });
    
    setTimeout(() => {
        // Step 2: Check if csInterface instance exists
        console.log('\n🧪 Test 2: Check csInterface instance...');
        send('Runtime.evaluate', {
            expression: 'typeof window.csInterface',
            returnByValue: true
        });
    }, 500);
    
    setTimeout(() => {
        // Step 3: Try to call evalScript directly
        console.log('\n🧪 Test 3: Try evalScript with "1+1"...');
        send('Runtime.evaluate', {
            expression: `
                new Promise((resolve) => {
                    if (window.csInterface) {
                        window.csInterface.evalScript('1+1', (result) => {
                            resolve({ success: true, result: result });
                        });
                    } else {
                        resolve({ success: false, error: 'csInterface not found' });
                    }
                })
            `,
            awaitPromise: true,
            returnByValue: true
        });
    }, 1000);
    
    setTimeout(() => {
        // Step 4: Check if Photoshop has an active document
        console.log('\n🧪 Test 4: Check for active document...');
        send('Runtime.evaluate', {
            expression: `
                new Promise((resolve) => {
                    if (window.csInterface) {
                        window.csInterface.evalScript('app.documents.length', (result) => {
                            resolve({ docCount: result });
                        });
                    } else {
                        resolve({ error: 'csInterface not found' });
                    }
                })
            `,
            awaitPromise: true,
            returnByValue: true
        });
    }, 1500);
    
    setTimeout(() => {
        // Step 5: Try to create a new document if none exists
        console.log('\n🔧 Test 5: Attempting to create test document...');
        send('Runtime.evaluate', {
            expression: `
                new Promise((resolve) => {
                    if (window.csInterface) {
                        window.csInterface.evalScript(
                            'try { if (app.documents.length === 0) { app.documents.add(); } "created"; } catch(e) { "error: " + e; }',
                            (result) => {
                                resolve({ result: result });
                            }
                        );
                    } else {
                        resolve({ error: 'csInterface not found' });
                    }
                })
            `,
            awaitPromise: true,
            returnByValue: true
        });
    }, 2000);
    
    setTimeout(() => {
        console.log('\n✅ Diagnostic complete. Closing connection...');
        ws.close();
    }, 3000);
});

ws.on('message', (data) => {
    const msg = JSON.parse(data);
    
    if (msg.result && msg.result.result) {
        const result = msg.result.result;
        
        if (result.type === 'string') {
            console.log('   ✅ Result:', result.value);
        } else if (result.type === 'function') {
            console.log('   ✅ Result: [Function]');
        } else if (result.type === 'object' && result.value) {
            console.log('   ✅ Result:', JSON.stringify(result.value, null, 2));
        } else {
            console.log('   ⚠️  Result:', JSON.stringify(result, null, 2));
        }
    } else if (msg.error) {
        console.error('   ❌ Error:', msg.error);
    }
});

ws.on('error', (error) => {
    console.error('❌ WebSocket error:', error.message);
    process.exit(1);
});

ws.on('close', () => {
    console.log('\n🔌 WebSocket closed');
    process.exit(0);
});
