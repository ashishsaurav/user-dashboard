# Alternative Backend Solution: Manual Cleanup Before Delete

**If you prefer NOT to use CASCADE DELETE**, you can manually clean up references before deletion.

---

## 🔧 Option: Update Controllers with Manual Cleanup

### Update ReportsController.cs

**File:** `DashboardPortal/Controllers/ReportsController.cs`

Replace the existing `DeleteReport` method:

```csharp
// DELETE: api/Reports/{id}
[HttpDelete("{id}")]
public async Task<IActionResult> DeleteReport(string id)
{
    var report = await _context.Reports.FindAsync(id);
    if (report == null)
        return NotFound(new { message = "Report not found" });

    try
    {
        // Step 1: Remove from all views (ViewReports junction table)
        var viewReports = await _context.ViewReports
            .Where(vr => vr.ReportId == id)
            .ToListAsync();
        
        if (viewReports.Any())
        {
            _context.ViewReports.RemoveRange(viewReports);
            Console.WriteLine($"Removing {viewReports.Count} ViewReport entries for report {id}");
        }

        // Step 2: Remove role assignments (RoleReports junction table)
        var roleReports = await _context.RoleReports
            .Where(rr => rr.ReportId == id)
            .ToListAsync();
        
        if (roleReports.Any())
        {
            _context.RoleReports.RemoveRange(roleReports);
            Console.WriteLine($"Removing {roleReports.Count} RoleReport entries for report {id}");
        }

        // Step 3: Delete the report itself
        _context.Reports.Remove(report);

        // Save all changes in a single transaction
        await _context.SaveChangesAsync();

        Console.WriteLine($"Successfully deleted report {id} with all references");
        return NoContent();
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Error deleting report {id}: {ex.Message}");
        return StatusCode(500, new { message = "Failed to delete report", details = ex.Message });
    }
}
```

### Update WidgetsController.cs

**File:** `DashboardPortal/Controllers/WidgetsController.cs`

Replace the existing `DeleteWidget` method:

```csharp
// DELETE: api/Widgets/{id}
[HttpDelete("{id}")]
public async Task<IActionResult> DeleteWidget(string id)
{
    var widget = await _context.Widgets.FindAsync(id);
    if (widget == null)
        return NotFound(new { message = "Widget not found" });

    try
    {
        // Step 1: Remove from all views (ViewWidgets junction table)
        var viewWidgets = await _context.ViewWidgets
            .Where(vw => vw.WidgetId == id)
            .ToListAsync();
        
        if (viewWidgets.Any())
        {
            _context.ViewWidgets.RemoveRange(viewWidgets);
            Console.WriteLine($"Removing {viewWidgets.Count} ViewWidget entries for widget {id}");
        }

        // Step 2: Remove role assignments (RoleWidgets junction table)
        var roleWidgets = await _context.RoleWidgets
            .Where(rw => rw.WidgetId == id)
            .ToListAsync();
        
        if (roleWidgets.Any())
        {
            _context.RoleWidgets.RemoveRange(roleWidgets);
            Console.WriteLine($"Removing {roleWidgets.Count} RoleWidget entries for widget {id}");
        }

        // Step 3: Delete the widget itself
        _context.Widgets.Remove(widget);

        // Save all changes in a single transaction
        await _context.SaveChangesAsync();

        Console.WriteLine($"Successfully deleted widget {id} with all references");
        return NoContent();
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Error deleting widget {id}: {ex.Message}");
        return StatusCode(500, new { message = "Failed to delete widget", details = ex.Message });
    }
}
```

---

## ✅ Benefits of Manual Cleanup Approach

1. ✅ **No database migration needed** - Works with existing schema
2. ✅ **Explicit control** - You can see exactly what's being deleted
3. ✅ **Logging** - Can log each step for audit trail
4. ✅ **Transaction safety** - All deletes happen in one transaction
5. ✅ **Business logic** - Can add additional checks before deletion

---

## 🧪 Testing

### Test Case 1: Delete Report with Multiple References

```bash
# Setup: Create report and add to multiple views
POST /api/Reports
{
  "reportName": "Test Report",
  "reportUrl": "https://example.com/test"
}
# Response: { "reportId": "report-123", ... }

# Assign to roles
POST /api/Reports/role/admin/assign
{ "reportIds": ["report-123"] }

POST /api/Reports/role/user/assign
{ "reportIds": ["report-123"] }

# Add to views
POST /api/Views/{viewId1}/reports
{ "userId": "user1", "reportIds": ["report-123"] }

POST /api/Views/{viewId2}/reports
{ "userId": "user1", "reportIds": ["report-123"] }

# Now delete
DELETE /api/Reports/report-123

# Expected result: 204 No Content
# Console output:
# Removing 2 ViewReport entries for report report-123
# Removing 2 RoleReport entries for report report-123
# Successfully deleted report report-123 with all references
```

