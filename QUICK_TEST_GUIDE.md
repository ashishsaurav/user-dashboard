# Quick Test Guide - Manage Reports & Widgets CRUD Operations

## 🚀 Quick Start

### Prerequisites
1. ✅ Backend API running: `https://localhost:7273`
2. ✅ Frontend running: `npm start`
3. ✅ Database connected and seeded
4. ✅ User logged in (preferably as admin)

---

## 📋 Testing Each Tab

### Tab 1: All Reports & Widgets

**Open:** Click gear icon (⚙️) → "Manage Reports & Widgets" → "All Reports & Widgets" tab

#### Test CREATE (via Tab 3 first)
1. Go to "Add Report & Widget" tab
2. Fill form: Name = "Test Report", URL = "https://example.com"
3. Click floating + button
4. ✅ Check: Success notification appears
5. ✅ Check: Form clears
6. Go back to "All Reports & Widgets" tab
7. ✅ Check: New report appears in list

#### Test READ
1. ✅ Check: All reports displayed in left card
2. ✅ Check: All widgets displayed in right card
3. ✅ Check: Item counts shown in headers

#### Test UPDATE
1. Click edit icon (✏️) on any report
2. Modal opens with current values
3. Change name: "Updated Report Name"
4. Click "Save Changes"
5. ✅ Check: Success notification
6. ✅ Check: Report name updated in list

#### Test DELETE
1. Click delete icon (🗑️) on any report
2. Confirmation modal appears
3. Click "Delete"
4. ✅ Check: Success notification
5. ✅ Check: Report removed from list

---

### Tab 2: User Role Permissions

**Open:** Click "User Role Permissions" tab

#### Test READ
1. ✅ Check: Three role cards (Admin, User, Viewer)
2. ✅ Check: Admin shows "Full Access"
3. Click on each role to expand
4. ✅ Check: Shows assigned reports and widgets

#### Test ASSIGN (Add Permissions)
1. Click edit icon on "User" role
2. Modal opens with checkboxes
3. Select 2-3 reports
4. Select 1-2 widgets
5. Click "Save Changes"
6. ✅ Check: Success notification
7. ✅ Check: User role now shows selected items
8. ✅ Check: Counts updated

#### Test UNASSIGN (Remove Permissions)
1. Click edit icon on "User" role again
2. Uncheck previously selected items
3. Click "Save Changes"
4. ✅ Check: Success notification
5. ✅ Check: Items removed from User role

#### Test ADMIN PROTECTION
1. Try to click edit on "Admin" role
2. ✅ Check: Shows lock icon, cannot edit
3. ✅ Check: Admin always has "All" access

---

### Tab 3: Add Report & Widget

**Open:** Click "Add Report & Widget" tab

#### Test CREATE REPORT
1. Ensure "Add Report" tab is active
2. Fill in:
   - Name: "My Test Report"
   - URL: "https://example.com/report"
3. Click floating + button
4. ✅ Check: Success notification
5. ✅ Check: Form clears
6. Go to "All Reports & Widgets" tab
7. ✅ Check: New report appears

#### Test CREATE WIDGET
1. Click "Add Widget" button
2. Fill in:
   - Name: "My Test Widget"
   - URL: "https://example.com/widget"
3. Click floating + button
4. ✅ Check: Success notification
5. ✅ Check: Form clears
6. Go to "All Reports & Widgets" tab
7. ✅ Check: New widget appears

#### Test VALIDATION
1. Try to submit with empty name
2. ✅ Check: Browser validation prevents submit
3. Try invalid URL format
4. ✅ Check: Browser validation shows error

---

## 🔍 API Call Verification

### Check Network Tab (Chrome DevTools)

#### All Reports & Widgets Tab:
```
GET  https://localhost:7273/api/Reports
GET  https://localhost:7273/api/Widgets
PUT  https://localhost:7273/api/Reports/{id}
PUT  https://localhost:7273/api/Widgets/{id}
DELETE https://localhost:7273/api/Reports/{id}
DELETE https://localhost:7273/api/Widgets/{id}
```

