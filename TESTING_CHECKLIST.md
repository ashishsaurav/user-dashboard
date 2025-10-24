# PowerBI Layout Change Testing Checklist

## Overview
This checklist verifies that PowerBI reports and visuals **do not reload** during layout operations.

## Expected Behavior
- ✅ PowerBI content should appear **instantly** when layout changes
- ✅ No loading spinner should appear
- ✅ No white flash or blank screen
- ✅ Console should show "Transferred iframe to new container" message
- ✅ PowerBI state (filters, selections, scroll position) should be preserved

## Test Scenarios

### 1. Layout Mode Changes
- [ ] **Change to Horizontal Layout**
  1. Open a view with reports
  2. Change layout mode from vertical to horizontal
  3. ✅ Reports should stay loaded, no reload
  
- [ ] **Change to Vertical Layout**
  1. While in horizontal layout
  2. Change back to vertical layout
  3. ✅ Reports should stay loaded, no reload

### 2. Panel Maximize/Minimize
- [ ] **Maximize Reports Panel**
  1. Open a view with reports
  2. Click maximize button on Reports panel
  3. ✅ Report should remain loaded during maximize
  
- [ ] **Restore from Maximize**
  1. While Reports panel is maximized
  2. Click restore button
  3. ✅ Report should remain loaded during restore
  
- [ ] **Maximize Widgets Panel**
  1. Open a view with widgets
  2. Click maximize button on Widgets panel
  3. ✅ Widgets should remain loaded during maximize

- [ ] **Maximize Navigation Panel**
  1. Click maximize on navigation panel
  2. ✅ When restored, reports/widgets should still be loaded

### 3. Panel Close/Reopen
- [ ] **Close and Reopen Reports**
  1. Open a view with reports
  2. Close the Reports section (X button)
  3. Click "Show Reports" or reopen the section
  4. ✅ Reports should appear instantly from cache
  
- [ ] **Close and Reopen Widgets**
  1. Open a view with widgets
  2. Close the Widgets section
  3. Reopen the Widgets section
  4. ✅ Widgets should appear instantly from cache

### 4. RC-Dock Operations
- [ ] **Drag Panel to Different Position**
  1. Open a view with reports
  2. Drag Reports panel to a different dock position
  3. ✅ Reports should remain loaded during drag
  
- [ ] **Float Panel as Window**
  1. Right-click on panel tab
  2. Select "Float" (if available)
  3. ✅ Reports should remain loaded when floated
  
- [ ] **Dock Floating Panel**
  1. Drag floating panel back to dock area
  2. ✅ Reports should remain loaded when docked

### 5. Navigation Operations
- [ ] **Collapse/Expand Navigation**
  1. Open a view with reports
  2. Collapse navigation panel
  3. ✅ Reports should remain visible and loaded
  4. Expand navigation panel
  5. ✅ Reports should still be loaded
  
- [ ] **Switch Between Views** (SHOULD reload - different content)
  1. Open View A with specific reports
  2. Switch to View B with different reports
  3. ✅ View B reports should load (this is correct behavior)
  4. Switch back to View A
  5. ✅ View A reports should appear from cache (instant)

### 6. Reorder Operations (from previous fix)
- [ ] **Reorder Reports**
  1. Open a view with multiple reports
  2. Drag a report to reorder it
  3. ✅ Reports should NOT reload during reorder
  
- [ ] **Reorder Widgets**
  1. Open a view with multiple widgets
  2. Drag a widget to reorder it
  3. ✅ Widgets should NOT reload during reorder

### 7. Resize Operations
- [ ] **Resize Panel Width**
  1. Open a view with reports
  2. Drag the divider to resize panel width
  3. ✅ Reports should remain loaded
  
- [ ] **Resize Panel Height**
  1. In horizontal layout
  2. Drag divider to resize panel height
  3. ✅ Reports should remain loaded

### 8. Multiple Reports Scenario
- [ ] **Multiple Reports in Same View**
  1. Open a view with 3+ reports
  2. Maximize the Reports panel
  3. ✅ All reports should remain loaded
  4. Restore the panel
  5. ✅ All reports should still be loaded
  
- [ ] **Switch Active Report Tab**
  1. Open a view with multiple reports
  2. Click between report tabs
  3. ✅ Each report should appear instantly (cached)

### 9. Edge Cases
- [ ] **Rapid Layout Changes**
  1. Quickly toggle between horizontal/vertical several times
  2. ✅ Reports should remain stable, no reloads
  
