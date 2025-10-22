# Quick Fix Guide - Foreign Key Constraint Error

**Error:** `The DELETE statement conflicted with the REFERENCE constraint "FK__ViewRepor__Repor__4AB81AF0"`

---

## 🎯 Choose Your Solution

### Option 1: CASCADE Delete (Recommended) ⭐
**Best for:** Production systems, long-term solution  
**Time:** 10 minutes  
**Requires:** Database migration  
**File:** See `BACKEND_CASCADE_DELETE_FIX.md`

### Option 2: Manual Cleanup (Quick Fix) 🚀
**Best for:** Immediate fix, no migration allowed  
**Time:** 5 minutes  
**Requires:** Code changes only  
**File:** See `BACKEND_MANUAL_CLEANUP_ALTERNATIVE.md`

---

## 🚀 QUICK FIX (No Migration Needed)

If you need an **immediate fix** without database changes:

### Step 1: Update ReportsController.cs

Open: `DashboardPortal/Controllers/ReportsController.cs`

Find the `DeleteReport` method and replace it with:

```csharp
// DELETE: api/Reports/{id}
[HttpDelete("{id}")]
public async Task<IActionResult> DeleteReport(string id)
{
    var report = await _context.Reports.FindAsync(id);
    if (report == null)
        return NotFound(new { message = "Report not found" });

    // Clean up references before deletion
    var viewReports = await _context.ViewReports.Where(vr => vr.ReportId == id).ToListAsync();
    _context.ViewReports.RemoveRange(viewReports);

    var roleReports = await _context.RoleReports.Where(rr => rr.ReportId == id).ToListAsync();
    _context.RoleReports.RemoveRange(roleReports);

    _context.Reports.Remove(report);
    await _context.SaveChangesAsync();

    return NoContent();
}
```

### Step 2: Update WidgetsController.cs

Open: `DashboardPortal/Controllers/WidgetsController.cs`

Find the `DeleteWidget` method and replace it with:

```csharp
// DELETE: api/Widgets/{id}
[HttpDelete("{id}")]
public async Task<IActionResult> DeleteWidget(string id)
{
    var widget = await _context.Widgets.FindAsync(id);
    if (widget == null)
        return NotFound(new { message = "Widget not found" });

    // Clean up references before deletion
    var viewWidgets = await _context.ViewWidgets.Where(vw => vw.WidgetId == id).ToListAsync();
    _context.ViewWidgets.RemoveRange(viewWidgets);

    var roleWidgets = await _context.RoleWidgets.Where(rw => rw.WidgetId == id).ToListAsync();
    _context.RoleWidgets.RemoveRange(roleWidgets);

    _context.Widgets.Remove(widget);
    await _context.SaveChangesAsync();

    return NoContent();
}
```

### Step 3: Restart Backend

```bash
# Stop the backend (Ctrl+C if running in terminal)
# Restart
dotnet run
```

### Step 4: Test

Try deleting a report again from the frontend. It should now work! ✅

---

## ⭐ RECOMMENDED FIX (With Migration)

For a **production-ready solution**:

### Step 1: Update ApplicationDbContext.cs

Open: `DashboardPortal/Data/ApplicationDbContext.cs`

Find the `OnModelCreating` method and update these configurations:

```csharp
// Find this section and update:
modelBuilder.Entity<ViewReport>(entity =>
{
    // ... existing code ...
    
    entity.HasOne(e => e.Report)
        .WithMany(r => r.ViewReports)
        .HasForeignKey(e => e.ReportId)
        .OnDelete(DeleteBehavior.Cascade);  // ✅ Change to Cascade
});

modelBuilder.Entity<ViewWidget>(entity =>
{
    // ... existing code ...
    
    entity.HasOne(e => e.Widget)
        .WithMany(w => w.ViewWidgets)
        .HasForeignKey(e => e.WidgetId)
        .OnDelete(DeleteBehavior.Cascade);  // ✅ Change to Cascade
});
```

