# Build and Test Instructions for PowerBI Layout Fix

## ⚠️ CRITICAL: You Must Rebuild the Application

The changes to fix the PowerBI reload issue are in **service layer files** (`powerBIEmbedRegistry.ts`) and **hooks** (`usePowerBIEmbed.ts`), which are **not always hot-reloaded** by React's development server.

## Step 1: Stop Current Development Server

If your app is currently running:

```bash
# Press Ctrl+C in the terminal to stop it
```

## Step 2: Clear Build Cache (Recommended)

```bash
# Remove node_modules/.cache to ensure clean build
rm -rf node_modules/.cache

# Or on Windows:
rmdir /s /q node_modules\.cache
```

## Step 3: Rebuild and Start

```bash
npm start
```

Wait for the build to complete and the browser to open.

## Step 4: Verify Changes Are Loaded

### A. Check Browser Console for New Logging

After the app loads, you should see these **NEW** console messages that I added:

**On Initial Load:**
```
🟢 usePowerBIEmbed EFFECT RUNNING for: report:...
  Container ref exists: true
🔍 Cache check for report:...: NOT FOUND
```

**On First PowerBI Embed:**
```
💾 Cached PowerBI embed: report:... (total: 1)
```

**On Component Unmount (when changing layouts):**
```
🧹 Cleaning up PowerBI embed: report:...
💾 Detached iframe to hidden container: report:...
```

**On Component Remount (when layout restored):**
```
🟢 usePowerBIEmbed EFFECT RUNNING for: report:...
🔍 Cache check for report:...: FOUND
♻️ Reusing cached PowerBI instance: report:...
✅ iframe already in container, no transfer needed!
```

OR:

```
📦 iframe not in container, attempting transfer...
✅ Successfully transferred iframe, no reload needed!
```

### B. If You DON'T See These Messages

Your build is NOT using the new code. Try:

1. **Hard refresh**: Ctrl+Shift+R (Windows/Linux) or Cmd+Shift+R (Mac)
2. **Clear browser cache**: Open DevTools > Network tab > Check "Disable cache"
3. **Stop server, delete cache, restart**:
   ```bash
   # Stop server (Ctrl+C)
   rm -rf node_modules/.cache
   rm -rf build
   npm start
   ```

## Step 5: Test the Fix

### Test 1: Maximize Panel

1. Open a view with PowerBI reports
2. **Open browser console** (F12 > Console tab)
3. Click **maximize button** on Reports panel
4. **Check console for:**
   - ✅ Should see "iframe already in container" or "Successfully transferred iframe"
   - ❌ Should NOT see "PowerBI instance loaded" (unless it's the first load)
5. The report should **stay loaded instantly**, no reload

### Test 2: Minimize Panel

1. While maximized, click **restore/minimize button**
2. **Check console for:**
   - ✅ Should see iframe transfer messages
   - ❌ Should NOT see "PowerBI instance loaded"
3. The report should **stay loaded instantly**

### Test 3: Change Layout Mode

1. Switch from vertical to horizontal layout (or vice versa)
2. **Check console for:**
   - ✅ Should see "Cleaning up" then "Reusing cached" then "transferred iframe"
   - ❌ Should NOT see multiple "PowerBI instance loaded"
3. Reports should **appear instantly** with no reload

## Step 6: Check Hidden Container

To verify the iframe preservation system is working:

1. Open **browser DevTools** (F12)
2. Go to **Console tab**
3. Run this command:

```javascript
document.getElementById('powerbi-detached-container')
```

4. You should see:
   ```html
   <div id="powerbi-detached-container" style="position: absolute; left: -9999px; ...">
     <!-- May contain iframes when components are unmounted -->
   </div>
   ```

5. When you maximize/minimize, check this container:
   ```javascript
   document.getElementById('powerbi-detached-container').children.length
   ```
   - Should be 0 when panels are visible (iframes in active containers)
   - May increase temporarily during layout changes

## What You Should See vs. What You Were Seeing

### Before Fix (Your Current Experience):
```
[Maximize clicked]
usePowerBIEmbed.ts:189 ✅ PowerBI instance loaded: report:...  ⟵ BAD! Creating new embed
usePowerBIEmbed.ts:194 ✅ PowerBI instance rendered: report:... ⟵ BAD! Full reload
[2-5 second delay]
```

### After Fix (What You Should See):
```
[Maximize clicked]
🟢 usePowerBIEmbed EFFECT RUNNING for: report:...              ⟵ Effect runs
🔍 Cache check for report:...: FOUND                           ⟵ Found cache!
♻️ Reusing cached PowerBI instance: report:...                 ⟵ Reusing!
✅ iframe already in container, no transfer needed!            ⟵ Already there!
[Instant, <50ms]
```

## Troubleshooting

### Issue: Still seeing "PowerBI instance loaded" events

**Cause**: Build not including new code OR changes not being used

**Solution**:
1. Verify console shows NEW log messages (listed above)
2. If not, force clean rebuild:
   ```bash
   rm -rf node_modules/.cache
   rm -rf build
   npm start
   ```
3. Hard refresh browser (Ctrl+Shift+R)

### Issue: Console shows "⚠️ Transfer failed"

**Cause**: iframe got lost somehow (rare)

**Solution**: This is a fallback case. The system will create a new embed. If this happens frequently, there's a deeper issue.

### Issue: Multiple embeds being created

**Cause**: React StrictMode in development causes double-mount

**Solution**: This is normal in development. In production build, this won't happen.

### Issue: No console messages at all

**Cause**: Console is filtered

**Solution**: 
1. Clear console filters
2. Make sure "Verbose" level is enabled
3. Check that console isn't paused on exceptions

## Expected Performance

| Operation | Before Fix | After Fix |
|-----------|-----------|-----------|
| Maximize panel | 2-5s reload | <50ms instant |
| Minimize panel | 2-5s reload | <50ms instant |
| Layout change | 2-5s reload | <50ms instant |
| Switch tabs | 0ms (already fixed) | 0ms |

## File Changes Summary

If you want to manually verify the changes are present:

1. **`src/services/powerBIEmbedRegistry.ts`**
   - Should have `hiddenContainer` in constructor
   - Should have `transfer()` method that moves iframes
   - Should have `detach()` method that preserves iframes
   - Should have `getIframe()` helper method

2. **`src/hooks/usePowerBIEmbed.ts`**
   - Cleanup function should call `powerBIEmbedRegistry.detach(embedKey)`
   - Mount logic should call `powerBIEmbedRegistry.transfer(embedKey, containerRef.current)`
   - Should check for existing iframe before transfer

You can verify by opening these files and searching for "detach" or "transfer".

## Next Steps After Successful Test

Once you confirm the fix is working:

1. Test all scenarios in `TESTING_CHECKLIST.md`
2. Test with multiple reports/widgets
3. Test with different layout configurations
4. Deploy to staging/production

## Support

If you're still seeing reloads after following these steps:

1. **Capture full console output** including all logs
2. **Check browser Network tab** for PowerBI API calls
3. **Verify files were modified** by checking git diff
4. **Share console logs** so I can debug further
