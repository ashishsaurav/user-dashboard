# Quick Test Guide - View Management

## ✅ All Features Implemented!

### What's New:
- ✅ Add reports to view (via modal) → Backend API
- ✅ Add widgets to view (via modal) → Backend API  
- ✅ Remove reports from view (X button) → Backend API
- ✅ Remove widgets from view (X button) → Backend API

---

## Quick Tests

### 1. Add Report to View (30 seconds)

```
1. Select any view from navigation
2. Click "Add Report" button
3. Select 2-3 reports from modal
4. Click "Add Selected"
5. ✅ Success notification appears
6. ✅ Reports show in Reports panel
7. ✅ Modal closes
```

**Network Check:**
```
POST /api/Views/{viewId}/reports
Status: 200 OK
```

---

### 2. Add Widget to View (30 seconds)

```
1. Select any view from navigation
2. Click "Add Widget" button
3. Select 2-3 widgets from modal
4. Click "Add Selected"
5. ✅ Success notification appears
6. ✅ Widgets show in Widgets panel
7. ✅ Modal closes
```

**Network Check:**
```
POST /api/Views/{viewId}/widgets
Status: 200 OK
```

---

### 3. Remove Report from View (20 seconds)

```
1. Select a view with reports
2. Click X on any report tab
3. Confirm deletion
4. ✅ Success notification appears
5. ✅ Report disappears
6. ✅ Tab switches if removed was active
```

**Network Check:**
```
DELETE /api/Views/{viewId}/reports/{reportId}?userId={userId}
Status: 204 No Content
```

---

### 4. Remove Widget from View (20 seconds)

```
1. Select a view with widgets
2. Click X on any widget card
3. Confirm deletion
4. ✅ Success notification appears
5. ✅ Widget disappears
```

**Network Check:**
```
DELETE /api/Views/{viewId}/widgets/{widgetId}?userId={userId}
Status: 204 No Content
```

---

## Expected Behavior

### Success Notifications:
- "Reports Added - X report(s) added to [View Name]"
- "Widgets Added - X widget(s) added to [View Name]"
- "Report Removed - [Report Name] removed from [View Name]"
- "Widget Removed - [Widget Name] removed from [View Name]"

### Console Logs:
- `✅ Added X reports to view "[View Name]"`
- `✅ Added X widgets to view "[View Name]"`
- `✅ Removed report {id} from view "[View Name]"`
- `✅ Removed widget {id} from view "[View Name]"`

### Error Handling:
- Network errors show error notification
- API errors show backend error message
- Operations can be retried

---

## Common Issues

### "Failed to add reports"
- **Check:** Backend running on port 7273?
- **Check:** View selected?
- **Check:** Reports selected?

### "Failed to remove report"
- **Check:** Backend accessible?
- **Check:** User has permission?
- **Check:** Report exists in view?

### Network Error
- **Check:** Backend server running
- **Check:** CORS enabled
- **Check:** Correct API URL

---

## API Endpoints Summary

| Operation | Method | Endpoint | Body/Query |
|-----------|--------|----------|------------|
| Add Reports | POST | `/api/Views/{id}/reports` | `{ userId, reportIds[] }` |
| Add Widgets | POST | `/api/Views/{id}/widgets` | `{ userId, widgetIds[] }` |
| Remove Report | DELETE | `/api/Views/{id}/reports/{reportId}` | `?userId={userId}` |
| Remove Widget | DELETE | `/api/Views/{id}/widgets/{widgetId}` | `?userId={userId}` |

---

## Files Changed

✅ `src/components/dashboard/DashboardDock.tsx`
- Updated 4 handler functions to call backend API
- Added error handling
- Added success notifications
- Added auto-refresh

---

**All operations ready for testing!** 🚀

**Total Test Time:** ~2 minutes