- [ ] **Multiple Maximize/Restore Cycles**
  1. Maximize Reports panel
  2. Restore it
  3. Maximize again
  4. Restore again
  5. ✅ Reports should never reload
  
- [ ] **Complex Layout Manipulation**
  1. Start with vertical layout
  2. Maximize Reports
  3. Change to horizontal layout (while maximized)
  4. Restore panel
  5. Change back to vertical
  6. ✅ Reports should remain loaded through entire sequence

### 10. Token Refresh Scenario
- [ ] **Long Session (Token Expiry)**
  1. Open a view with reports
  2. Wait for token to near expiration (55 minutes)
  3. Perform layout change
  4. ✅ Report should refresh token silently
  5. ✅ No visible reload

## Console Verification

### Success Messages to Watch For
```
✅ Transferred iframe to new container: report:workspace:report:page
💾 Detached iframe to hidden container: report:workspace:report:page
♻️  Reusing cached PowerBI instance: report:workspace:report:page
```

### Warning Messages (Should NOT appear frequently)
```
⚠️ Iframe missing, re-embedding to new container
⚠️ Transfer failed, will create new embed
```

If you see these warnings, the iframe preservation failed.

## Browser DevTools Verification

### Hidden Container Check
1. Open DevTools (F12)
2. Go to Console tab
3. Run: `document.getElementById('powerbi-detached-container')`
4. ✅ Should exist and contain iframes when panels are unmounted

### Network Tab
1. Open DevTools Network tab
2. Filter for "embed" or PowerBI requests
3. Perform layout changes
4. ✅ Should NOT see new embed token requests (unless token expired)

### Performance Check
1. Open DevTools Performance tab
2. Start recording
3. Perform layout change (e.g., maximize panel)
4. Stop recording
5. ✅ Should see appendChild() operations, NOT iframe creation

## Regression Tests

### Ensure Previous Fixes Still Work
- [ ] **Reorder Reports** (from POWERBI_REORDER_FIX.md)
  - Drag-and-drop reports should not reload
  
- [ ] **Reorder Widgets** (from POWERBI_REORDER_FIX.md)
  - Drag-and-drop widgets should not reload
  
- [ ] **Theme Toggle**
  - Switching between light/dark theme should not reload PowerBI
  
- [ ] **View Selection**
  - Selecting a view should load its content
  - Re-selecting same view should use cache

## Performance Metrics

### Measure Before/After
| Operation | Before Fix | After Fix | Target |
|-----------|-----------|-----------|--------|
| Maximize panel | 2-5s reload | <50ms | <100ms |
| Layout mode change | 2-5s reload | <50ms | <100ms |
| Close/reopen panel | 2-5s reload | <50ms | <100ms |
| Reorder reports | 0ms (fixed) | 0ms | 0ms |

## Known Issues / Limitations

### Expected Behavior
- **Switching views**: WILL reload (different content) - This is correct
- **First load**: WILL show loading spinner - This is correct
- **Network error**: MAY reload if token fetch fails - This is correct

### Not Covered by This Fix
- Page navigation within PowerBI report (handled by PowerBI SDK)
- PowerBI refresh button (user-initiated reload)
- PowerBI error recovery (automatic retry)

## Debugging Failed Tests

### If Reports Still Reload

1. **Check Console for iframe Transfer Messages**
   - Should see "Transferred iframe to new container"
   - If you see "Iframe missing, re-embedding", the transfer failed

2. **Check Hidden Container**
   ```javascript
   // In console
   document.getElementById('powerbi-detached-container').children.length
   ```
   - Should be 0 when all panels are visible
   - Should increase when panels unmount

3. **Check Registry State**
   - Look for "Detached iframe to hidden container" messages
   - Verify cleanup is called on unmount

4. **Verify React.memo Still Active**
   - Check for "PowerBIEmbedReport RENDER" messages
   - Should only see on props change, not layout change

### Common Issues

1. **Browser Extension Interference**
   - Disable ad blockers and test again
   
2. **React StrictMode Double-Mount**
   - This is expected in development, won't happen in production
   
3. **Concurrent Layout Changes**
   - Rapid changes might queue multiple transfers
   - Should still work, just slower

## Sign-Off

- [ ] All test scenarios passed
- [ ] Console shows expected messages
- [ ] No unexpected reloads observed
- [ ] Performance meets targets
- [ ] No regressions in existing features

**Tested By**: _________________  
**Date**: _________________  
**Browser**: _________________  
**Notes**: _________________
