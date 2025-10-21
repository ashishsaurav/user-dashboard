# Fix: View Group Deletion with Two Options

## Problem

**Before:** When deleting a view group, all views inside it were also deleted due to database cascade behavior.

**User Expectation:** Two distinct options:
1. **Delete group only** → Move views to a "Default" group
2. **Delete group AND views** → Delete everything

---

## Solution Implemented

### File Modified
- ✅ `src/components/navigation/NavigationPanel.tsx` - `handleDeleteViewGroupConfirm()`

### Modal Already Exists
- ✅ `src/components/modals/DeleteConfirmationModal.tsx` - Already shows both options!

---

## How It Works Now

### User Flow

```
User clicks delete on a view group
    ↓
Modal appears with TWO options:
    ┌────────────────────────────────────────┐
    │ Delete View Group                      │
    │                                        │
    │ You are about to delete "Sales" which  │
    │ contains 5 views. What would you like  │
    │ to do with the views in this group?    │
    │                                        │
    │ ┌────────────────────────────────────┐ │
    │ │ ✓ Delete Group Only                │ │
    │ │   Move all views to the Default    │ │
    │ │   group                             │ │
    │ └────────────────────────────────────┘ │
    │                                        │
    │ ┌────────────────────────────────────┐ │
    │ │ ⚠ Delete Group & Views             │ │
    │ │   Permanently delete the group and │ │
    │ │   all its views                     │ │
    │ └────────────────────────────────────┘ │
    │                                        │
    │              [Cancel]                  │
    └────────────────────────────────────────┘
    ↓
User selects option
    ↓
handleDeleteViewGroupConfirm(action)
```

---

## Implementation Details

### Option 1: Delete Group Only (Move Views to Default)

```typescript
if (action === "group-only") {
  console.log('🗑️ Deleting view group only:', deletingViewGroup.name);
  console.log('  Moving', deletingViewGroup.viewIds.length, 'views to default group');
  
  // ✅ Step 1: Find default group
  const defaultGroup = viewGroups.find((vg) => vg.isDefault);
  
  // ✅ Step 2: Get views NOT already in default group (avoid duplicates)
  const defaultGroupViewIds = defaultGroup!.viewIds;
  const viewsToMove = deletingViewGroup.viewIds.filter(
    viewId => !defaultGroupViewIds.includes(viewId)
  );
  
  // ✅ Step 3: Add views to default group
  if (viewsToMove.length > 0) {
    await viewGroupsService.addViewsToGroup(
      defaultGroup!.id,
      user.name,
      viewsToMove
    );
  }
  
  // ✅ Step 4: Delete the view group
  await viewGroupsService.deleteViewGroup(deletingViewGroup.id, user.name);
  
  showSuccess(
    "View Group Deleted",
    `"Sales" deleted. 5 views moved to "Default".`
  );
}
```

**What happens:**
1. Finds the default view group
2. Identifies views that need to be moved (not already in default)
3. Adds those views to default group via API
4. Deletes the view group
5. Views are preserved in default group ✅

**Database changes:**
```sql
-- Before deletion
ViewGroupViews:
  { ViewGroupId: 'sales-group', ViewId: 'view-1' }
  { ViewGroupId: 'sales-group', ViewId: 'view-2' }

Views:
  { ViewId: 'view-1', Name: 'Sales Report' }
  { ViewId: 'view-2', Name: 'Revenue Chart' }

ViewGroups:
  { ViewGroupId: 'sales-group', Name: 'Sales' }
  { ViewGroupId: 'default-group', Name: 'Default', IsDefault: true }

-- After "Delete Group Only"
ViewGroupViews:
  { ViewGroupId: 'default-group', ViewId: 'view-1' }  ✅ Moved
  { ViewGroupId: 'default-group', ViewId: 'view-2' }  ✅ Moved

Views:
  { ViewId: 'view-1', Name: 'Sales Report' }  ✅ Still exists
  { ViewId: 'view-2', Name: 'Revenue Chart' } ✅ Still exists

ViewGroups:
  { ViewGroupId: 'default-group', Name: 'Default', IsDefault: true }  ✅ Only default remains
```

---

### Option 2: Delete Group AND Views (Delete Everything)

