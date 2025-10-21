# Debugging Guide: Delete & Ordering Issues

## How to Debug Issues

### Step 1: Open Browser Console

Press `F12` in your browser to open DevTools, then go to the **Console** tab.

---

## Debugging Delete View Error

### Expected Console Output (Success)

```
🗑️ Deleting view: view-abc123 My Sales Report
🌐 API Request: DELETE https://localhost:7273/api/Views/view-abc123?userId=user123
✅ API Response: DELETE https://localhost:7273/api/Views/view-abc123?userId=user123
✅ View deleted successfully
🔄 Refreshing navigation data...
```

### If You See Error

```
🗑️ Deleting view: view-abc123 My Sales Report
🌐 API Request: DELETE https://localhost:7273/api/Views/view-abc123?userId=user123
❌ Failed to delete view: ApiError { status: 404, message: "View not found" }
```

### Common Delete Errors

#### Error 1: 404 Not Found
```
❌ Failed to delete view: View not found
```

**Causes:**
- View doesn't exist in database
- UserId doesn't match (view belongs to different user)
- View was already deleted

**Check:**
1. Open Network tab in DevTools
2. Look for the DELETE request
3. Check the URL: `DELETE /api/Views/{viewId}?userId={userId}`
4. Verify both viewId and userId are correct

#### Error 2: 400 Bad Request
```
❌ Failed to delete view: Bad request
```

**Causes:**
- Invalid viewId format
- Missing userId parameter

**Check:**
1. Console log should show: `🗑️ Deleting view: {id} {name}`
2. Verify ID is not empty or malformed

#### Error 3: Network Error
```
❌ Failed to delete view: Network request failed
```

**Causes:**
- Backend not running
- CORS issue
- Wrong API URL

**Check:**
1. Is backend running on `https://localhost:7273`?
2. Check `src/config/api.config.ts` for correct BASE_URL
3. Check CORS settings in backend

---

## Debugging Ordering Issues

### Test 1: Reorder View Groups

**Steps:**
1. Drag a view group up or down
2. Drop it in new position
3. Check console

**Expected Console Output (Success):**
```
🔄 Reordering view groups: [
  {id: "vg-2", orderIndex: 0},
  {id: "vg-1", orderIndex: 1}
]
🌐 API Request: POST https://localhost:7273/api/ViewGroups/reorder
✅ API Response: POST ... (200 OK)
✅ View groups reordered successfully
🔄 Refreshing navigation data...
🔄 Refetching view groups for user: user123
✅ View groups refetched: 2
📊 API ViewGroups updated: 2
🔄 Data changed - updating navigation content
```

**If Order Doesn't Persist:**

1. Check if API call succeeded:
   ```
   🌐 API Request: POST https://localhost:7273/api/ViewGroups/reorder
   ```

2. Check response:
   - If 200 OK → Backend saved successfully
   - If 400/404/500 → Backend error

3. Check refetch happened:
   ```
   ✅ View groups refetched: 2
   ```

4. Check if data came back in correct order:
   - Open Network tab
   - Look for `GET /api/ViewGroups/user/{userId}`
   - Check response body - are orderIndex values correct?

### Test 2: Reorder Views Within Group

**Steps:**
1. Drag a view up or down within the same view group
2. Drop it in new position
3. Check console

**Expected Console Output (Success):**
```
🔄 Reordering views in group: vg-1 [
  {id: "view-2", orderIndex: 0},
  {id: "view-1", orderIndex: 1}
]
🌐 API Request: POST https://localhost:7273/api/ViewGroups/vg-1/views/reorder
✅ API Response: POST ... (200 OK)
✅ Views reordered successfully
🔄 Refreshing navigation data...
```

**If Order Doesn't Persist:**

Same debugging steps as above, but check:
- `POST /api/ViewGroups/{id}/views/reorder`
- Response should be 200 OK
- Refetch should get views in new order

### Test 3: Move View Between Groups

**Steps:**
1. Drag a view from one group
2. Drop it on another group
3. Check console

**Expected Console Output (Success):**
```
🔀 Moving view between groups: {
  view: "view-1",
  from: "vg-1",
  to: "vg-2"
}
🌐 API Request: DELETE https://localhost:7273/api/ViewGroups/vg-1/views/view-1?userId=user123
✅ API Response: DELETE ... (204 No Content)
🌐 API Request: POST https://localhost:7273/api/ViewGroups/vg-2/views
✅ API Response: POST ... (200 OK)
✅ View moved successfully
🔄 Refreshing navigation data...
```

**If Move Doesn't Work:**

1. Check if both API calls succeeded:
   - DELETE from source group
   - POST to target group

2. Check Network tab for errors

3. Verify view appears in new group after refetch

---

## Common Issues & Solutions

### Issue: "Changes not saved" message appears

**Cause:** API call failed

**Debug:**
1. Check console for API error:
   ```
   ❌ Failed to reorder views: ApiError { status: 400, ... }
   ```

2. Look at Network tab:
   - Find the failed request (shown in red)
   - Check Status Code (400, 404, 500, etc.)
   - Check Response tab for error message

3. Common causes:
   - Backend not running
   - Invalid data format
   - Database error

