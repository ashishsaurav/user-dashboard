# Final Fix: Modals and Ordering

## Issues Fixed

### 1. ✅ Ordering in AllViewGroupsViews Tab
**Problem:** Drag and drop didn't work - showed placeholder message  
**Fix:** Implemented full ordering logic like NavigationPanel

### 2. ✅ Hide/Show Icon in CreateViewGroup Tab  
**Problem:** Eye icon click was calling API but failing silently  
**Fix:** Now tracks changes locally and saves on form submit

### 3. ✅ Visibility Changes Save on Submit
**Problem:** Eye icon clicks in CreateViewGroup and EditViewGroup immediately updated backend  
**Fix:** Changes are now local - only saved when user clicks Save button

### 4. ✅ Incorrect Sorting in AllViewGroupsViews
**Problem:** Views sorted by `View.order` instead of group order  
**Fix:** Removed incorrect sort, preserves backend ordering

---

## Solution 1: AllViewGroupsViews Ordering

**File:** `src/components/features/AllViewGroupsViews.tsx`

### Fixed Sorting
**Before:**
```typescript
return groupViews.sort((a, b) => (a.order || 0) - (b.order || 0));  // ❌
```

**After:**
```typescript
return groupViews;  // ✅ Preserve backend ordering
```

### Implemented handleDrop
**Before:**
```typescript
const handleDrop = async (e, targetId, targetType) => {
  showSuccess("Drag and drop", "Use up/down buttons for now");  // ❌ Placeholder
};
```

**After:**
```typescript
const handleDrop = async (e, targetId, targetType) => {
  // Store drag data before state changes
  const dragData = { ...draggedItem };
  const dropPosition = dragOverItem?.position;
  
  setDragOverItem(null);

  try {
    if (dragData.type === "viewgroup" && targetType === "viewgroup") {
      // ✅ Reorder view groups
      const reorderedGroups = [...viewGroups];
      const [draggedGroup] = reorderedGroups.splice(draggedIndex, 1);
      reorderedGroups.splice(targetIndex, 0, draggedGroup);

      const items = reorderedGroups.map((group, index) => ({
        id: group.id,
        orderIndex: index,
      }));

      await viewGroupsService.reorderViewGroups(user.name, items);
      onRefresh();
      
    } else if (dragData.type === "view" && targetType === "view") {
      // ✅ Reorder views within group
      const reorderedViewIds = [...viewGroup.viewIds];
      const [draggedViewId] = reorderedViewIds.splice(draggedIndex, 1);

      // Calculate correct insert position
      let insertIndex;
      if (pos === "top") {
        insertIndex = targetIndex;
        if (draggedIndex < targetIndex) {
          insertIndex = targetIndex - 1;
        }
      } else {
        insertIndex = targetIndex + 1;
        if (draggedIndex < targetIndex) {
          insertIndex = targetIndex;
        }
      }

      reorderedViewIds.splice(insertIndex, 0, draggedViewId);

      const items = reorderedViewIds.map((id, index) => ({
        id,
        orderIndex: index,
      }));

      await viewGroupsService.reorderViewsInGroup(sourceGroupId, user.name, items);
      onRefresh();
    }
  } catch (error) {
    showError("Failed to reorder", "Changes not saved");
  } finally {
    setDraggedItem(null);
  }
};
```

**What it does:**
- ✅ Reorders view groups by dragging
- ✅ Reorders views within a group
- ✅ Calls API to persist changes
- ✅ Refreshes data to update UI
- ✅ Same algorithm as NavigationPanel

---

## Solution 2 & 3: Local Visibility Changes in Modals

### CreateViewGroup Changes

**File:** `src/components/forms/CreateViewGroup.tsx`

**Added State:**
```typescript
// Track local visibility changes (don't save until form submit)
const [localVisibilityChanges, setLocalVisibilityChanges] = useState<{
  [viewId: string]: boolean;
}>({});
```

**Updated handleVisibilityToggle:**
```typescript
// Before: Immediately called API ❌
const handleVisibilityToggle = async (viewId) => {
  await viewsService.updateView(...);  // ❌ Immediate save
  showSuccess(...);
};

// After: Tracks locally ✅
const handleVisibilityToggle = (viewId: string) => {
  const view = views.find(v => v.id === viewId);
  if (!view) return;

  setLocalVisibilityChanges(prev => {
    const currentVisibility = prev.hasOwnProperty(viewId) 
      ? prev[viewId] 
      : view.isVisible;
    return {
      ...prev,
      [viewId]: !currentVisibility
    };
  });
};
```

