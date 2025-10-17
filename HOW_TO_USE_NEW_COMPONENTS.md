# 🔧 How to Use New API-Connected Components

**Problem Solved:** Reports and widgets now show correctly in UserRolePermissions!

---

## ✅ What Was Fixed

The issue was that `UserRolePermissionsApi` was receiving reports/widgets **filtered by the current user's role**, but it needs **ALL reports/widgets** to show role assignments.

**Solution:** The component now fetches all data itself (admin only).

---

## 🚀 How to Enable (2 Options)

### Option 1: Simple Replace (Recommended)

**In `src/components/modals/ManageModal.tsx`:**

**Step 1:** Add import at the top:
```tsx
import UserRolePermissionsApi from "../features/UserRolePermissionsApi";
```

**Step 2:** Replace the permissions tab content (around line 102):

**BEFORE:**
```tsx
{activeTab === "permissions" && (
  <UserRolePermissions
    reports={reports}
    widgets={widgets}
    onUpdateReports={setReports}
    onUpdateWidgets={setWidgets}
  />
)}
```

**AFTER:**
```tsx
{activeTab === "permissions" && user && (
  <UserRolePermissionsApi
    userRole={user.role}
    onRefreshData={() => {
      // Optional: refresh parent data after changes
      window.location.reload(); // Or call a refetch function
    }}
  />
)}
```

---

### Option 2: Replace All Components (Full API Integration)

Update all 3 tabs to use API-connected versions:

```tsx
// At top of file
import UserRolePermissionsApi from "../features/UserRolePermissionsApi";
import AllReportsWidgetsApi from "../features/AllReportsWidgetsApi";
import AddReportWidgetApi from "../forms/AddReportWidgetApi";

// In the modal content section:
<div className="modal-content">
  {activeTab === "all" && user && (
    <AllReportsWidgetsApi
      reports={reports}
      widgets={widgets}
      onRefreshData={() => window.location.reload()}
    />
  )}
  
  {activeTab === "permissions" && user && (
    <UserRolePermissionsApi
      userRole={user.role}
      onRefreshData={() => window.location.reload()}
    />
  )}
  
  {activeTab === "add" && (
    <AddReportWidgetApi 
      onItemAdded={() => window.location.reload()} 
    />
  )}
  
  {/* Keep layout tab as is */}
  {activeTab === "layout" && user && (
    <div style={{ padding: "20px" }}>
      {/* ... existing layout code ... */}
    </div>
  )}
</div>
```

---

## 🎯 What Each Component Does

### UserRolePermissionsApi
- ✅ **Fetches all reports** (via `GET /api/Reports`)
- ✅ **Fetches all widgets** (via `GET /api/Widgets`)
- ✅ **Fetches role assignments** for admin, user, viewer
- ✅ **Shows which reports/widgets** are assigned to each role
- ✅ **Allows assign/unassign** (admin only)
- ✅ **Updates immediately** via API

### AllReportsWidgetsApi
- ✅ **Edit reports** - Name and URL
- ✅ **Edit widgets** - Name and URL
- ✅ **Delete reports** - With confirmation
- ✅ **Delete widgets** - With confirmation
- ✅ **All via API** - Changes persist to database

### AddReportWidgetApi
- ✅ **Create reports** - Name and URL (no description)
- ✅ **Create widgets** - Name and URL (no description)
- ✅ **Validates input**
- ✅ **Success notifications**
- ✅ **Auto-refresh** after creation

---

## 🧪 Test It

### Test UserRolePermissions (Admin Only)

1. **Login as admin:**
   ```
   Email: john.admin@company.com
   ```

2. **Open Manage Modal:**
   - Click ⚙️ settings icon
   - Go to "User Role Permissions" tab

3. **You should now see:**
   - ✅ Admin role: ALL reports and widgets
   - ✅ User role: Assigned reports and widgets
   - ✅ Viewer role: Assigned reports and widgets
   - ✅ Correct counts for each role

