# Navigation Smart Collapse/Expand Features

## Overview
Enhanced navigation panel collapse/expand functionality with intelligent behavior based on layout mode, panel width, and dock position.

## Features Implemented

### 1. Layout Mode Lock 🔒
**Feature**: Collapse/expand only works in vertical layout mode

**Behavior**:
- ✅ **Vertical Mode**: Full collapse/expand functionality enabled
- ❌ **Horizontal Mode**: Collapse/expand locked, always shows expanded

**Why**: In horizontal layouts, collapsing navigation doesn't make sense as panels are side-by-side. Vertical layouts benefit from space-saving collapsed state.

**Implementation**:
```typescript
// Manual toggle - only works in vertical mode
const handleToggleCollapse = useCallback(() => {
  if (layoutMode !== 'vertical') {
    console.log('⚠️ Collapse/expand only works in vertical layout mode');
    return;
  }
  
  isManualToggleRef.current = true;
  setIsDockCollapsed(prev => !prev);
}, [layoutMode]);

// Auto-expand in horizontal mode
if (layoutMode === 'vertical') {
  // Allow auto-collapse/expand based on width
} else {
  // In horizontal mode, always show expanded
  if (isDockCollapsed) {
    console.log(`🔼 Forcing expand in horizontal mode`);
    setIsDockCollapsed(false);
  }
}
```

### 2. Width-Based Force Expand 📏
**Feature**: Automatically expand navigation when width exceeds threshold

**Constant**: `NAVIGATION_FORCE_EXPAND_WIDTH = 200px`

**Behavior**:
- If navigation panel width ≥ 200px → Force expand (regardless of mode or state)
- If width < 200px → Allow collapse (only in vertical mode)

**Why**: When there's enough space (200px+), showing full navigation provides better UX than collapsed icons.

**Implementation**:
```typescript
// Force expand if width is above threshold (regardless of mode)
if (width >= LAYOUT_SIZES.NAVIGATION_FORCE_EXPAND_WIDTH && isDockCollapsed) {
  console.log(`🔼 Force expanding: width ${width}px >= ${LAYOUT_SIZES.NAVIGATION_FORCE_EXPAND_WIDTH}px`);
  setIsDockCollapsed(false);
  return;
}
```

### 3. Smart Popup Positioning 🎯
**Feature**: Hover popups appear on the correct side based on dock position

**Behavior**:
- **Navigation on LEFT** → Popup appears on RIGHT
- **Navigation on RIGHT** → Popup appears on LEFT

**Why**: Prevents popups from going off-screen when navigation is docked on the right side.

**Detection**:
```typescript
const detectNavigationPosition = useCallback(() => {
  const navPanel = findNavigationPanel();
  if (!navPanel) return;

  const rect = navPanel.getBoundingClientRect();
  const viewportWidth = window.innerWidth;
  const panelCenterX = rect.left + rect.width / 2;
  
  // If panel center is in left half of viewport, it's on the left
  const position = panelCenterX < viewportWidth / 2 ? 'left' : 'right';
  setNavPanelPosition(position);
}, [findNavigationPanel]);
```

**Popup Positioning**:
```typescript
const POPUP_WIDTH = 280; // Approximate popup width

if (popupPosition === 'right') {
  // Panel on right side - show popup on left
  position = {
    x: rect.left - POPUP_WIDTH - 10, // 10px gap
    y: rect.top,
  };
} else {
  // Panel on left side - show popup on right (default)
  position = {
    x: rect.right + 10, // 10px gap
    y: rect.top,
  };
}
```

## Constants Added

```typescript
// src/constants/layout.ts
export const LAYOUT_SIZES = {
  // ... existing constants
  NAVIGATION_FORCE_EXPAND_WIDTH: 200, // Above this width, always show expanded
};
```

## Component Changes

### DashboardDock.tsx
**New State**:
```typescript
const [navPanelPosition, setNavPanelPosition] = useState<'left' | 'right'>('left');
```

**New Functions**:
- `detectNavigationPosition()` - Detects if nav panel is on left or right
- Enhanced `handleToggleCollapse()` - Checks layout mode before allowing toggle
- Enhanced ResizeObserver - Checks mode and width thresholds

**Props Passed**:
```typescript
<CollapsedNavigationPanel
  // ... other props
  popupPosition={navPanelPosition}
/>
```

### CollapsedNavigationPanel.tsx
**New Props**:
```typescript
interface CollapsedNavigationPanelProps {
  // ... existing props
  popupPosition?: 'left' | 'right';
}
```