```typescript
else {
  // action === "group-and-views"
  const viewsToDelete = deletingViewGroup.viewIds;
  console.log('🗑️ Deleting view group AND all views');
  console.log('  Will delete', viewsToDelete.length, 'views');
  
  // ✅ Step 1: Delete all views (properly, removing from all groups first)
  for (const viewId of viewsToDelete) {
    const view = views.find(v => v.id === viewId);
    
    // Remove from all groups that contain it (avoid FK errors)
    const groupsContainingView = viewGroups.filter(vg => 
      vg.viewIds.includes(viewId)
    );
    
    for (const group of groupsContainingView) {
      console.log('    Removing from group:', group.name);
      await viewGroupsService.removeViewFromGroup(group.id, viewId, user.name);
    }
    
    // Delete the view
    await viewsService.deleteView(viewId, user.name);
  }
  
  // ✅ Step 2: Delete the view group
  await viewGroupsService.deleteViewGroup(deletingViewGroup.id, user.name);
  
  showSuccess(
    "View Group and Views Deleted",
    `"Sales" and 5 views have been removed.`
  );
}
```

**What happens:**
1. For each view in the group:
   - Find ALL groups containing it (view might be in multiple groups)
   - Remove from each group via API (to avoid FK constraint errors)
   - Delete the view itself
2. Delete the view group
3. Everything is gone ✅

**Database changes:**
```sql
-- Before deletion
ViewGroupViews:
  { ViewGroupId: 'sales-group', ViewId: 'view-1' }
  { ViewGroupId: 'sales-group', ViewId: 'view-2' }
  { ViewGroupId: 'finance-group', ViewId: 'view-1' }  -- view-1 is in multiple groups!

Views:
  { ViewId: 'view-1', Name: 'Sales Report' }
  { ViewId: 'view-2', Name: 'Revenue Chart' }

ViewGroups:
  { ViewGroupId: 'sales-group', Name: 'Sales' }
  { ViewGroupId: 'finance-group', Name: 'Finance' }

-- After "Delete Group & Views"
ViewGroupViews:
  (all references to view-1 and view-2 removed)  ✅

Views:
  (view-1 and view-2 deleted)  ✅

ViewGroups:
  { ViewGroupId: 'finance-group', Name: 'Finance' }  ✅ Finance group still exists
```

---

## API Calls Made

### Delete Group Only

```
1. POST /api/ViewGroups/{default-group-id}/views
   Body: { userId, viewIds: ["view-1", "view-2", ...] }
   → Adds views to default group

2. DELETE /api/ViewGroups/{deleting-group-id}?userId={userId}
   → Deletes the view group
```

### Delete Group & Views

```
For each view in group:
  1. For each group containing the view:
     DELETE /api/ViewGroups/{group-id}/views/{view-id}?userId={userId}
     → Removes view from group (avoids FK errors)
  
  2. DELETE /api/Views/{view-id}?userId={userId}
     → Deletes the view

After all views deleted:
  3. DELETE /api/ViewGroups/{deleting-group-id}?userId={userId}
     → Deletes the view group
```

---

## Expected Console Output

### Delete Group Only (Success)

```
🗑️ Deleting view group only: sales-group Sales
  Moving 5 views to default group: Default
  Views to move: 3
  Adding views to default group
🌐 API Request: POST https://localhost:7273/api/ViewGroups/default-group/views
  Request body: {"userId":"user123","viewIds":["view-1","view-2","view-3"]}
✅ API Response: POST ... (200 OK)
  Deleting view group
🌐 API Request: DELETE https://localhost:7273/api/ViewGroups/sales-group?userId=user123
✅ API Response: DELETE ... (204 No Content)
✅ View group deleted, views moved to default group
🔄 Refreshing navigation data...
```

### Delete Group & Views (Success)

```
🗑️ Deleting view group AND all views: sales-group Sales
  Will delete 5 views
  Deleting view: Sales Report view-1
    View is in 2 group(s)
    Removing from group: Sales
🌐 API Request: DELETE https://localhost:7273/api/ViewGroups/sales-group/views/view-1?userId=user123
    Removing from group: Finance
🌐 API Request: DELETE https://localhost:7273/api/ViewGroups/finance-group/views/view-1?userId=user123
    Deleting view from database
🌐 API Request: DELETE https://localhost:7273/api/Views/view-1?userId=user123
  Deleting view: Revenue Chart view-2
    View is in 1 group(s)
    Removing from group: Sales
🌐 API Request: DELETE https://localhost:7273/api/ViewGroups/sales-group/views/view-2?userId=user123
    Deleting view from database
🌐 API Request: DELETE https://localhost:7273/api/Views/view-2?userId=user123
  ... (continues for all views)
  Deleting view group
🌐 API Request: DELETE https://localhost:7273/api/ViewGroups/sales-group?userId=user123
✅ View group and all views deleted successfully
🔄 Refreshing navigation data...
```

