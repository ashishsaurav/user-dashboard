# Layout Persistence - Quick Reference

## 🚀 Quick Start

### For Users

**Access Layout Settings:**
1. Click Settings (gear icon) → "Layout Settings" tab
2. View saved layouts
3. Reset all layouts if needed

**How It Works:**
- Resize panels → Automatically saved
- Change views → Layout resets to default (if structure changes)
- Return to view → Custom layout restored

---

## 💻 For Developers

### Import the Service

```typescript
import { 
  layoutPersistenceService, 
  generateLayoutSignature 
} from '@/services/layoutPersistenceService';
```

### Basic Usage

```typescript
// Generate signature
const signature = generateLayoutSignature({
  selectedView: true,
  hasReports: true,
  hasWidgets: true,
  reportsVisible: true,
  widgetsVisible: true,
  layoutMode: 'horizontal',
  isDockCollapsed: false
});

// Save layout
layoutPersistenceService.saveLayout(userId, signature, layoutData);

// Load layout
const savedLayout = layoutPersistenceService.loadLayout(userId, signature);

// Clear all
layoutPersistenceService.clearAllLayouts(userId);
```

### Key Concepts

**Layout Signature** = Unique ID for each layout configuration
```
"nav+reports+widgets+horizontal"  ← Both panels visible
"nav+reports+vertical"            ← Only reports visible
"nav-collapsed+welcome+horizontal" ← Navigation collapsed
```

**When Signature Changes:**
- ✅ Layout resets to default (if no saved layout exists)
- ✅ Or restores saved layout (if one exists for new signature)

**When Signature Same:**
- ✅ Content updates in place
- ✅ Layout structure preserved

---

## 📋 Common Tasks

### Check if Layout Exists

```typescript
const exists = layoutPersistenceService.hasLayout(userId, signature);
```

### Get All Saved Layouts

```typescript
const signatures = layoutPersistenceService.getSavedSignatures(userId);
console.log(signatures);
// ["nav+reports+widgets+horizontal", "nav+reports+vertical", ...]
```

### Export/Import

```typescript
// Export
const backup = layoutPersistenceService.exportLayouts(userId);
localStorage.setItem('layoutBackup', backup);

// Import
const backup = localStorage.getItem('layoutBackup');
layoutPersistenceService.importLayouts(userId, backup);
```

### Cleanup Old Layouts

```typescript
// Remove layouts older than 30 days
layoutPersistenceService.cleanupOldLayouts(userId, 30);
```

---

## 🐛 Debugging

### Check Console Logs

Look for these emoji indicators:
- 🔍 = Layout check/comparison
- 🔄 = Signature changed
- ✅ = Saved layout restored
- 🆕 = Default layout generated
- 💾 = Layout saved
- 📂 = Layout loaded
- 📭 = No saved layout found

### Inspect SessionStorage

```javascript
// In browser console
const userId = 'admin';
const key = `layoutCustomizations_${userId}`;
const data = JSON.parse(sessionStorage.getItem(key));
console.table(Object.keys(data.layouts));
```

### Force Reset

```typescript
// Programmatically
layoutPersistenceService.clearAllLayouts(userId);
window.location.reload();

// Or use UI
<LayoutResetButton user={user} />
```

---

## ⚠️ Common Issues

### Layout Not Saving
**Cause:** Signature keeps changing  
**Fix:** Check signature dependencies are stable

### Layout Not Restoring
**Cause:** Signature doesn't match exactly  
**Fix:** Ensure signature generation is consistent

### Layout Resets Unexpectedly
**Cause:** Signature changed when it shouldn't  
**Fix:** Review what triggers signature changes

---

## 📊 Signature Components

| Component | Values | Example |
|-----------|--------|---------|
| Navigation | `nav`, `nav-collapsed` | `nav` |
| Content | `reports`, `widgets`, `welcome-noview`, `welcome-empty`, `welcome-closed` | `reports+widgets` |
| Mode | `horizontal`, `vertical` | `horizontal` |

**Full Example:** `nav+reports+widgets+horizontal`

---

## 🎯 Best Practices

1. **Always Update Content** when loading saved layouts
2. **Debounce Saves** to avoid excessive writes
3. **Log Signature Changes** for debugging
4. **Provide Reset Option** in UI
5. **Test with Multiple Users** to ensure isolation

---

## 📖 Additional Resources

- Full Documentation: `docs/LAYOUT_PERSISTENCE.md`
- Implementation Details: `docs/IMPLEMENTATION_SUMMARY.md`
- Source Code: `src/services/layoutPersistenceService.ts`

---

## 🔗 Related Components

- **DashboardDock** - Main integration point
- **LayoutResetButton** - User reset interface
- **ManageModal** - Settings access
- **DockLayoutManager** - Layout generation

---

## ⚡ Performance Tips

- Saves are debounced (500ms)
- Uses sessionStorage (fast)
- Only full reload on signature change
- Content updates in-place when possible

---

## 🧪 Quick Test

```typescript
// Test in browser console
const service = window.layoutPersistenceService; // if exposed
const userId = 'admin';

// Check saved layouts
console.log('Saved:', service.getSavedSignatures(userId));

// Clear all
service.clearAllLayouts(userId);
console.log('After clear:', service.getSavedSignatures(userId));
```

---

## 🎨 UI Components

### LayoutResetButton
```tsx
<LayoutResetButton 
  user={currentUser}
  onReset={() => window.location.reload()} 
/>
```

### Layout Settings Tab
Already integrated in `ManageModal` - just pass user prop:
```tsx
<ManageModal user={currentUser} onClose={...} />
```

---

## 💡 Tips

- Signatures are case-sensitive
- Order matters in signatures
- SessionStorage clears on browser close
- Switch to localStorage for persistence
- Each user has isolated layouts
- Timestamps enable cleanup of old layouts

---

**Need More Help?** Check the full docs in `docs/LAYOUT_PERSISTENCE.md`
