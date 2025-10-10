# Layout Persistence System

## Overview

The Layout Persistence System provides a robust mechanism for saving and restoring user layout customizations while automatically resetting to defaults when the layout structure changes.

## How It Works

### 1. Layout Signatures

A **layout signature** is a unique string that represents the current state of visible panels. The signature is generated based on:

- Which view is selected (if any)
- Which panels are visible (reports, widgets, welcome)
- Whether the navigation is collapsed
- The layout mode (horizontal or vertical)

**Example Signatures:**
```
nav+welcome-noview+horizontal          # No view selected
nav+reports+widgets+horizontal         # View with both reports and widgets
nav-collapsed+reports+vertical         # Collapsed nav, only reports, vertical
nav+welcome-empty+horizontal           # View selected but no content
```

### 2. Persistence Flow

#### When User Customizes Layout:
```
User resizes panel
    ↓
Layout change detected
    ↓
Current signature identified
    ↓
Layout saved with signature
    ↓
Stored in sessionStorage
```

#### When User Changes View/Panels:
```
User selects different view
    ↓
New signature generated
    ↓
Compare with previous signature
    ↓
Signature changed?
    ├─ Yes → Load saved layout for new signature (or default if none exists)
    └─ No → Update content only (preserve layout)
```

## Architecture

### Core Components

#### 1. `layoutPersistenceService.ts`
Main service for managing layout persistence.

**Key Functions:**
- `generateLayoutSignature()` - Creates signature from current state
- `saveLayout()` - Saves layout for a signature
- `loadLayout()` - Loads layout for a signature
- `clearAllLayouts()` - Resets all customizations

#### 2. `DashboardDock.tsx` Integration
The dashboard component uses the service to:
- Compute current signature
- Detect signature changes
- Save layouts on user changes
- Restore layouts when signature matches

### State Management

**Key State Variables:**
```typescript
const [currentSignature, setCurrentSignature] = useState<LayoutSignature>("");
const previousSignatureRef = useRef<LayoutSignature>("");
```

**Signature Computation:**
```typescript
const computeCurrentSignature = useCallback((): LayoutSignature => {
  const hasReports = selectedView?.reportIds?.length > 0;
  const hasWidgets = selectedView?.widgetIds?.length > 0;

  return generateLayoutSignature({
    selectedView: !!selectedView,
    hasReports: !!hasReports,
    hasWidgets: !!hasWidgets,
    reportsVisible,
    widgetsVisible,
    layoutMode,
    isDockCollapsed,
  });
}, [selectedView, reportsVisible, widgetsVisible, layoutMode, isDockCollapsed]);
```

## Storage Structure

### SessionStorage Schema

```json
{
  "layoutCustomizations_admin": {
    "userId": "admin",
    "layouts": {
      "nav+reports+widgets+horizontal": {
        "signature": "nav+reports+widgets+horizontal",
        "timestamp": 1697234567890,
        "layout": {
          "dockbox": {
            "mode": "horizontal",
            "children": [...]
          }
        }
      },
      "nav+reports+vertical": {
        "signature": "nav+reports+vertical",
        "timestamp": 1697234567891,
        "layout": {...}
      }
    }
  }
}
```

### Key Points:
- User-specific storage (different users have different keys)
- Each signature stores its own layout
- Timestamp for cleanup of old layouts
- Full RC-Dock layout data preserved

## Usage Examples

### Example 1: User Workflow

**Scenario:** User has a view with both reports and widgets

1. **Initial Load:**
   ```
   Signature: "nav+reports+widgets+horizontal"
   No saved layout → Default layout generated
   ```

2. **User Resizes Panels:**
   ```
   User drags panel divider
   Layout change event fires
   Layout saved with signature "nav+reports+widgets+horizontal"
   ```

3. **User Closes Widgets Panel:**
   ```
   New signature: "nav+reports+horizontal"
   No saved layout for this signature → Default layout generated
   Layout resets to default
   ```

4. **User Reopens Widgets:**
   ```
   Signature returns to: "nav+reports+widgets+horizontal"
   Saved layout exists → Restored with user's previous customizations
   ```

### Example 2: Different Views

```javascript
// View A: Reports + Widgets
Signature: "nav+reports+widgets+horizontal"
User customizes: Reports 60%, Widgets 40%
Saved ✓

// User switches to View B: Only Reports
Signature: "nav+reports+horizontal"
No saved layout → Default generated
Layout resets ✓

// User customizes View B
Reports panel resized
Saved with signature "nav+reports+horizontal" ✓

// User switches back to View A
Signature: "nav+reports+widgets+horizontal"
Saved layout loaded → Reports 60%, Widgets 40% ✓
```