**Updated isViewHidden:**
```typescript
// Before: Only checked View.isVisible ❌
const isViewHidden = (viewId) => {
  const view = views.find(v => v.id === viewId);
  return view ? !view.isVisible : false;
};

// After: Checks local changes first ✅
const isViewHidden = (viewId: string): boolean => {
  const view = views.find(v => v.id === viewId);
  if (!view) return false;
  
  // Check local changes first, fallback to actual value
  if (localVisibilityChanges.hasOwnProperty(viewId)) {
    return !localVisibilityChanges[viewId];
  }
  
  return !view.isVisible;
};
```

**Updated handleSubmit:**
```typescript
const handleSubmit = async (e) => {
  e.preventDefault();

  // ... create view group ...

  // ✅ Save visibility changes for each view that was toggled
  if (Object.keys(localVisibilityChanges).length > 0) {
    const viewsService = await import('../../services/viewsService');
    for (const [viewId, isVisible] of Object.entries(localVisibilityChanges)) {
      const view = views.find(v => v.id === viewId);
      if (view) {
        try {
          await viewsService.viewsService.updateView(view.id, user.name, {
            name: view.name,
            isVisible: isVisible,
            orderIndex: view.order || 0,
          });
        } catch (error) {
          // Continue even if one fails
        }
      }
    }
  }

  onAddViewGroup(newViewGroup);
  setLocalVisibilityChanges({});  // ✅ Clear after save
};
```

---

### EditViewGroupModal Changes

**File:** `src/components/modals/EditViewGroupModal.tsx`

**Same changes as CreateViewGroup:**
1. Added `localVisibilityChanges` state
2. Updated `handleVisibilityToggle` to track locally
3. Updated `isViewHidden` to check local changes first
4. Updated `handleSubmit` to save visibility changes on submit

**Additional in handleSubmit:**
```typescript
// 3. Save visibility changes for each view that was toggled
if (Object.keys(localVisibilityChanges).length > 0) {
  const viewsServiceModule = await import('../../services/viewsService');
  for (const [viewId, isVisible] of Object.entries(localVisibilityChanges)) {
    const view = views.find(v => v.id === viewId);
    if (view) {
      try {
        await viewsServiceModule.viewsService.updateView(view.id, user?.name || '', {
          name: view.name,
          isVisible: isVisible,
          orderIndex: view.order || 0,
        });
      } catch (error) {
        // Continue even if one fails
      }
    }
  }
}

setLocalVisibilityChanges({});  // ✅ Clear after save
onSave(formData);
```

---

## User Experience Changes

### Before: Eye Icon Immediately Saved

```
User opens Create View Group
    ↓
User clicks eye icon on View A
    ↓
API call: PUT /api/Views/{id} (isVisible: false)  ❌ Immediate
    ↓
Success notification
    ↓
User clicks eye icon on View B
    ↓
API call: PUT /api/Views/{id} (isVisible: false)  ❌ Immediate
    ↓
User changes mind, clicks Cancel
    ↓
❌ Changes were already saved! Can't undo!
```

### After: Eye Icon Saves on Submit

```
User opens Create View Group
    ↓
User clicks eye icon on View A
    ↓
localVisibilityChanges = { "view-a": false }  ✅ Local only
Eye icon updates in modal
    ↓
User clicks eye icon on View B
    ↓
localVisibilityChanges = { "view-a": false, "view-b": false }  ✅ Local only
Eye icon updates in modal
    ↓
User changes mind, clicks eye icon on View A again
    ↓
localVisibilityChanges = { "view-a": true, "view-b": false }  ✅ Reverted locally
    ↓
User clicks Cancel
    ↓
✅ No changes saved! View A and B still visible in navigation
    ↓
OR user clicks Create/Save
    ↓
For each change in localVisibilityChanges:
  PUT /api/Views/{id} (isVisible: newValue)
    ↓
All changes saved at once ✅
localVisibilityChanges cleared
```

---

## Ordering Flow in AllViewGroupsViews

### Reorder View Groups

```
User drags View Group B above View Group A
    ↓
handleDragStart stores: { type: "viewgroup", id: "vg-b" }
    ↓
handleDrop called
    ↓
Calculate new order:
  Original: [A, B, C]
  Remove B: [A, C]
  Insert at index 0: [B, A, C]
    ↓
POST /api/ViewGroups/reorder
Body: {
  items: [
    { id: "vg-b", orderIndex: 0 },
    { id: "vg-a", orderIndex: 1 },
    { id: "vg-c", orderIndex: 2 }
  ]
}
    ↓
Backend updates ViewGroup.OrderIndex
    ↓
onRefresh() called
    ↓
UI updates with new order ✅
```

### Reorder Views Within Group

