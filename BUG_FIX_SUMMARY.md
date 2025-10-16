# Bug Fix: Inconsistent Report/Widget Counts

## 🐛 Issue
Report and widget counts were different between the navigation menu and the "All View Groups" modal.

**Example:** Executive Dashboard showed:
- Navigation menu: 2 Reports, 2 Widgets
- Modal: 1 Report, 2 Widgets

**Root Cause:** The modal was loading data from `sessionStorage` (which was `null`) and falling back to `testReports` instead of using API data.

---

## ✅ Solution

### Files Fixed:

#### 1. `src/components/modals/NavigationManageModal.tsx`
**Problem:** Was reading from `sessionStorage.getItem("reports")` and falling back to `testReports`

**Fix:**
- Added `reports` and `widgets` props to receive API data
- Removed sessionStorage logic
- Removed imports of `testReports`, `testWidgets`

```typescript
// ❌ Before
const getUserAccessibleReports = () => {
  const savedReports = sessionStorage.getItem("reports");
  const systemReports = savedReports ? JSON.parse(savedReports) : testReports;
  // ... filtering logic
};

// ✅ After
const getUserAccessibleReports = () => reports; // Already filtered by API
```

#### 2. `src/components/modals/ManageModal.tsx`
**Problem:** Same issue - using sessionStorage/testData

**Fix:**
- Added `reports` and `widgets` props
- Initialize from API data instead of sessionStorage
- Removed sessionStorage persistence logic

#### 3. `src/components/dashboard/DashboardDock.tsx`
**Problem:** Not passing API reports/widgets to modals

**Fix:**
- Pass `reports={getUserAccessibleReports()}` to both modals
- Pass `widgets={getUserAccessibleWidgets()}` to both modals

---

## 🧪 How to Test

1. **Login as admin** (should have access to ALL reports/widgets)

2. **Check Navigation Menu:**
   - Click on a view (e.g., "Executive Dashboard")
   - Note the count: "X Reports, Y Widgets"

3. **Check Modal:**
   - Click ⚙️ (settings) → "Manage Navigation"
   - Find the same view in "All View Groups & Views"
   - Verify the count matches the navigation menu

4. **Verify:**
   - Both should show the SAME counts
   - Admin should see ALL reports/widgets (as per `RoleReports`/`RoleWidgets` tables)

---

## 📊 Data Flow (After Fix)

```
Backend API
    ↓
useApiData Hook (loads reports/widgets by role)
    ↓
DashboardDock Component (stores in state)
    ↓
    ├── NavigationPanel (gets reports/widgets)
    ├── NavigationManageModal (gets reports/widgets) ✅ FIXED
    └── ManageModal (gets reports/widgets) ✅ FIXED
```

---

## 🔍 What Changed

### Before:
- `NavigationPanel`: Used API data ✅
- `NavigationManageModal`: Used sessionStorage/testData ❌
- `ManageModal`: Used sessionStorage/testData ❌

### After:
- `NavigationPanel`: Used API data ✅
- `NavigationManageModal`: Uses API data ✅
- `ManageModal`: Uses API data ✅

---

## 🚀 Next Steps

1. **Test the fix:**
   ```bash
   npm start
   ```

2. **Verify database has correct mappings:**
   ```sql
   -- Check admin has access to all reports
   SELECT * FROM RoleReports WHERE RoleId = 'admin';
   SELECT * FROM RoleWidgets WHERE RoleId = 'admin';
   ```

3. **If admin user doesn't see all reports/widgets:**
   - Backend is not returning all items from `/api/reports/role/admin`
   - Check `RoleReports` and `RoleWidgets` tables have entries for all items

---

## 💡 Key Takeaway

**Always use a single source of truth for data!**

The app now consistently uses API data throughout, eliminating the sessionStorage/testData inconsistency.