---

## Edge Cases Handled

### 1. No Default Group Exists

```typescript
if (!defaultGroup && action === "group-only") {
  showWarning(
    "Error",
    "Default group not found. Cannot move views. Please create a default group first."
  );
  return;
}
```

**User sees:** Warning notification explaining they need a default group.

### 2. Views Already in Default Group

```typescript
const defaultGroupViewIds = defaultGroup!.viewIds;
const viewsToMove = deletingViewGroup.viewIds.filter(
  viewId => !defaultGroupViewIds.includes(viewId)
);
```

**What happens:** Only moves views NOT already in default group to avoid duplicates.

### 3. View in Multiple Groups (Delete Group & Views)

```typescript
const groupsContainingView = viewGroups.filter(vg => 
  vg.viewIds.includes(viewId)
);

for (const group of groupsContainingView) {
  await viewGroupsService.removeViewFromGroup(group.id, viewId, user.name);
}
```

**What happens:** Removes view from ALL groups before deleting to avoid FK constraint errors.

### 4. Empty View Group

```typescript
if (deletingViewGroup.viewIds.length > 0) {
  // Move views logic
}
// Still deletes the empty group
```

**What happens:** Safely deletes empty groups without trying to move non-existent views.

---

## Testing Checklist

### Scenario 1: Delete Group Only (Basic)

**Setup:**
- Create view group "Sales" with 3 views
- Create a "Default" group (with `isDefault: true`)

**Steps:**
1. Click delete on "Sales" group
2. Modal appears with 2 options
3. Select "Delete Group Only"
4. Check console

**Expected:**
- [ ] Console shows "Moving 3 views to default group"
- [ ] Console shows "Adding views to default group"
- [ ] POST request to add views to default group
- [ ] DELETE request to delete "Sales" group
- [ ] Success notification: "Sales deleted. 3 views moved to Default."
- [ ] UI refreshes
- [ ] "Sales" group is gone
- [ ] All 3 views now appear in "Default" group
- [ ] Refresh page - views still in "Default" group ✅

---

### Scenario 2: Delete Group Only (Views Already in Default)

**Setup:**
- View "Shared Report" is in BOTH "Sales" and "Default" groups
- "Sales" group has 3 views total (including "Shared Report")

**Steps:**
1. Delete "Sales" group
2. Select "Delete Group Only"

**Expected:**
- [ ] Console shows "Moving 3 views to default group"
- [ ] Console shows "Views to move: 2" (excludes "Shared Report")
- [ ] Only 2 views added to default group (no duplicates)
- [ ] "Shared Report" already in default, not moved again
- [ ] No errors
- [ ] All views preserved ✅

---

### Scenario 3: Delete Group & Views (Basic)

**Setup:**
- Create view group "Reports" with 2 views
- Views are ONLY in "Reports" group

**Steps:**
1. Delete "Reports" group
2. Select "Delete Group & Views"

**Expected:**
- [ ] Console shows "Deleting view group AND all views"
- [ ] Console shows "Will delete 2 views"
- [ ] For each view:
  - [ ] Console shows "View is in 1 group(s)"
  - [ ] DELETE to remove from group
  - [ ] DELETE to delete view
- [ ] DELETE to delete view group
- [ ] Success: "Reports and 2 views have been removed."
- [ ] UI refreshes
- [ ] Group is gone
- [ ] Views are gone
- [ ] Refresh page - everything still deleted ✅

---

### Scenario 4: Delete Group & Views (View in Multiple Groups)

**Setup:**
- View "Quarterly Report" is in "Sales", "Finance", and "Executive" groups
- Delete "Sales" group (which contains "Quarterly Report" + 2 other views)

**Steps:**
1. Delete "Sales" group
2. Select "Delete Group & Views"