**Enhanced Hover Handler**:
```typescript
const handleViewGroupHover = (viewGroup: ViewGroup, event: React.MouseEvent) => {
  // ... timeout handling
  
  const rect = event.currentTarget.getBoundingClientRect();
  const POPUP_WIDTH = 280;
  
  let position;
  if (popupPosition === 'right') {
    position = { x: rect.left - POPUP_WIDTH - 10, y: rect.top };
  } else {
    position = { x: rect.right + 10, y: rect.top };
  }
  
  setHoveredViewGroup(viewGroup.id);
  setHoverPosition(position);
};
```

### ViewGroupHoverPopup.tsx
**New Props**:
```typescript
interface ViewGroupHoverPopupProps {
  // ... existing props
  dockPosition?: 'left' | 'right';
}
```

## Test Scenarios

### Scenario 1: Layout Mode Lock
**Test**: Switch between horizontal and vertical layouts

**Horizontal Mode**:
1. Start in horizontal mode
2. Try clicking collapse button → Should not work (locked)
3. Panel remains expanded
4. Console shows: "⚠️ Collapse/expand only works in vertical layout mode"

**Vertical Mode**:
1. Switch to vertical mode
2. Click collapse button → Should work
3. Panel collapses to icons
4. Click expand button → Panel expands

✅ **Expected**: Collapse only works in vertical mode

### Scenario 2: Width-Based Force Expand
**Test**: Resize navigation panel width

**Steps**:
1. Set layout to vertical mode
2. Collapse navigation panel
3. Resize navigation panel width to 250px
4. Panel should auto-expand (width > 200px threshold)
5. Try to collapse again → Should work
6. Resize to 180px → Should stay collapsed
7. Resize to 205px → Should auto-expand again

✅ **Expected**: Panel auto-expands when width ≥ 200px

### Scenario 3: Smart Popup Positioning - Left Side
**Test**: Navigation panel on left side of screen

**Steps**:
1. Ensure navigation is on left (default position)
2. Collapse navigation panel
3. Hover over a view group icon
4. Popup should appear on the RIGHT side of the icon
5. Popup should not go off-screen

✅ **Expected**: Popup appears on right, fully visible

### Scenario 4: Smart Popup Positioning - Right Side
**Test**: Navigation panel on right side of screen

**Steps**:
1. Drag navigation panel to right side of screen
2. Collapse navigation panel
3. Hover over a view group icon
4. Popup should appear on the LEFT side of the icon
5. Popup should not go off-screen

✅ **Expected**: Popup appears on left, fully visible

### Scenario 5: Combined Behavior
**Test**: All features working together

**Steps**:
1. Start in vertical mode with navigation on left
2. Collapse navigation → Works ✅
3. Hover view group → Popup on right ✅
4. Resize panel to 250px → Auto-expands ✅
5. Drag panel to right side → Position detected ✅
6. Collapse again → Works ✅
7. Hover view group → Popup on left ✅
8. Switch to horizontal mode → Auto-expands ✅
9. Try to collapse → Blocked (mode lock) ✅

✅ **Expected**: All features work harmoniously

## Benefits

### 1. Better UX
- ✅ Intuitive behavior based on context
- ✅ Prevents off-screen popups
- ✅ Automatic space optimization

### 2. Smart Defaults
- ✅ Horizontal mode always expanded (makes sense)
- ✅ Wide panels always expanded (enough space)
- ✅ Popups always visible (smart positioning)

### 3. Flexible
- ✅ Works in any dock layout configuration
- ✅ Adapts to panel repositioning
- ✅ Respects manual user actions

### 4. Performance
- ✅ Position detection on resize/layout change only
- ✅ Efficient DOM queries
- ✅ Proper cleanup and debouncing

## Edge Cases Handled

### 1. Rapid Layout Switches
- Layout mode changes are debounced
- State transitions are smooth
- No glitchy behavior

### 2. Manual Overrides
- User manual toggles set flag to prevent auto-behavior
- Flag resets after 300ms
- Respects user intent

### 3. Maximized State
- Maximized panels always expand
- Works with force expand threshold
- Proper state restoration on minimize

### 4. Floating Panels
- Position detection excludes floating panels
- Popup positioning uses parent container
- Works in all floating states

## Statistics

**Files Changed**: 4
- `DashboardDock.tsx`: +62 lines
- `CollapsedNavigationPanel.tsx`: +24 lines
- `ViewGroupHoverPopup.tsx`: +3 lines
- `layout.ts`: +1 line

**Total**: 90 insertions, 18 deletions

## Future Enhancements

1. **Configurable Thresholds**: Make width thresholds user-configurable
2. **Animation Transitions**: Add smooth transitions when auto-expanding
3. **Popup Smart Sizing**: Adjust popup width based on available space
4. **Persistence**: Remember user's preferred mode/position
5. **Multi-Monitor Support**: Detect monitor boundaries for popup positioning

---

**Status**: ✅ Complete and tested  
**Breaking Changes**: None  
**Migration Required**: No  
**Backward Compatible**: Yes