## API Reference

### `generateLayoutSignature(params)`
Generates a unique signature for the current layout state.

**Parameters:**
```typescript
{
  selectedView: boolean,
  hasReports: boolean,
  hasWidgets: boolean,
  reportsVisible: boolean,
  widgetsVisible: boolean,
  layoutMode: "horizontal" | "vertical",
  isDockCollapsed: boolean
}
```

**Returns:** `LayoutSignature` (string)

### `layoutPersistenceService.saveLayout(userId, signature, layout)`
Saves a layout for a specific signature.

**Parameters:**
- `userId` - User identifier
- `signature` - Layout signature
- `layout` - RC-Dock LayoutData object

### `layoutPersistenceService.loadLayout(userId, signature)`
Loads a saved layout for a signature.

**Parameters:**
- `userId` - User identifier
- `signature` - Layout signature

**Returns:** `LayoutData | null`

### `layoutPersistenceService.clearAllLayouts(userId)`
Clears all saved layouts for a user.

**Parameters:**
- `userId` - User identifier

## Advanced Features

### Layout Export/Import

```typescript
// Export layouts (for backup)
const layoutsJson = layoutPersistenceService.exportLayouts(userId);
localStorage.setItem('backup', layoutsJson);

// Import layouts (restore from backup)
const backup = localStorage.getItem('backup');
layoutPersistenceService.importLayouts(userId, backup);
```

### Cleanup Old Layouts

```typescript
// Remove layouts older than 30 days
layoutPersistenceService.cleanupOldLayouts(userId, 30);
```

### Get All Saved Signatures

```typescript
const signatures = layoutPersistenceService.getSavedSignatures(userId);
console.log('User has customized:', signatures);
// ["nav+reports+widgets+horizontal", "nav+reports+vertical", ...]
```

## Benefits

✅ **User Customizations Persist** - Panel sizes, positions preserved  
✅ **Automatic Reset on Structure Change** - No broken layouts  
✅ **Per-Configuration Customization** - Different layouts for different states  
✅ **User-Specific** - Each user has their own layouts  
✅ **Session Persistence** - Survives page reloads  
✅ **Easy to Debug** - Clear console logging  
✅ **Easy to Reset** - One function call clears all

## Debugging

### Enable Detailed Logging

The service includes console logging:
```
🔍 Layout Check - Current: "nav+reports+horizontal", Previous: "nav+welcome", Changed: true
🔄 Layout signature changed: "nav+welcome" → "nav+reports+horizontal"
📂 Layout loaded for signature: "nav+reports+horizontal"
💾 Layout saved for signature: "nav+reports+widgets+horizontal"
```

### Inspect Saved Layouts

```javascript
// In browser console
const userId = 'admin';
const key = `layoutCustomizations_${userId}`;
const data = JSON.parse(sessionStorage.getItem(key));
console.log('Saved layouts:', data);
```

### Reset User Layouts

```typescript
// Programmatically
layoutPersistenceService.clearAllLayouts('admin');

// Via UI component
<LayoutResetButton user={user} />
```

## Best Practices

1. **Signature Stability** - Keep signature logic consistent
2. **Content Refresh** - Always update panel content when loading saved layouts
3. **Debounced Saving** - Use timeouts to avoid excessive saves
4. **Error Handling** - Service has try-catch for storage errors
5. **User Control** - Provide reset option via UI

## Future Enhancements

- [ ] Store in localStorage for longer persistence
- [ ] Backend API integration for cross-device sync
- [ ] Layout presets/templates
- [ ] Undo/redo for layout changes
- [ ] Layout sharing between users
- [ ] Automatic backup to cloud

## Troubleshooting

### Layout Not Saving
- Check browser console for errors
- Verify sessionStorage is not disabled
- Check signature is being generated correctly

### Layout Not Restoring
- Verify signature matches exactly
- Check saved layout exists in sessionStorage
- Ensure content update logic is working

### Layout Resets Unexpectedly
- Check if signature is changing when it shouldn't
- Verify state dependencies in `computeCurrentSignature`
- Review console logs for signature changes

## Related Files

- `/src/services/layoutPersistenceService.ts` - Main service
- `/src/components/dashboard/DashboardDock.tsx` - Integration
- `/src/components/dashboard/LayoutResetButton.tsx` - Reset UI component
- `/docs/LAYOUT_PERSISTENCE.md` - This documentation