### Test Case 2: Delete Report Not in Any Views

```bash
DELETE /api/Reports/report-orphan

# Expected result: 204 No Content
# Console output:
# Successfully deleted report report-orphan with all references
# (no ViewReport or RoleReport entries to remove)
```

### Test Case 3: Delete Non-Existent Report

```bash
DELETE /api/Reports/report-doesnotexist

# Expected result: 404 Not Found
# Response: { "message": "Report not found" }
```

---

## 📊 Comparison: CASCADE vs MANUAL

| Aspect | CASCADE Delete | Manual Cleanup |
|--------|----------------|----------------|
| **Database Migration** | ✅ Required | ❌ Not needed |
| **Performance** | ⚡ Faster (DB handles) | 🐌 Slower (app handles) |
| **Code Complexity** | ✅ Simpler | ⚠️ More code |
| **Audit Trail** | ⚠️ Limited | ✅ Full logging |
| **Rollback** | ⚠️ Need migration | ✅ Just code change |
| **Business Logic** | ❌ Can't add checks | ✅ Can add validation |
| **Standard Practice** | ✅ Yes | ⚠️ Less common |

---

## 🎯 Recommendation

### Use CASCADE Delete if:
- ✅ You can modify database schema
- ✅ You want standard database practice
- ✅ You want better performance
- ✅ You don't need custom business logic on delete

### Use Manual Cleanup if:
- ✅ You **cannot** modify database schema
- ✅ You need detailed logging of deletions
- ✅ You want to add validation before cleanup
- ✅ You prefer explicit code over database behavior
- ✅ You're working with legacy database

---

## 🔍 Debugging

### Check What Will Be Deleted

Add this helper endpoint to inspect references before deletion:

```csharp
// GET: api/Reports/{id}/references
[HttpGet("{id}/references")]
public async Task<IActionResult> GetReportReferences(string id)
{
    var report = await _context.Reports.FindAsync(id);
    if (report == null)
        return NotFound();

    var viewReports = await _context.ViewReports
        .Where(vr => vr.ReportId == id)
        .Include(vr => vr.View)
        .ToListAsync();

    var roleReports = await _context.RoleReports
        .Where(rr => rr.ReportId == id)
        .Include(rr => rr.Role)
        .ToListAsync();

    return Ok(new
    {
        reportId = id,
        reportName = report.ReportName,
        references = new
        {
            views = viewReports.Select(vr => new
            {
                viewId = vr.ViewId,
                viewName = vr.View.Name,
                userId = vr.View.UserId
            }),
            roles = roleReports.Select(rr => new
            {
                roleId = rr.RoleId,
                roleName = rr.Role.RoleName
            })
        },
        canDelete = true,
        estimatedCleanup = new
        {
            viewReportsToDelete = viewReports.Count,
            roleReportsToDelete = roleReports.Count
        }
    });
}
```

**Usage:**
```bash
GET /api/Reports/report-123/references

# Response:
{
  "reportId": "report-123",
  "reportName": "Sales Report",
  "references": {
    "views": [
      { "viewId": "view-456", "viewName": "Q1 Dashboard", "userId": "user1" },
      { "viewId": "view-789", "viewName": "Executive View", "userId": "user2" }
    ],
    "roles": [
      { "roleId": "admin", "roleName": "Admin" },
      { "roleId": "user", "roleName": "User" }
    ]
  },
  "canDelete": true,
  "estimatedCleanup": {
    "viewReportsToDelete": 2,
    "roleReportsToDelete": 2
  }
}
```

---

## 📝 Summary

**Manual Cleanup Approach:**

1. ✅ Fetch all ViewReport entries for the report
2. ✅ Delete all ViewReport entries
3. ✅ Fetch all RoleReport entries for the report
4. ✅ Delete all RoleReport entries
5. ✅ Delete the report itself
6. ✅ All happens in one transaction

**Pros:**
- No database schema changes needed
- Works immediately
- Full control over deletion process
- Can add logging and validation

**Cons:**
- More code to maintain
- Slightly slower than CASCADE
- Need to update both ReportsController and WidgetsController

---

**Choose the approach that best fits your requirements!**

- **Quick fix needed?** → Use Manual Cleanup (no migration)
- **Long-term solution?** → Use CASCADE Delete (recommended)
- **Both?** → Start with Manual Cleanup, migrate to CASCADE later