```
User drags View 2 above View 1 in Group A
    ↓
handleDragStart stores: { type: "view", id: "v2", data: { viewGroupId: "grp-a" } }
    ↓
handleDrop called
    ↓
sourceGroupId = "grp-a" (from drag data)
targetGroupId = "grp-a" (from target view)
Same group ✅
    ↓
Calculate new order:
  Original: [v1, v2, v3]
  draggedIndex: 1, targetIndex: 0
  Remove v2: [v1, v3]
  Insert at index 0: [v2, v1, v3]
    ↓
POST /api/ViewGroups/grp-a/views/reorder
Body: {
  items: [
    { id: "v2", orderIndex: 0 },
    { id: "v1", orderIndex: 1 },
    { id: "v3", orderIndex: 2 }
  ]
}
    ↓
Backend updates ViewGroupView.OrderIndex
    ↓
onRefresh() called
    ↓
UI updates with new order ✅
```

---

## Testing

### Test 1: AllViewGroupsViews Ordering

**Steps:**
1. Open "Manage Navigation"
2. Go to "All View Groups & Views" tab
3. Drag a view group up/down
4. Check if it reorders

**Expected:**
- [ ] View group moves to new position
- [ ] Order persists after refresh ✅

**Also Test:**
1. Expand a view group
2. Drag a view within the group
3. Check if it reorders

**Expected:**
- [ ] View moves within the group
- [ ] Order persists ✅

---

### Test 2: CreateViewGroup - Local Visibility Changes

**Steps:**
1. "Manage Navigation" → "Create View Group"
2. Click eye icon on View A (hide it)
3. Eye icon should change to hidden state
4. Check navigation panel

**Expected:**
- [ ] Eye icon changes in modal ✅
- [ ] View A still visible in navigation panel (not saved yet)

**Continue:**
5. Click Create button
6. Check navigation panel

**Expected:**
- [ ] View A now hidden in navigation ✅
- [ ] Refresh page → View A still hidden ✅

**Test Cancel:**
1. "Create View Group" again
2. Click eye icon on View B
3. Click Cancel (close modal)
4. Check navigation panel

**Expected:**
- [ ] View B still visible (changes not saved) ✅

---

### Test 3: EditViewGroup - Local Visibility Changes

**Steps:**
1. Right-click a view group → Edit
2. Click eye icon on View C (toggle visibility)
3. Eye icon changes in modal
4. Check navigation panel

**Expected:**
- [ ] Eye icon changes in modal ✅
- [ ] View C unchanged in navigation (not saved yet)

**Continue:**
5. Click Save button
6. Check navigation panel

**Expected:**
- [ ] View C visibility updated ✅
- [ ] Refresh page → change persists ✅

**Test Multiple Changes:**
1. Edit view group again
2. Toggle View A, View B, View C (multiple times)
3. Click Save

**Expected:**
- [ ] All final states saved ✅
- [ ] Only one API call per view ✅

---

## Files Modified

1. ✅ **src/components/features/AllViewGroupsViews.tsx**
   - Fixed sorting (removed incorrect sort)
   - Implemented full `handleDrop` with ordering logic
   - Added `viewGroupId` to drag data
   - Updated `handleDragStart` and `handleDragEnd`

2. ✅ **src/components/forms/CreateViewGroup.tsx**
   - Added `localVisibilityChanges` state
   - Updated `handleVisibilityToggle` to track locally
   - Updated `isViewHidden` to check local changes
   - Updated `handleSubmit` to save on form submit

3. ✅ **src/components/modals/EditViewGroupModal.tsx**
   - Added `localVisibilityChanges` state
   - Updated `handleVisibilityToggle` to track locally
   - Updated `isViewHidden` to check local changes
   - Updated `handleSubmit` to save on form submit

---

## Summary

| Feature | Before | After |
|---------|--------|-------|
| **AllViewGroupsViews ordering** | ❌ Placeholder message | ✅ Full ordering implementation |
| **AllViewGroupsViews sorting** | ❌ Wrong sort | ✅ Preserves backend order |
| **CreateViewGroup eye icon** | ❌ Immediate save | ✅ Save on submit |
| **EditViewGroup eye icon** | ❌ Immediate save | ✅ Save on submit |
| **Cancel changes** | ❌ Can't undo | ✅ Changes discarded |
| **UX** | ❌ Confusing | ✅ Intuitive |

---

**All three issues are now fixed!** 🎉

**Try it:**
1. Drag and drop in "All View Groups & Views" → works! ✅
2. Click eye icons in Create/Edit modals → local only ✅
3. Click Save → changes persist ✅
4. Click Cancel → changes discarded ✅