### Step 2: Create Migration

```bash
cd DashboardPortal
dotnet ef migrations add EnableCascadeDeleteForViews
```

### Step 3: Backup Database

**IMPORTANT:** Backup before applying migration!

```sql
-- In SQL Server Management Studio
BACKUP DATABASE [DashboardPortal] 
TO DISK = 'C:\Backups\DashboardPortal_Backup.bak';
```

### Step 4: Apply Migration

```bash
dotnet ef database update
```

### Step 5: Test

Delete operations should now work automatically! ✅

---

## 📊 Quick Comparison

| Feature | Quick Fix | Recommended Fix |
|---------|-----------|-----------------|
| Time to implement | 5 min | 10 min |
| Database migration | ❌ No | ✅ Yes |
| Code changes | Controllers only | DbContext + Migration |
| Production ready | ⚠️ Works but manual | ✅ Standard practice |
| Performance | 🐌 Slower (3 queries) | ⚡ Faster (1 query, DB handles) |
| Maintenance | ⚠️ More code | ✅ Less code |

---

## 🧪 Test Your Fix

### Test Case: Delete a Report in a View

1. **Create a test report:**
   ```bash
   POST /api/Reports
   {
     "reportName": "Delete Test",
     "reportUrl": "https://test.com"
   }
   ```

2. **Add to a view:**
   - Go to frontend
   - Add report to any view

3. **Try to delete:**
   - Go to Manage Modal > All Reports & Widgets
   - Click delete on "Delete Test"
   - Confirm

4. **Expected result:**
   - ✅ Report deleted successfully
   - ✅ No error message
   - ✅ Report removed from view automatically

---

## ❓ FAQ

### Q: Which solution should I use?

**A:** 
- **Need it working NOW?** → Use Quick Fix
- **Building for production?** → Use Recommended Fix
- **Unsure?** → Use Quick Fix first, then migrate to Recommended Fix later

### Q: Can I use both?

**A:** No need! Choose one:
- Quick Fix = Manual cleanup in controllers
- Recommended Fix = Database handles cleanup automatically

### Q: Is CASCADE delete safe?

**A:** YES! For junction tables like ViewReports and ViewWidgets:
- ✅ Only the junction record is deleted (the link)
- ✅ The View itself is NOT deleted
- ✅ The Report itself is deleted (as intended)
- ✅ Standard database practice

### Q: What if I already have data in ViewReports?

**A:** Both solutions handle existing data:
- Quick Fix: Manually removes existing references
- Recommended Fix: Migration updates foreign keys, existing data is safe

---

## 🆘 If Something Goes Wrong

### Quick Fix Issues

**Error: "DbContext not found"**
```csharp
// Add this at top of controller:
private readonly ApplicationDbContext _context;

public ReportsController(ApplicationDbContext context)
{
    _context = context;
}
```

### Recommended Fix Issues

**Migration fails:**
```bash
# Revert migration
dotnet ef database update <PreviousMigrationName>

# Or restore backup
RESTORE DATABASE [DashboardPortal] FROM DISK = 'C:\Backups\...';
```

---

## ✅ Checklist

### Before Implementation
- [ ] Choose Quick Fix or Recommended Fix
- [ ] Backup database (Recommended Fix only)
- [ ] Read full documentation
- [ ] Have test data ready

### After Implementation
- [ ] Restart backend
- [ ] Test delete operation
- [ ] Verify no errors in console
- [ ] Test from frontend
- [ ] Check database (optional)

---

## 📞 Need More Help?

See detailed documentation:
- **CASCADE Delete:** `BACKEND_CASCADE_DELETE_FIX.md`
- **Manual Cleanup:** `BACKEND_MANUAL_CLEANUP_ALTERNATIVE.md`

---

**Bottom Line:**

```
🚀 Quick Fix = 5 minutes, works immediately, no migration
⭐ Recommended Fix = 10 minutes, best practice, requires migration

Both fix the error. Choose based on your situation!
```