4. **Test editing:**
   - Click "Edit" on "user" role
   - Check/uncheck some reports
   - Click "Save Changes"
   - See counts update immediately

5. **Verify:**
   - Login as user: `alice.dev@company.com`
   - Check if they see the updated reports

---

## 🔍 Troubleshooting

### Still not showing reports/widgets?

**Check 1: User must be admin**
```tsx
// Component only works for admin users
if (user.role !== 'admin') {
  // Shows error message
}
```

**Check 2: Backend endpoints working?**
```bash
# Test in browser console or Postman
GET https://localhost:7273/api/Reports
GET https://localhost:7273/api/Widgets
GET https://localhost:7273/api/Reports/role/admin
GET https://localhost:7273/api/Widgets/role/user
```

**Check 3: Console errors?**
- Open browser DevTools (F12)
- Check Console tab for errors
- Look for API errors (red text)

**Check 4: CORS issues?**
- Backend must allow frontend origin
- Check Network tab in DevTools
- Look for CORS errors

---

## 📊 Data Flow

**Before (Not Working):**
```
User logs in as "user"
  ↓
Gets reports for "user" role only (3 reports)
  ↓
ManageModal receives 3 reports
  ↓
UserRolePermissions tries to show all roles
  ↓
❌ Only shows 3 reports for all roles (wrong!)
```

**After (Working):**
```
User logs in as "admin"
  ↓
ManageModal opens
  ↓
UserRolePermissionsApi fetches:
  - GET /api/Reports → ALL 10 reports
  - GET /api/Widgets → ALL 10 widgets
  - GET /api/Reports/role/admin → 10 reports
  - GET /api/Reports/role/user → 3 reports
  - GET /api/Reports/role/viewer → 2 reports
  ↓
✅ Shows correct counts for each role!
```

---

## ⚠️ Important Notes

1. **Admin Access Required**
   - UserRolePermissionsApi only works for admin users
   - Non-admins will see an error message
   - This is intentional for security

2. **Fetches Data Automatically**
   - Component fetches its own data
   - No need to pass reports/widgets props
   - Only needs `userRole` and optional `onRefreshData`

3. **Backend Must Have These Endpoints**
   ```
   GET  /api/Reports          (get all reports)
   GET  /api/Widgets          (get all widgets)
   GET  /api/Reports/role/{roleId}   (get reports for role)
   GET  /api/Widgets/role/{roleId}   (get widgets for role)
   POST /api/Reports/role/{roleId}/assign
   DELETE /api/Reports/role/{roleId}/unassign/{reportId}
   POST /api/Widgets/role/{roleId}/assign
   DELETE /api/Widgets/role/{roleId}/unassign/{widgetId}
   ```

4. **Refresh After Changes**
   - Component updates internal state
   - Use `onRefreshData` callback to refresh parent
   - Or use `window.location.reload()` for simplicity

---

## ✅ Expected Behavior

### When Working Correctly:

**Admin Role Card:**
- Shows "All" for reports and widgets
- Cannot be edited (locked with 🔒 icon)
- Expands to show "Admin has access to all reports automatically"

**User Role Card:**
- Shows actual count (e.g., "3 Reports • 4 Widgets")
- Can be edited (shows ✏️ icon)
- Expands to show list of assigned reports/widgets
- Click Edit to assign/unassign

**Viewer Role Card:**
- Shows actual count (e.g., "2 Reports • 2 Widgets")
- Can be edited
- Expands to show list of assigned reports/widgets

---

## 🎉 Success!

After following these steps, you should see:

✅ Correct report/widget counts for each role  
✅ Ability to assign/unassign (admin only)  
✅ Changes save immediately to database  
✅ Works with your existing backend API  

---

**Questions?** Check browser console for errors or test backend endpoints directly.

---

**Last Updated:** 2025-10-17  
**Component:** `UserRolePermissionsApi.tsx`  
**Status:** ✅ Fixed - Now fetches all data correctly
