# Layout Persistence System - Architecture Diagram

## 🏗️ System Architecture

```
┌────────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE                             │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  ┌─────────────────┐  ┌──────────────────┐  ┌─────────────────┐ │
│  │  DashboardDock  │  │  ManageModal     │  │ LayoutResetBtn  │ │
│  │                 │  │  (Settings)      │  │                 │ │
│  │ - Panel Layout  │  │ - Layout Tab     │  │ - Reset All     │ │
│  │ - Resize Handle │  │ - Show Saved     │  │ - Confirm       │ │
│  │ - Drag & Drop   │  │ - Info Display   │  │                 │ │
│  └─────────────────┘  └──────────────────┘  └─────────────────┘ │
│         │                      │                      │           │
└─────────┼──────────────────────┼──────────────────────┼───────────┘
          │                      │                      │
          ▼                      ▼                      ▼
┌────────────────────────────────────────────────────────────────────┐
│                      BUSINESS LOGIC LAYER                          │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │         layoutPersistenceService.ts                          │ │
│  ├──────────────────────────────────────────────────────────────┤ │
│  │                                                              │ │
│  │  Core Functions:                                             │ │
│  │  ┌────────────────────────────────────────────────────────┐ │ │
│  │  │ generateLayoutSignature()                              │ │ │
│  │  │   - Computes unique ID for layout configuration        │ │ │
│  │  │   - Based on: view, panels, mode, collapse state       │ │ │
│  │  └────────────────────────────────────────────────────────┘ │ │
│  │                                                              │ │
│  │  ┌────────────────────────────────────────────────────────┐ │ │
│  │  │ saveLayout(userId, signature, layout)                  │ │ │
│  │  │   - Stores layout data with signature                  │ │ │
│  │  │   - Adds timestamp                                     │ │ │
│  │  │   - User-specific storage                              │ │ │
│  │  └────────────────────────────────────────────────────────┘ │ │
│  │                                                              │ │
│  │  ┌────────────────────────────────────────────────────────┐ │ │
│  │  │ loadLayout(userId, signature)                          │ │ │
│  │  │   - Retrieves saved layout for signature              │ │ │
│  │  │   - Returns null if not found                          │ │ │
│  │  │   - User-specific retrieval                            │ │ │
│  │  └────────────────────────────────────────────────────────┘ │ │
│  │                                                              │ │
│  │  ┌────────────────────────────────────────────────────────┐ │ │
│  │  │ clearAllLayouts(userId)                                │ │ │
│  │  │   - Removes all customizations for user                │ │ │
│  │  │   - Used by reset feature                              │ │ │
│  │  └────────────────────────────────────────────────────────┘ │ │
│  │                                                              │ │
│  │  Utility Functions:                                          │ │
│  │  - getSavedSignatures(), hasLayout(), cleanupOldLayouts()   │ │
│  │  - exportLayouts(), importLayouts()                          │ │
│  │                                                              │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                                │                                   │
└────────────────────────────────┼───────────────────────────────────┘
                                 │
                                 ▼
┌────────────────────────────────────────────────────────────────────┐
│                      STORAGE LAYER                                 │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │                    SessionStorage                            │ │
│  ├──────────────────────────────────────────────────────────────┤ │
│  │                                                              │ │
│  │  Key: layoutCustomizations_${userId}                        │ │
│  │                                                              │ │
│  │  Value: {                                                    │ │
│  │    userId: "admin",                                          │ │
│  │    layouts: {                                                │ │
│  │      "nav+reports+widgets+horizontal": {                     │ │
│  │        signature: "...",                                     │ │
│  │        timestamp: 1697234567890,                             │ │
│  │        layout: { ...RC-Dock LayoutData... }                  │ │
│  │      },                                                       │ │
│  │      "nav+reports+vertical": { ... },                        │ │
│  │      ...                                                      │ │
│  │    }                                                          │ │
│  │  }                                                            │ │
│  │                                                              │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Data Flow Diagram

### Save Flow (User Customizes Layout)

```
┌──────────┐
│   User   │
│ Resizes  │
│  Panel   │
└────┬─────┘
     │
     ▼
┌────────────────────┐
│  RC-Dock Layout    │
│  Change Event      │
└────┬───────────────┘
     │
     ▼
