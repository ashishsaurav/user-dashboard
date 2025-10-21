# Fix: Show/Hide Icons in Edit Modals

## Problem

**User Report:** "show hide icon is not working in editview modal and editviewgroup modal"

### Root Cause

The EditViewGroupModal and CreateViewGroup forms have **eye icons next to each view** to toggle individual view visibility. These were using the **old navigation settings system** (`localHiddenViews` state) instead of the actual `View.isVisible` backend field.

**Flow before:**
```
User clicks eye icon in modal
    ↓
Updates localHiddenViews array (local state)
    ↓
Does NOT call API
    ↓
Changes lost on refresh ❌
```

---

## Solution Implemented

### Fix 1: EditViewGroupModal Eye Icons

**File:** `src/components/modals/EditViewGroupModal.tsx`

**Removed:**
- `localHiddenViews` state
- `currentSettings` from navigation settings
- All console logs

**Before:**
```typescript
const [localHiddenViews, setLocalHiddenViews] = useState<string[]>(() => {
  return [...currentSettings.hiddenViews];
});

const handleVisibilityToggle = (viewId: string) => {
  setLocalHiddenViews((prev) => {
    return prev.includes(viewId)
      ? prev.filter((id) => id !== viewId)  // ❌ Only local state
      : [...prev, viewId];
  });
};

const isViewHidden = (viewId: string): boolean => {
  return localHiddenViews.includes(viewId);  // ❌ Checks local state
};
```

**After:**
```typescript
const handleVisibilityToggle = async (viewId: string) => {
  const view = views.find(v => v.id === viewId);
  if (!view || !user) return;

  try {
    const viewsService = await import('../../services/viewsService');
    await viewsService.viewsService.updateView(view.id, user.name, {
      name: view.name,
      isVisible: !view.isVisible,  // ✅ Toggle backend field
      orderIndex: view.order || 0,
    });

    showSuccess(
      view.isVisible ? "View hidden" : "View shown",
      `"${view.name}" ${view.isVisible ? 'will be hidden' : 'will be shown'} in navigation`
    );
    
    onSave(formData);  // ✅ Trigger parent refresh
  } catch (error) {
    showError("Update Failed", "Could not update view visibility");
  }
};

const isViewHidden = (viewId: string): boolean => {
  const view = views.find(v => v.id === viewId);
  return view ? !view.isVisible : false;  // ✅ Checks View.isVisible
};
```

**What changed:**
1. ✅ Now calls API to update `View.isVisible`
2. ✅ Shows success/error notifications
3. ✅ Triggers parent refresh to update UI
4. ✅ Checks actual `View.isVisible` field
5. ✅ Changes persist after refresh

---

### Fix 2: CreateViewGroup Eye Icons

**File:** `src/components/forms/CreateViewGroup.tsx`

**Same changes as EditViewGroupModal:**
- Removed `localHiddenViews` state
- Removed `currentSettings`
- Updated `handleVisibilityToggle` to call API
- Updated `isViewHidden` to check `View.isVisible`
- Removed console logs

---

## How It Works Now

### EditViewGroupModal Flow

```
User opens Edit View Group modal
    ↓
Sees list of all views with checkboxes + eye icons
    ↓
Eye icon shows current View.isVisible state:
  👁️ = view is visible (View.isVisible = true)
  👁️‍🗨️ = view is hidden (View.isVisible = false)
    ↓
User clicks eye icon
    ↓
handleVisibilityToggle() called
    ↓
PUT /api/Views/{viewId}
Body: { isVisible: !currentValue, ... }
    ↓
Backend updates View.isVisible
    ↓
Success notification shown
    ↓
onSave() called → parent refreshes data
    ↓
Eye icon updates to reflect new state ✅
    ↓
Changes persist after page refresh ✅
```

### CreateViewGroup Flow

Same as EditViewGroupModal, except it's in the create form instead of edit modal.

---

## UI Changes

### Before
```
View: Sales Report  ☐  👁️
└─ Click eye icon → only updates local state
└─ No API call
└─ Lost on refresh
```

### After
```
View: Sales Report  ☐  👁️
└─ Click eye icon → API call to update View.isVisible
└─ Success notification
└─ UI updates immediately
└─ Persists after refresh ✅
```

---

## Testing

### Test 1: Eye Icon in EditViewGroupModal

**Steps:**
1. Right-click a view group
2. Click Edit
3. See list of views with eye icons
4. Find a visible view (👁️ eye icon)
5. Click the eye icon
6. Check the result

