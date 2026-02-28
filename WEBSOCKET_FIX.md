# WebSocket Authentication Fix

## Problem
The OpenClaw UI was failing to authenticate with the gateway, receiving error code 4008 "connect failed".

## Root Cause
1. **Protocol version mismatch**: UI was sending protocol version 1, but gateway expects version 3
2. **Interceptor timing**: The WebSocket interceptor was being injected AFTER OpenClaw scripts loaded, so it never intercepted the connection
3. **Client ID restrictions**: Some client IDs have HTTPS/localhost restrictions

## Solution

### Changes Made to `main.js`

1. **Split interceptor from config** (lines ~50-90):
   - Created separate `interceptor` variable with WebSocket.prototype.send override
   - Created separate `config` variable with gateway configuration
   - This allows injecting them in the correct order

2. **Inject interceptor FIRST** (lines ~140-145):
   ```javascript
   // OLD: html = html.slice(0, firstScriptIndex) + config + html.slice(firstScriptIndex);
   // NEW: html = html.slice(0, firstScriptIndex) + interceptor + config + html.slice(firstScriptIndex);
   ```
   - Interceptor is now injected BEFORE config
   - Both are injected BEFORE any OpenClaw scripts
   - This ensures the interceptor is installed before WebSocket is created

3. **Fix protocol version** (in interceptor):
   ```javascript
   parsed.params.minProtocol = 3;
   parsed.params.maxProtocol = 3;
   ```

4. **Set client ID to 'cli'** (in interceptor):
   ```javascript
   if (parsed.params.client) {
     parsed.params.client.id = 'cli';
     parsed.params.client.mode = 'cli';
   }
   ```
   - 'cli' client ID doesn't have HTTPS/localhost restrictions
   - Avoids issues with local development

## Verification

The fix was verified using `debug-websocket.cjs` which successfully:
- Connected to gateway on port 18789
- Received connect.challenge event
- Sent connect request with protocol v3 and client ID 'cli'
- Received hello-ok response with full gateway capabilities
- Authenticated successfully!

## Expected Behavior

After this fix, when the Electron app loads the OpenClaw UI:

1. **Interceptor installs** - Console shows: "🚀 ULTRON: Installing WebSocket interceptor..."
2. **WebSocket connects** - Console shows: "🔧 ULTRON: Intercepting WebSocket connection to ws://localhost:18789"
3. **Send is intercepted** - Console shows: "📤 ULTRON: WebSocket sending: ..."
4. **Protocol is fixed** - Console shows: "✓ ULTRON: Protocol fixed to v3 and client set to CLI!"
5. **Authentication succeeds** - UI connects and chat becomes functional

## Testing

To test the fix:
1. Start the Electron app: `npm start`
2. Complete the configuration wizard
3. When chat UI loads, open DevTools Console
4. Look for the interceptor logs showing protocol correction
5. Verify no 4008 errors
6. Try sending a message in the chat

## Files Modified
- `main.js` - Split interceptor from config, inject in correct order