┌─────────────────────────────┐
│  DashboardDock              │
│  handleLayoutChange()       │
│                             │
│  1. Debounce 500ms          │
│  2. Get current signature   │
│  3. Call service.save()     │
└────┬────────────────────────┘
     │
     ▼
┌──────────────────────────────┐
│  layoutPersistenceService   │
│  saveLayout()                │
│                              │
│  1. Load user layouts        │
│  2. Add/update signature     │
│  3. Add timestamp            │
│  4. Write to sessionStorage  │
└────┬─────────────────────────┘
     │
     ▼
┌────────────────────┐
│  SessionStorage    │
│  Updated ✓         │
└────────────────────┘
```

### Load Flow (User Changes View)

```
┌──────────┐
│   User   │
│ Selects  │
│   View   │
└────┬─────┘
     │
     ▼
┌────────────────────────┐
│  DashboardDock         │
│  View selection change │
└────┬───────────────────┘
     │
     ▼
┌─────────────────────────────────┐
│  computeCurrentSignature()      │
│  Generate new signature         │
└────┬────────────────────────────┘
     │
     ▼
┌──────────────────────────┐
│  Compare Signatures      │
│  New vs Previous         │
└────┬─────────────────────┘
     │
     ├─── Changed ───┐
     │               │
     │               ▼
     │         ┌─────────────────────────┐
     │         │  service.loadLayout()   │
     │         │  Try to load saved      │
     │         └────┬────────────────────┘
     │              │
     │              ├─ Found ─────┐
     │              │             │
     │              │             ▼
     │              │    ┌────────────────────┐
     │              │    │  Restore Saved     │
     │              │    │  Layout            │
     │              │    │  + Update Content  │
     │              │    └────────────────────┘
     │              │
     │              └─ Not Found ─┐
     │                            │
     │                            ▼
     │                   ┌────────────────────┐
     │                   │  Generate Default  │
     │                   │  Layout            │
     │                   └────────────────────┘
     │
     └─── Same ─────┐
                    │
                    ▼
           ┌────────────────────┐
           │  Update Content    │
           │  Only (Keep Layout)│
           └────────────────────┘
```

---

## 🎯 Component Interaction Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     DashboardDock                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  State:                                                     │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ - currentSignature: LayoutSignature                   │ │
│  │ - previousSignatureRef: ref<LayoutSignature>          │ │
│  │ - selectedView: View | null                           │ │
│  │ - reportsVisible: boolean                             │ │
│  │ - widgetsVisible: boolean                             │ │
│  │ - layoutMode: 'horizontal' | 'vertical'               │ │
│  │ - isDockCollapsed: boolean                            │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  Effects:                                                   │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ 1. Track signature changes                            │ │
│  │    - Compute new signature                            │ │
│  │    - Compare with previous                            │ │
│  │    - Load/generate layout                             │ │
│  │                                                        │ │
│  │ 2. Save on layout change                              │ │
│  │    - Debounced save (500ms)                           │ │
│  │    - Call service.saveLayout()                        │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  Dependencies:                                              │
│  ┌──────────────────┐  ┌──────────────────────────────┐   │
│  │ RC-Dock          │  │ layoutPersistenceService     │   │
│  │ - Layout engine  │  │ - Save/load operations       │   │
│  │ - Panel mgmt     │  │ - Signature generation       │   │
│  └──────────────────┘  └──────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ User prop
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     ManageModal                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Tabs:                                                      │
│  ┌────────────┬──────────────┬────────────┬──────────────┐ │
│  │ All R&W    │ Permissions  │ Add R&W    │ Layout ⭐    │ │
│  └────────────┴──────────────┴────────────┴──────────────┘ │
│                                                  │           │
│  Layout Tab Content:                             │           │
│  ┌──────────────────────────────────────────────┐           │
│  │ - Show saved signatures                      │           │
│  │ - LayoutResetButton                          │           │
│  │ - How-it-works info                          │           │
│  └──────────────────────────────────────────────┘           │
│                              │                               │
└──────────────────────────────┼───────────────────────────────┘
                               │
                               ▼
              ┌────────────────────────────────┐
              │     LayoutResetButton          │
              ├────────────────────────────────┤
              │                                │
              │  onClick:                      │
              │  1. Show confirmation          │
              │  2. Call clearAllLayouts()     │
              │  3. Reload page                │
              │                                │
              └────────────────────────────────┘
```