**Expected:**
- [ ] Success notification appears
- [ ] Eye icon changes to hidden state (👁️‍🗨️)
- [ ] View disappears from navigation panel
- [ ] Refresh page → view still hidden ✅

**Restore:**
1. Edit view group again
2. Click eye icon on the hidden view
3. Save

**Expected:**
- [ ] View reappears in navigation

---

### Test 2: Eye Icon in CreateViewGroup

**Steps:**
1. Click "Manage Navigation"
2. Go to "Create View Group" tab
3. See list of views with eye icons
4. Find a visible view
5. Click eye icon
6. Check result

**Expected:**
- [ ] Success notification
- [ ] Eye icon changes state
- [ ] View disappears from navigation
- [ ] Can create view group without that view
- [ ] Refresh → view still hidden ✅

---

### Test 3: Multiple View Visibility Toggles

**Steps:**
1. Open Edit View Group modal
2. Click eye icons on 3 different views
3. Close modal
4. Check navigation panel

**Expected:**
- [ ] All 3 views hidden from navigation
- [ ] Refresh page → still hidden
- [ ] Edit view group → all 3 show hidden eye icons ✅

---

### Test 4: Checkbox vs Eye Icon

**Steps:**
1. Open Edit View Group modal
2. View A: Checked (in group), Visible (👁️)
3. Uncheck View A (remove from group)
4. Click eye icon to hide View A
5. Save

**Expected:**
- [ ] View A removed from this group
- [ ] View A hidden in navigation globally
- [ ] If View A is in other groups, it's still hidden there too ✅

**Understanding:**
- ☐/☑ Checkbox = adds/removes view from THIS group
- 👁️ Eye icon = shows/hides view GLOBALLY in navigation

---

## API Calls

### Toggle View Visibility in Modal

```
PUT /api/Views/{viewId}
Headers: Content-Type: application/json
Body:
{
  "userId": "user123",
  "data": {
    "name": "Sales Report",
    "isVisible": false,  // ✅ Updated value
    "orderIndex": 2
  }
}

Response: 200 OK
{
  "viewId": "view-123",
  "name": "Sales Report",
  "isVisible": false,  // ✅ Now hidden
  ...
}
```

---

## Code Changes

### Removed from Both Files

```typescript
// ❌ REMOVED
const currentSettings = useMemo((): UserNavigationSettings => { ... });
const [localHiddenViews, setLocalHiddenViews] = useState<string[]>(() => { ... });
console.log(...);  // All console logs removed

// ❌ REMOVED from handleSubmit
if (onUpdateNavSettings && user) {
  const updatedSettings = {
    ...currentSettings,
    hiddenViews: localHiddenViews,
  };
  onUpdateNavSettings(updatedSettings);
}
```

### Added to Both Files

```typescript
// ✅ ADDED
const handleVisibilityToggle = async (viewId: string) => {
  const view = views.find(v => v.id === viewId);
  if (!view || !user) return;

  try {
    const viewsService = await import('../../services/viewsService');
    await viewsService.viewsService.updateView(view.id, user.name, {
      name: view.name,
      isVisible: !view.isVisible,
      orderIndex: view.order || 0,
    });

    showSuccess(...);
    onSave(formData);  // Trigger refresh
  } catch (error) {
    showError(...);
  }
};

const isViewHidden = (viewId: string): boolean => {
  const view = views.find(v => v.id === viewId);
  return view ? !view.isVisible : false;
};
```

---

## Files Modified

1. ✅ **src/components/modals/EditViewGroupModal.tsx**
   - Removed `localHiddenViews` state
   - Updated `handleVisibilityToggle` to call API
   - Updated `isViewHidden` to check `View.isVisible`
   - Removed navigation settings logic
   - Removed console logs

2. ✅ **src/components/forms/CreateViewGroup.tsx**
   - Same changes as EditViewGroupModal

---

## Summary

| Aspect | Before | After |
|--------|--------|-------|
| **Eye icon click** | ❌ Updates local state only | ✅ Calls API |
| **Backend update** | ❌ No | ✅ Yes |
| **Notification** | ❌ No | ✅ Yes |
| **UI update** | ❌ Only in modal | ✅ Navigation panel too |
| **Persistence** | ❌ Lost on refresh | ✅ Persists |
| **Checkbox (add to group)** | ✅ Working | ✅ Still works |
| **Eye icon (visibility)** | ❌ Broken | ✅ Works |
| **Console logs** | ❌ Many | ✅ None |

---

**Eye icons in modals now work correctly!** 🎉

**Try it:**
1. Edit a view group
2. Click eye icons on views
3. They hide/show immediately in navigation ✅
4. Changes persist after refresh ✅
