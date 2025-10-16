# Fix: User Role Permissions Tab Not Loading

## 🐛 Issue
The "User Role Permissions" tab in the Manage modal was not loading/displaying.

## 🔍 Root Cause

The `UserRolePermissions` component expects `Report` and `Widget` objects to have a populated `userRoles: string[]` property, but:

1. **Backend Design:** Role-based permissions are managed via junction tables (`RoleReports`, `RoleWidgets`), NOT as properties on Report/Widget entities
2. **DTO Structure:** Backend DTOs (`ReportDto`, `WidgetDto`) don't include role assignment information
3. **API Gap:** No backend endpoint exists to fetch "which roles have access to each report/widget"

**Example of what's missing:**
```typescript
// Current API response for a report:
{
  reportId: "report-1",
  reportName: "Sales Report",
  reportUrl: "...",
  isActive: true
  // ❌ Missing: Which roles have access?
}

// What the component needs:
{
  id: "report-1",
  name: "Sales Report",
  url: "...",
  type: "Report",
  userRoles: ["admin", "user"]  // ❌ Not provided by backend
}
```

## ✅ Solution

### Temporary Fix (Current)
Show a clear informational message explaining:
- Role-based access control IS working
- Permissions are managed in the database
- UI for editing requires additional API endpoints

### Files Modified:

#### 1. `src/components/modals/ManageModal.tsx`
Replaced the permissions tab content with an informative message:

```typescript
{activeTab === "permissions" && (
  <div style={{ /* ... */ }}>
    <h3>Role Permissions Management</h3>
    <p>This feature requires backend API support...</p>
    <ul>
      <li>✅ Role-based access control is working</li>
      <li>✅ Permissions managed via database</li>
      <li>⏳ UI for editing requires additional API endpoints</li>
    </ul>
  </div>
)}
```

#### 2. `src/services/reportsService.ts` & `src/services/widgetsService.ts`
Added clear comments explaining why `userRoles` is empty:

```typescript
private transformToFrontend(dto: ReportDto): Report {
  return {
    // ...
    // Note: userRoles is managed via backend RoleReports table
    // To populate this, we'd need a separate API endpoint
    userRoles: [],
  };
}
```

## 🚀 Permanent Solution (Future)

To fully enable the permissions management UI, the backend needs these new endpoints:

### Required Backend Endpoints:

1. **Get Report Role Assignments**
   ```
   GET /api/reports/{reportId}/roles
   Response: ["admin", "user"]
   ```

2. **Get Widget Role Assignments**
   ```
   GET /api/widgets/{widgetId}/roles
   Response: ["admin", "viewer"]
   ```

3. **Get All Reports with Roles** (Alternative)
   ```
   GET /api/reports/with-roles
   Response: [
     {
       reportId: "report-1",
       reportName: "...",
       roles: ["admin", "user"]
     }
   ]
   ```

4. **Update Report Role Assignments**
   ```
   PUT /api/reports/{reportId}/roles
   Body: { roleIds: ["admin", "user"] }
   ```

5. **Update Widget Role Assignments**
   ```
   PUT /api/widgets/{widgetId}/roles
   Body: { roleIds: ["admin", "viewer"] }
   ```

### Backend Implementation:

```csharp
// Example controller method
[HttpGet("{id}/roles")]
public async Task<ActionResult<List<string>>> GetReportRoles(string id)
{
    var roleIds = await _context.RoleReports
        .Where(rr => rr.ReportId == id)
        .Select(rr => rr.RoleId)
        .ToListAsync();
    
    return Ok(roleIds);
}
```

### Frontend Updates (After Backend):

Once backend endpoints are available:

1. Update `ReportDto` and `WidgetDto` interfaces to include `roles: string[]`
2. Update transformation functions to populate `userRoles`
3. Re-enable the `UserRolePermissions` component
4. Add API calls to save permission changes

## 🧪 Testing

Current state:
1. Open Manage modal
2. Click "User Role Permissions" tab
3. Should see informative message (not an error)

After backend implementation:
1. Should see list of roles with assigned reports/widgets
2. Should be able to edit non-admin role permissions
3. Changes should persist to database

## 📊 Current vs. Required

| Feature | Current Status | Required For Full Support |
|---------|---------------|---------------------------|
| View role assignments | ❌ No API | ✅ GET endpoints with role data |
| Edit role permissions | ❌ No UI/API | ✅ PUT endpoints to update assignments |
| Real-time updates | ❌ N/A | ✅ WebSocket or polling |
| Audit logging | ❌ N/A | ✅ Track permission changes |

## 💡 Key Takeaway

**Role-based access control is WORKING** - users only see reports/widgets they have access to. The permissions management UI just needs backend API support to allow editing those assignments through the interface.
