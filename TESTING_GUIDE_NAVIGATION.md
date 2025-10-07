# Testing Guide: Navigation Collapse & Popup Features

## How to Test the Features

### Feature 1: Collapse Button Visibility Based on Orientation

#### Test Case 1: Navigation Docked LEFT or RIGHT (Vertical)
**Expected**: Collapse button **VISIBLE** ✅

**Steps**:
1. Open the app
2. Look at navigation panel header
3. **Expected**: Hamburger menu (collapse button) is visible
4. Click the hamburger button
5. **Expected**: Navigation collapses to icons
6. Console should show:
   ```
   📍 Navigation panel - Position: left, Orientation: vertical, Dimensions: 250x600
   ```

#### Test Case 2: Navigation Docked TOP or BOTTOM (Horizontal)
**Expected**: Collapse button **HIDDEN** ❌

**Steps**:
1. Drag navigation panel to top or bottom of screen
2. Look at navigation panel header
3. **Expected**: Hamburger menu (collapse button) is NOT visible
4. Navigation stays expanded
5. Console should show:
   ```
   📍 Navigation panel - Position: left, Orientation: horizontal, Dimensions: 800x60
   🔼 Forcing expand - horizontal orientation (docked top/bottom)
   ```

---

### Feature 2: Smart Popup Positioning

#### Test Case 3: Navigation on LEFT → Popup on RIGHT
**Expected**: Popup appears to the RIGHT of navigation

**Steps**:
1. Ensure navigation is docked on left side
2. Collapse navigation (click hamburger button)
3. Hover over a view group icon
4. **Expected**: Popup appears to the **RIGHT** of the icon
5. Popup should be fully visible, not cut off

#### Test Case 4: Navigation on RIGHT → Popup on LEFT
**Expected**: Popup appears to the LEFT of navigation

**Steps**:
1. Drag navigation panel to right side of screen
2. Collapse navigation (click hamburger button)
3. Hover over a view group icon
4. **Expected**: Popup appears to the **LEFT** of the icon
5. Popup should be fully visible, not cut off by screen edge
6. Console should show:
   ```
   📍 Navigation panel - Position: right, Orientation: vertical
   ```

---

## Debugging

### If Collapse Button is Always Visible

**Check**:
1. Open browser console (F12)
2. Look for this log: `📍 Navigation panel - Position: X, Orientation: Y, Dimensions: WxH`
3. If orientation shows "horizontal" but button is still visible:
   - The layout might not have regenerated
   - Try moving the panel to force a refresh

**Verify State**:
```javascript
// In browser console, run:
// Check if orientation state is updating
```

### If Popup Appears on Wrong Side

**Check**:
1. Look for console log: `📍 Navigation panel - Position: left/right`
2. Verify the position detection matches where panel actually is
3. If panel is on right but position says "left":
   - Panel center might be in left half of viewport
   - Try making panel narrower or moving it further right

**Manual Test**:
```javascript
// In browser console:
const navPanel = document.querySelector('.dock-panel');
const rect = navPanel.getBoundingClientRect();
console.log('Panel position:', rect.left, rect.right);
console.log('Viewport width:', window.innerWidth);
console.log('Panel center:', rect.left + rect.width / 2);
```

---

## Expected Console Logs

### On App Load (Navigation on Left)
```
Found navigation panel, setting up resize observer
Navigation panel width: 250px, collapsed: false, orientation: vertical
📍 Navigation panel - Position: left, Orientation: vertical, Dimensions: 250x600
```

### When Dragging to Right
```
📍 Navigation panel - Position: right, Orientation: vertical, Dimensions: 250x600
```

### When Dragging to Top
```
📍 Navigation panel - Position: left, Orientation: horizontal, Dimensions: 800x60
🔼 Forcing expand - horizontal orientation (docked top/bottom)
```

### When Clicking Collapse (Vertical Orientation)
```
Navigation panel width: 45px, collapsed: true, orientation: vertical
```

### When Clicking Collapse (Horizontal Orientation)
```
⚠️ Collapse/expand only works when navigation is docked left/right (vertical orientation)
```

---

## What Should Happen

| Panel Position | Orientation | Collapse Button | Popup Side | Result |
|----------------|-------------|----------------|------------|--------|
| **Left** | Vertical | ✅ Visible | Right → | Works ✅ |
| **Right** | Vertical | ✅ Visible | ← Left | Works ✅ |
| **Top** | Horizontal | ❌ Hidden | Right → | Button gone ✅ |
| **Bottom** | Horizontal | ❌ Hidden | Right → | Button gone ✅ |

---

## Implementation Summary

### Code Flow

1. **Detection Runs**:
   - On mount (with retries at 100ms, 500ms, 1000ms)
   - On ResizeObserver trigger
   - On layout change

2. **State Updates**:
   ```
   detectNavigationPositionAndOrientation()
     ├─> setNavPanelPosition('left' | 'right')
     └─> setNavPanelOrientation('vertical' | 'horizontal')
   ```

3. **Layout Regenerates**:
   ```
   navPanelOrientation changes
     ├─> generateDynamicLayout() called
     └─> DockTabFactory.createNavigationTab() called
           └─> Collapse button shown/hidden based on navOrientation
   ```

4. **Collapse Logic**:
   ```
   handleToggleCollapse()
     └─> if (navPanelOrientation !== 'vertical') return; // Blocked!
   ```

5. **Popup Positioning**:
   ```
   handleViewGroupHover()
     └─> if (popupPosition === 'right') {
           position.x = rect.left - POPUP_WIDTH - 10; // Left side
         } else {
           position.x = rect.right + 10; // Right side
         }
   ```

---

## Files Changed

1. **DashboardDock.tsx**:
   - Added `navPanelOrientation` state
   - Added `detectNavigationPositionAndOrientation()` function
   - Added initial detection with retries
   - Updated collapse logic to use orientation
   - Passing `navPanelOrientation` to layout manager

2. **DockLayoutManager.tsx**:
   - Added `navPanelOrientation` prop
   - Passing to `createNavigationTab()`
   - Added to dependencies

3. **DockTabFactory.tsx**:
   - Added `navOrientation` parameter
   - Conditionally render collapse button: `{navOrientation === 'vertical' && ( ... )}`

4. **CollapsedNavigationPanel.tsx**:
   - Receives `popupPosition` prop
   - Calculates popup position based on dock side

5. **ViewGroupHoverPopup.tsx**:
   - Receives `dockPosition` prop
   - Used for any additional positioning logic

---

## Troubleshooting

### Problem: Button still visible when horizontal
**Solution**: Clear cache and hard reload (Ctrl+Shift+R)

### Problem: Orientation not detected
**Solution**: Check console for detection logs

### Problem: Popup still goes off-screen
**Solution**: 
1. Check console for position detection
2. Verify `popupPosition` prop is passed correctly
3. Check if POPUP_WIDTH (280px) needs adjustment

---

## Quick Test Checklist

- [ ] App loads with navigation on left
- [ ] Console shows: `Position: left, Orientation: vertical`
- [ ] Collapse button is visible
- [ ] Click collapse → Panel collapses
- [ ] Hover view group → Popup appears on right
- [ ] Drag panel to right side
- [ ] Console shows: `Position: right, Orientation: vertical`
- [ ] Hover view group → Popup appears on left
- [ ] Drag panel to top
- [ ] Console shows: `Orientation: horizontal`
- [ ] Collapse button disappears
- [ ] Panel stays expanded

---

**Status**: All features implemented and committed  
**Latest Commit**: 64bbaae  
**Files Modified**: 3  
**Ready for Testing**: Yes ✅