---

## 🔐 User Isolation Architecture

```
┌────────────────────────────────────────────────────────────┐
│                    SessionStorage                          │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  layoutCustomizations_admin                                │
│  ┌──────────────────────────────────────────────────────┐ │
│  │ Admin's layouts:                                     │ │
│  │ - nav+reports+widgets+horizontal                     │ │
│  │ - nav+reports+vertical                               │ │
│  │ - nav-collapsed+widgets+horizontal                   │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                            │
│  layoutCustomizations_user                                 │
│  ┌──────────────────────────────────────────────────────┐ │
│  │ User's layouts:                                      │ │
│  │ - nav+reports+horizontal                             │ │
│  │ - nav+welcome-noview+horizontal                      │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                            │
│  layoutCustomizations_viewer                               │
│  ┌──────────────────────────────────────────────────────┐ │
│  │ Viewer's layouts:                                    │ │
│  │ - nav+reports+widgets+horizontal                     │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                            │
│  ✓ Each user has separate storage key                     │
│  ✓ No interference between users                          │
│  ✓ User-specific customizations                           │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

---

## 🧩 Type System Architecture

```typescript
// Core Types

type LayoutSignature = string;
// Example: "nav+reports+widgets+horizontal"

interface StoredLayoutData {
  signature: LayoutSignature;
  layout: LayoutData;          // From RC-Dock
  timestamp: number;
}

interface UserLayoutCustomizations {
  userId: string;
  layouts: Record<LayoutSignature, StoredLayoutData>;
}

// Signature Generation Parameters

interface SignatureParams {
  selectedView: boolean;       // Is a view selected?
  hasReports: boolean;         // Does view have reports?
  hasWidgets: boolean;         // Does view have widgets?
  reportsVisible: boolean;     // Are reports visible?
  widgetsVisible: boolean;     // Are widgets visible?
  layoutMode: 'horizontal' | 'vertical';
  isDockCollapsed: boolean;
}
```

---

## 📊 State Management Flow

```
┌─────────────────────────────────────────────────────────────┐
│                Component State (DashboardDock)              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  selectedView ─────┐                                        │
│  reportsVisible ───┼──→ computeCurrentSignature()           │
│  widgetsVisible ───┤        │                               │
│  layoutMode ───────┤        │                               │
│  isDockCollapsed ──┘        ▼                               │
│                      currentSignature                       │
│                             │                               │
│                             ▼                               │
│                   Compare with previous                     │
│                             │                               │
│                   ┌─────────┴─────────┐                     │
│                   │                   │                     │
│              Changed              Same                      │
│                   │                   │                     │
│                   ▼                   ▼                     │
│          Load/Generate          Update Content              │
│             Layout                  Only                    │
│                   │                   │                     │
│                   └─────────┬─────────┘                     │
│                             │                               │
│                             ▼                               │
│                      Update RC-Dock                         │
│                             │                               │
│                             ▼                               │
│                      User sees layout                       │
│                             │                               │
│                   User makes changes                        │
│                             │                               │
│                             ▼                               │
│                   onLayoutChange event                      │
│                             │                               │
│                             ▼                               │
│                   Save (debounced 500ms)                    │
│                             │                               │
│                             ▼                               │
│                  layoutPersistenceService                   │
│                             │                               │
│                             ▼                               │
│                      SessionStorage                         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎨 Rendering Pipeline

```
User Action
    │
    ├─── Select View
    │        │
    │        ▼
    │    Signature Changes
    │        │
    │        ▼
    │    Load/Generate Layout
    │        │
    │        └──→ RC-Dock renders panels
    │
    ├─── Resize Panel
    │        │
    │        ▼
    │    Layout Change Event
    │        │
    │        ▼
    │    Debounce (500ms)
    │        │
    │        ▼
    │    Save to Storage
    │
    ├─── Close Panel
    │        │
    │        ▼
    │    Signature Changes
    │        │
    │        └──→ (back to top)
    │
    └─── Reset Layouts
             │
             ▼
         Clear Storage
             │
             ▼
         Reload Page
```

---

This architecture ensures:
- ✅ Clean separation of concerns
- ✅ Type-safe operations
- ✅ User isolation
- ✅ Efficient storage
- ✅ Maintainable codebase