#### User Role Permissions Tab:
```
GET  https://localhost:7273/api/Reports
GET  https://localhost:7273/api/Widgets
GET  https://localhost:7273/api/Reports/role/admin
GET  https://localhost:7273/api/Reports/role/user
GET  https://localhost:7273/api/Reports/role/viewer
GET  https://localhost:7273/api/Widgets/role/admin
GET  https://localhost:7273/api/Widgets/role/user
GET  https://localhost:7273/api/Widgets/role/viewer
POST https://localhost:7273/api/Reports/role/{roleId}/assign
POST https://localhost:7273/api/Widgets/role/{roleId}/assign
DELETE https://localhost:7273/api/Reports/role/{roleId}/unassign/{reportId}
DELETE https://localhost:7273/api/Widgets/role/{roleId}/unassign/{widgetId}
```

#### Add Report & Widget Tab:
```
POST https://localhost:7273/api/Reports
POST https://localhost:7273/api/Widgets
```

---

## ⚠️ Error Testing

### Test Network Errors
1. Stop backend server
2. Try any operation
3. ✅ Check: Error notification appears
4. ✅ Check: Error message is descriptive
5. ✅ Check: UI doesn't crash

### Test Validation Errors
1. Create report with duplicate name (if backend validates)
2. ✅ Check: Error message from API shown
3. Try to delete non-existent item
4. ✅ Check: 404 error handled gracefully

### Test Permission Errors
1. Login as "user" or "viewer" role
2. Try to access "User Role Permissions" tab
3. ✅ Check: Shows "Only administrators can manage" message

---

## 🎯 Success Criteria

### Functionality
- ✅ All CRUD operations work (Create, Read, Update, Delete)
- ✅ Data persists in database
- ✅ UI updates immediately after operations
- ✅ No console errors

### User Experience
- ✅ Loading states show during operations
- ✅ Success notifications appear
- ✅ Error messages are clear and helpful
- ✅ Forms validate properly
- ✅ Buttons disable during loading

### Performance
- ✅ API calls complete within 2 seconds
- ✅ Batch operations faster than individual calls
- ✅ No unnecessary re-renders
- ✅ No memory leaks

---

## 🐛 Common Issues

### "Failed to load data"
- **Check:** Backend running on port 7273?
- **Check:** CORS enabled?
- **Check:** Database connected?

### "Failed to update permissions"
- **Check:** Logged in as admin?
- **Check:** Valid role ID (admin/user/viewer)?
- **Check:** Reports/widgets exist?

### "Network Error"
- **Check:** HTTPS certificate trusted?
- **Check:** Firewall blocking connection?
- **Check:** Correct API URL in config?

---

## 📊 Expected Results

### After Full Test Cycle:

**Reports:**
- Created: 1-2 new test reports
- Updated: At least 1 report name changed
- Deleted: At least 1 report removed

**Widgets:**
- Created: 1-2 new test widgets
- Updated: At least 1 widget name changed
- Deleted: At least 1 widget removed

**Permissions:**
- User role has specific reports/widgets assigned
- Viewer role has different set of permissions
- Admin always has full access

---

## ✅ Final Checklist

- [ ] All tabs load without errors
- [ ] Can create reports and widgets
- [ ] Can edit existing reports and widgets
- [ ] Can delete reports and widgets
- [ ] Can assign permissions to roles
- [ ] Can unassign permissions from roles
- [ ] Success notifications appear
- [ ] Error handling works
- [ ] Loading states show correctly
- [ ] Data refreshes after operations
- [ ] No console errors
- [ ] Database updated correctly

---

**Total Test Time:** ~10-15 minutes  
**Pass Criteria:** All checkboxes ✅ checked

Happy Testing! 🚀
