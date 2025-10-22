# Backend Cascade Delete Fix

**Error:** `The DELETE statement conflicted with the REFERENCE constraint "FK__ViewRepor__Repor__4AB81AF0"`

**Database:** DashboardPortal  
**Table:** ViewReports  
**Column:** ReportId

---

## 🔴 Problem Analysis

The error occurs because:

1. **Foreign Key Constraint:** `ViewReports.ReportId` references `Reports.ReportId`
2. **Current Delete Behavior:** `NO ACTION` or `RESTRICT`
3. **Issue:** When you try to delete a Report, SQL Server checks if any ViewReports records reference it
4. **Result:** Delete fails with foreign key constraint error

**Current Backend Configuration (Incorrect):**
```csharp
// In ApplicationDbContext.cs
modelBuilder.Entity<ViewReport>(entity =>
{
    entity.HasOne(e => e.Report)
        .WithMany(r => r.ViewReports)
        .HasForeignKey(e => e.ReportId)
        .OnDelete(DeleteBehavior.NoAction);  // ❌ This prevents deletion
});
```

---

## ✅ Solution: Enable Cascade Delete

### Step 1: Update ApplicationDbContext.cs

**File:** `DashboardPortal/Data/ApplicationDbContext.cs`

Find the `OnModelCreating` method and update the ViewReport and ViewWidget configurations:

```csharp
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    base.OnModelCreating(modelBuilder);

    // ... existing configurations ...

    // ✅ UPDATE: ViewReport Configuration
    modelBuilder.Entity<ViewReport>(entity =>
    {
        entity.HasKey(e => e.Id);
        entity.HasIndex(e => new { e.ViewId, e.ReportId }).IsUnique();

        entity.HasOne(e => e.View)
            .WithMany(v => v.ViewReports)
            .HasForeignKey(e => e.ViewId)
            .OnDelete(DeleteBehavior.Cascade);  // Cascade when View is deleted

        entity.HasOne(e => e.Report)
            .WithMany(r => r.ViewReports)
            .HasForeignKey(e => e.ReportId)
            .OnDelete(DeleteBehavior.Cascade);  // ✅ CHANGE: Cascade when Report is deleted
    });

    // ✅ UPDATE: ViewWidget Configuration
    modelBuilder.Entity<ViewWidget>(entity =>
    {
        entity.HasKey(e => e.Id);
        entity.HasIndex(e => new { e.ViewId, e.WidgetId }).IsUnique();

        entity.HasOne(e => e.View)
            .WithMany(v => v.ViewWidgets)
            .HasForeignKey(e => e.ViewId)
            .OnDelete(DeleteBehavior.Cascade);  // Cascade when View is deleted

        entity.HasOne(e => e.Widget)
            .WithMany(w => w.ViewWidgets)
            .HasForeignKey(e => e.WidgetId)
            .OnDelete(DeleteBehavior.Cascade);  // ✅ CHANGE: Cascade when Widget is deleted
    });

    // ... rest of configurations ...
}
```

### Step 2: Create Migration

Open terminal in your backend project folder:

```bash
cd DashboardPortal
dotnet ef migrations add EnableCascadeDeleteForViewReportsAndWidgets
```

This will create a migration file like:
`Migrations/20251022_EnableCascadeDeleteForViewReportsAndWidgets.cs`

### Step 3: Review the Migration

Open the generated migration file and verify it looks like this:

```csharp
public partial class EnableCascadeDeleteForViewReportsAndWidgets : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        // Drop existing foreign keys
        migrationBuilder.DropForeignKey(
            name: "FK__ViewRepor__Repor__4AB81AF0",
            table: "ViewReports");

        migrationBuilder.DropForeignKey(
            name: "FK__ViewWidge__Widge__XXXXX",
            table: "ViewWidgets");

        // Recreate with CASCADE delete
        migrationBuilder.AddForeignKey(
            name: "FK_ViewReports_Reports_ReportId",
            table: "ViewReports",
            column: "ReportId",
            principalTable: "Reports",
            principalColumn: "ReportId",
            onDelete: ReferentialAction.Cascade);  // ✅ Cascade enabled

        migrationBuilder.AddForeignKey(
            name: "FK_ViewWidgets_Widgets_WidgetId",
            table: "ViewWidgets",
            column: "WidgetId",
            principalTable: "Widgets",
            principalColumn: "WidgetId",
            onDelete: ReferentialAction.Cascade);  // ✅ Cascade enabled
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        // Reverse changes (restore NO ACTION)
        // ...
    }
}
```

### Step 4: Backup Database (IMPORTANT!)

Before applying the migration, backup your database:

```sql
-- In SQL Server Management Studio (SSMS)
BACKUP DATABASE [DashboardPortal] 
TO DISK = 'C:\Backups\DashboardPortal_BeforeCascade.bak'
WITH FORMAT, INIT, NAME = 'Before Cascade Delete Migration';
```

### Step 5: Apply Migration

```bash
dotnet ef database update
```

### Step 6: Verify Foreign Keys

Run this SQL query to verify the changes:

```sql
SELECT 
    fk.name AS ForeignKeyName,
    OBJECT_NAME(fk.parent_object_id) AS TableName,
    COL_NAME(fc.parent_object_id, fc.parent_column_id) AS ColumnName,
    OBJECT_NAME(fk.referenced_object_id) AS ReferencedTable,
    COL_NAME(fc.referenced_object_id, fc.referenced_column_id) AS ReferencedColumn,
    fk.delete_referential_action_desc AS DeleteAction
FROM sys.foreign_keys AS fk
INNER JOIN sys.foreign_key_columns AS fc ON fk.object_id = fc.constraint_object_id
WHERE OBJECT_NAME(fk.parent_object_id) IN ('ViewReports', 'ViewWidgets')
ORDER BY TableName, ColumnName;
```

**Expected Output:**
```
ForeignKeyName                           TableName     ColumnName  ReferencedTable  DeleteAction
FK_ViewReports_Reports_ReportId         ViewReports   ReportId    Reports          CASCADE
FK_ViewReports_Views_ViewId             ViewReports   ViewId      Views            CASCADE
FK_ViewWidgets_Widgets_WidgetId         ViewWidgets   WidgetId    Widgets          CASCADE
FK_ViewWidgets_Views_ViewId             ViewWidgets   ViewId      Views            CASCADE
```

---

## 🧪 Testing the Fix

### Test 1: Delete Report with View References

```bash
# 1. Create a test report via Swagger or Postman
POST /api/Reports
{
  "reportName": "Test Report for Deletion",
  "reportUrl": "https://example.com/test"
}

# 2. Get the reportId from response (e.g., "report-12345")

# 3. Assign to a role
POST /api/Reports/role/admin/assign
{
  "reportIds": ["report-12345"]
}

# 4. Add to a view (create view first if needed)
POST /api/Views
{
  "userId": "user123",
  "data": {
    "name": "Test View",
    "reportIds": ["report-12345"],
    "widgetIds": [],
    "isVisible": true,
    "orderIndex": 0
  }
}

# 5. Now delete the report (this should succeed with cascade)
DELETE /api/Reports/report-12345

# Expected: 204 No Content (success)
# The ViewReport entry should be automatically deleted
```

### Test 2: Verify Cascade Behavior

```sql
-- Before deletion
SELECT COUNT(*) FROM ViewReports WHERE ReportId = 'report-12345';
-- Result: 1

-- After deletion
SELECT COUNT(*) FROM ViewReports WHERE ReportId = 'report-12345';
-- Result: 0 (automatically cleaned up by cascade delete)
```

---

## 📋 What Happens with Cascade Delete

### Before (NO ACTION):
```
Reports Table:          ViewReports Table:
┌─────────────┐        ┌──────────────────┐
│ report-123  │◄───────│ report-123       │
└─────────────┘        │ view-456         │
                       └──────────────────┘

DELETE Reports WHERE ReportId = 'report-123'
❌ ERROR: Foreign key constraint violation
```

### After (CASCADE):
```
Reports Table:          ViewReports Table:
┌─────────────┐        ┌──────────────────┐
│ report-123  │◄───────│ report-123       │  ← Automatically deleted
└─────────────┘        │ view-456         │     when parent is deleted
     ↓ DELETE          └──────────────────┘
     ↓                          ↓
✅ SUCCESS            ✅ Cascade deletes
                         ViewReports entry
```

---

## 🔒 Safety Considerations

### Is Cascade Delete Safe?

✅ **YES** - In this case, cascade delete is appropriate because:

1. **ViewReport is a junction table** - It only exists to link Views and Reports
2. **No standalone data** - Deleting a ViewReport entry doesn't lose important data
3. **Expected behavior** - When a Report is deleted, it shouldn't appear in any Views
4. **Referential integrity** - Prevents orphaned references in the database

### What Gets Deleted?

When you delete a Report with cascade delete enabled:

1. ✅ The Report record is deleted
2. ✅ All RoleReport entries (role assignments) are deleted
3. ✅ All ViewReport entries (view associations) are deleted
4. ❌ The Views themselves are **NOT** deleted (they just lose this one report)

### Example Scenario:

```
Initial State:
- Report: "Sales Report" (ID: report-123)
- Assigned to: admin, user roles
- In Views: "Q1 Dashboard", "Executive Summary"

After Deletion:
- Report "Sales Report" ❌ DELETED
- RoleReports for report-123 ❌ DELETED (cascade)
- ViewReports for report-123 ❌ DELETED (cascade)
- Views "Q1 Dashboard" ✅ STILL EXISTS (just has one fewer report)
- Views "Executive Summary" ✅ STILL EXISTS (just has one fewer report)
```

---

## 🚀 Deployment Checklist

### Development Environment
- [x] Update `ApplicationDbContext.cs`
- [x] Create migration
- [x] Backup database
- [x] Apply migration
- [x] Test delete operations
- [x] Verify foreign key constraints
- [x] Test with frontend

### Staging Environment
- [ ] Update `ApplicationDbContext.cs`
- [ ] Create migration (same code)
- [ ] Backup database
- [ ] Apply migration
- [ ] Smoke test

### Production Environment
- [ ] Schedule maintenance window
- [ ] Backup database (CRITICAL!)
- [ ] Update `ApplicationDbContext.cs`
- [ ] Apply migration
- [ ] Monitor error logs
- [ ] Test delete operations

---

## 🆘 Rollback Plan

If something goes wrong:

### Option 1: EF Core Migration Rollback
```bash
# Revert to previous migration
dotnet ef database update <PreviousMigrationName>
```

### Option 2: SQL Script Rollback
```sql
-- Drop cascade foreign keys
ALTER TABLE ViewReports 
DROP CONSTRAINT FK_ViewReports_Reports_ReportId;

ALTER TABLE ViewWidgets
DROP CONSTRAINT FK_ViewWidgets_Widgets_WidgetId;

-- Recreate with NO ACTION
ALTER TABLE ViewReports
ADD CONSTRAINT FK_ViewReports_Reports_ReportId
FOREIGN KEY (ReportId) REFERENCES Reports(ReportId)
ON DELETE NO ACTION;

ALTER TABLE ViewWidgets
ADD CONSTRAINT FK_ViewWidgets_Widgets_WidgetId
FOREIGN KEY (WidgetId) REFERENCES Widgets(WidgetId)
ON DELETE NO ACTION;
```

### Option 3: Database Restore
```sql
RESTORE DATABASE [DashboardPortal]
FROM DISK = 'C:\Backups\DashboardPortal_BeforeCascade.bak'
WITH REPLACE;
```

---

## 📊 Alternative Approaches

If you **cannot** enable cascade delete (due to business requirements):

### Option A: Manual Cleanup in Backend Controller

Update `ReportsController.cs`:

```csharp
[HttpDelete("{id}")]
public async Task<IActionResult> DeleteReport(string id)
{
    var report = await _context.Reports.FindAsync(id);
    if (report == null)
        return NotFound();

    // Step 1: Remove from all views
    var viewReports = await _context.ViewReports
        .Where(vr => vr.ReportId == id)
        .ToListAsync();
    _context.ViewReports.RemoveRange(viewReports);

    // Step 2: Remove role assignments
    var roleReports = await _context.RoleReports
        .Where(rr => rr.ReportId == id)
        .ToListAsync();
    _context.RoleReports.RemoveRange(roleReports);

    // Step 3: Delete the report
    _context.Reports.Remove(report);

    await _context.SaveChangesAsync();
    return NoContent();
}
```

### Option B: Frontend Manual Cleanup (Already Implemented)

The frontend already handles cleanup in `AllReportsWidgets.tsx`, but backend needs to support fetching all views.

---

## ✅ Recommended Solution

**Use Cascade Delete** (Option 1)

**Reasons:**
1. ✅ Standard database practice for junction tables
2. ✅ Automatic, reliable cleanup
3. ✅ Better performance (single transaction)
4. ✅ Prevents orphaned data
5. ✅ Simpler code maintenance

**Implementation Time:** 5-10 minutes  
**Risk Level:** Low (junction tables are safe for cascade)  
**Testing Time:** 15 minutes

---

## 📝 Summary

**Current Error:**
```
The DELETE statement conflicted with the REFERENCE constraint "FK__ViewRepor__Repor__4AB81AF0"
```

**Root Cause:**
- Foreign key configured with `NO ACTION` delete behavior
- ViewReports table references Reports.ReportId
- SQL Server prevents deletion of referenced records

**Solution:**
- Change foreign key to `CASCADE` delete behavior
- Update `ApplicationDbContext.cs`
- Create and apply EF Core migration
- Test deletion operations

**Result:**
- ✅ Reports can be deleted even if referenced in views
- ✅ ViewReport entries automatically cleaned up
- ✅ No orphaned references
- ✅ Frontend delete operations succeed

---

**Created:** 2025-10-22  
**Version:** 1.0  
**Priority:** 🔴 High (blocking delete functionality)