### Issue: Order changes but reverts after refresh

**Cause:** Backend saved but returned wrong data

**Debug:**
1. Check if save succeeded:
   ```
   ✅ Views reordered successfully
   ```

2. Check refetch:
   ```
   ✅ Views refetched: 2
   ```

3. Check GET request in Network tab:
   - `GET /api/ViewGroups/user/{userId}`
   - Look at response body
   - Check if `orderIndex` values are correct

4. **If backend returned wrong order:**
   - Backend bug - check `ViewGroupService.cs`
   - Database not updating correctly

### Issue: Drag and drop doesn't trigger anything

**Cause:** Drag event handlers not working

**Debug:**
1. Check if drag events fire:
   - Add console.log in `handleDragStart`
   - Should see log when you start dragging

2. Check if drop fires:
   - Add console.log in `handleDrop`
   - Should see log when you drop

3. Common causes:
   - CSS preventing drag events
   - Elements not marked as draggable
   - Event propagation stopped

**Quick Test:**
```typescript
// Temporarily add to NavigationPanel
const handleDragStart = (e, type, id) => {
  console.log('🎯 DRAG STARTED:', type, id);  // Add this
  // ... rest of code
};

const handleDrop = (e, targetId, targetType) => {
  console.log('🎯 DROPPED ON:', targetType, targetId);  // Add this
  // ... rest of code
};
```

---

## Backend Verification Checklist

### Is Backend Running?

Open browser and go to:
```
https://localhost:7273/swagger
```

You should see Swagger UI with all API endpoints.

### Test Delete Endpoint Directly

In Swagger:
1. Expand `DELETE /api/Views/{id}`
2. Click "Try it out"
3. Enter:
   - `id`: your view ID (e.g., "view-abc123")
   - `userId`: your user ID (e.g., "user123")
4. Click "Execute"
5. Check response:
   - 204 No Content = Success
   - 404 Not Found = View not found or wrong user
   - 500 Internal Server Error = Database error

### Test Reorder Endpoint Directly

In Swagger:
1. Expand `POST /api/ViewGroups/reorder`
2. Click "Try it out"
3. Enter body:
   ```json
   {
     "userId": "user123",
     "items": [
       {"id": "vg-1", "orderIndex": 1},
       {"id": "vg-2", "orderIndex": 0}
     ]
   }
   ```
4. Click "Execute"
5. Check response:
   - 200 OK = Success
   - 400 Bad Request = Invalid data
   - 404 Not Found = View group not found

---

## Quick Diagnostics

### 1. Open Browser Console and Login

Look for these messages in order:

```
✅ API Data loaded successfully { reports: X, widgets: Y, views: Z, viewGroups: W }
📊 API Views updated: Z
📊 API ViewGroups updated: W
🔨 Creating navigation content - views: Z viewGroups: W
📊 NavigationPanel received view groups: W
  View Group: {name} isVisible: true viewIds: {count}
🔓 Auto-expanding view groups: [...]
🔍 Visible view groups: W / W
```

**If you see all these → Initial load is working!**

### 2. Try to Delete a View

You should see:
```
🗑️ Deleting view: {id} {name}
🌐 API Request: DELETE https://localhost:7273/api/Views/{id}?userId={userId}
✅ View deleted successfully
🔄 Refreshing navigation data...
```

**If you see ❌ instead → Check error message**

### 3. Try to Reorder View Groups

You should see:
```
🔄 Reordering view groups: [...]
🌐 API Request: POST https://localhost:7273/api/ViewGroups/reorder
✅ View groups reordered successfully
🔄 Refreshing navigation data...
```

**If you see ❌ instead → Check error message**

### 4. Try to Reorder Views

You should see:
```
🔄 Reordering views in group: {groupId} [...]
🌐 API Request: POST https://localhost:7273/api/ViewGroups/{id}/views/reorder
✅ Views reordered successfully
🔄 Refreshing navigation data...
```

**If you see ❌ instead → Check error message**

---

## Files to Check

### Frontend
1. `src/components/navigation/NavigationPanel.tsx` - All handlers updated
2. `src/services/viewsService.ts` - Delete method
3. `src/services/viewGroupsService.ts` - Reorder methods
4. `src/config/api.config.ts` - API endpoints

### Backend
1. `/Controllers/ViewsController.cs` - DELETE endpoint (line 136-149)
2. `/Controllers/ViewGroupsController.cs` - All endpoints
3. `/Services/ViewGroupService.cs` - Reorder implementation

---

## Next Steps

1. **Try the operations** (delete, reorder, move)
2. **Check browser console** for logs
3. **Share console output** if errors occur
4. **Check Network tab** for failed requests
5. **Verify backend** is running on correct port

---

## What Should Work Now

✅ **Delete View** - Removes from database, shows error if fails
✅ **Delete View Group** - Removes group (and optionally views)
✅ **Reorder View Groups** - Persists order to database
✅ **Reorder Views** - Persists order to database
✅ **Move Views** - Removes from one group, adds to another
✅ **Error Messages** - Shows actual error details
✅ **Console Logging** - Comprehensive debugging information

All operations now properly call the backend API and refresh data! 🚀