**Expected:**
- [ ] Console shows "Deleting view group AND all views"
- [ ] For "Quarterly Report":
  - [ ] Console shows "View is in 3 group(s)"
  - [ ] DELETE from "Sales" group
  - [ ] DELETE from "Finance" group
  - [ ] DELETE from "Executive" group
  - [ ] DELETE view itself
- [ ] Other 2 views deleted normally
- [ ] "Sales" group deleted
- [ ] "Finance" and "Executive" groups still exist (no "Quarterly Report" in them)
- [ ] No FK constraint errors ✅

---

### Scenario 5: No Default Group (Delete Group Only)

**Setup:**
- Delete ALL view groups
- Create a new group "Test" with views
- No default group exists

**Steps:**
1. Try to delete "Test" group
2. Select "Delete Group Only"

**Expected:**
- [ ] Warning notification appears
- [ ] Message: "Default group not found. Cannot move views. Please create a default group first."
- [ ] Deletion is cancelled
- [ ] "Test" group still exists
- [ ] Views still in "Test" group ✅

---

### Scenario 6: Empty View Group

**Setup:**
- Create view group "Empty Group" with 0 views

**Steps:**
1. Delete "Empty Group"
2. Select "Delete Group Only"

**Expected:**
- [ ] Console shows "Moving 0 views to default group"
- [ ] Console shows "Views to move: 0"
- [ ] No API call to add views (nothing to move)
- [ ] DELETE request to delete group
- [ ] Group deleted successfully
- [ ] No errors ✅

---

## Comparison: Before vs After

| Scenario | Before | After |
|----------|--------|-------|
| **Delete group with views** | ❌ Views also deleted (cascade) | ✅ User chooses: move to default OR delete all |
| **Views in multiple groups** | ❌ FK constraint errors | ✅ Properly removes from all groups first |
| **No default group** | ❌ Silent failure or error | ✅ Clear warning message |
| **User control** | ❌ No choice | ✅ Full control over what to delete |
| **Data safety** | ❌ Accidental deletions | ✅ Explicit confirmation required |

---

## Database Schema (Reference)

### ViewGroupView (Junction Table)

```csharp
modelBuilder.Entity<ViewGroupView>(entity =>
{
    entity.HasOne(e => e.View)
        .WithMany(v => v.ViewGroupViews)
        .HasForeignKey(e => e.ViewId)
        .OnDelete(DeleteBehavior.NoAction);  // ⚠️ No cascade!
});
```

**Why NoAction matters:**
- If a View is deleted, ViewGroupView records are NOT automatically deleted
- We must manually remove ViewGroupView records before deleting Views
- This is why we loop through all groups and call `removeViewFromGroup` first

---

## Summary

### Changes Made

| File | Change | Purpose |
|------|--------|---------|
| `NavigationPanel.tsx` | Updated `handleDeleteViewGroupConfirm` | Implement two deletion options |
| `NavigationPanel.tsx` | Option 1: group-only | Move views to default group before deleting |
| `NavigationPanel.tsx` | Option 2: group-and-views | Properly delete all views then group |

### Features Added

✅ **Delete Group Only**
- Moves views to default group
- Preserves all view data
- Avoids duplicates (checks if view already in default)
- Validates default group exists

✅ **Delete Group & Views**  
- Deletes all views in the group
- Removes views from ALL groups first (avoids FK errors)
- Handles views in multiple groups correctly
- Deletes the view group itself

✅ **Error Handling**
- Validates default group exists
- Shows clear error messages
- Handles edge cases (empty groups, multiple groups, etc.)

✅ **User Experience**
- Clear modal with two distinct options
- Descriptive success messages
- Comprehensive console logging for debugging

---

## User Experience

### Before
```
User: "I want to delete this Sales group"
System: *deletes group and all views without asking*
User: "Wait, where did my reports go?!" 😱
```

### After
```
User: "I want to delete this Sales group"
System: "What should I do with the 5 views in this group?"
User: "Move them to Default" ✓
System: *moves views, deletes group*
User: "Perfect! My reports are safe in Default group" 😊
```

OR

```
User: "I want to delete this old Test group"
System: "What should I do with the 2 views in this group?"
User: "Delete everything" ✓
System: *deletes views and group*
User: "Great, all cleaned up!" 😊
```

---

Now you have **full control** over view group deletion! 🎉

Try it:
1. Create a view group with some views
2. Click delete
3. Choose your option
4. Watch the console for detailed logs

Share any issues you encounter! 🚀
