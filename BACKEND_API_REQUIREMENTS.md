# 🔧 Backend API Requirements - Complete Specification

**Date:** 2025-10-17  
**For Repository:** https://github.com/ashishsaurav/DashboardPortal/

---

## 📋 Required Changes Overview

### 1. Database Schema Changes
- ❌ Remove `ReportDescription` from Reports table
- ❌ Remove `WidgetDescription` from Widgets table
- ❌ Remove `Description` from UserRoles table
- ✅ Add `WidgetUrl` to Widgets table

### 2. API Endpoints to Implement
- Role assignment/unassignment for reports and widgets
- Enhanced reordering capabilities
- Updated create/update endpoints (no descriptions)

---

## 🗄️ Database Migration

### SQL Migration Script

```sql
USE DashboardPortal;
GO

PRINT '=== Applying Schema Changes ===';

-- Remove ReportDescription
IF EXISTS (SELECT * FROM sys.columns 
           WHERE object_id = OBJECT_ID('Reports') AND name = 'ReportDescription')
BEGIN
    ALTER TABLE Reports DROP COLUMN ReportDescription;
    PRINT '✓ Removed ReportDescription from Reports';
END

-- Remove WidgetDescription  
IF EXISTS (SELECT * FROM sys.columns 
           WHERE object_id = OBJECT_ID('Widgets') AND name = 'WidgetDescription')
BEGIN
    ALTER TABLE Widgets DROP COLUMN WidgetDescription;
    PRINT '✓ Removed WidgetDescription from Widgets';
END

-- Remove Description from UserRoles
IF EXISTS (SELECT * FROM sys.columns 
           WHERE object_id = OBJECT_ID('UserRoles') AND name = 'Description')
BEGIN
    ALTER TABLE UserRoles DROP COLUMN Description;
    PRINT '✓ Removed Description from UserRoles';
END

-- Add WidgetUrl
IF NOT EXISTS (SELECT * FROM sys.columns 
               WHERE object_id = OBJECT_ID('Widgets') AND name = 'WidgetUrl')
BEGIN
    ALTER TABLE Widgets ADD WidgetUrl NVARCHAR(500);
    PRINT '✓ Added WidgetUrl to Widgets';
    
    -- Set default URLs for existing widgets
    UPDATE Widgets SET WidgetUrl = '/widgets/' + WidgetId WHERE WidgetUrl IS NULL;
    PRINT '✓ Updated existing widgets with default URLs';
END

PRINT '=== Schema Changes Complete ===';
GO
```

---

## 📡 API Endpoint Specifications

### ReportsController.cs

#### 1. Create Report (Updated - No Description)

```csharp
[HttpPost]
[Authorize(Roles = "admin")]
public async Task<IActionResult> CreateReport([FromBody] CreateReportRequest request)
{
    if (!ModelState.IsValid)
        return BadRequest(ModelState);

    var reportId = $"report-{Guid.NewGuid().ToString("N").Substring(0, 8)}";

    var report = new Report
    {
        ReportId = reportId,
        ReportName = request.ReportName,
        ReportUrl = request.ReportUrl,
        IsActive = true,
        CreatedAt = DateTime.UtcNow,
        UpdatedAt = DateTime.UtcNow
    };

    await _context.Reports.AddAsync(report);
    await _context.SaveChangesAsync();

    var dto = new ReportDto
    {
        ReportId = report.ReportId,
        ReportName = report.ReportName,
        ReportUrl = report.ReportUrl,
        IsActive = report.IsActive,
        OrderIndex = 0
    };

    return CreatedAtAction(nameof(GetReport), new { id = reportId }, dto);
}

public class CreateReportRequest
{
    [Required]
    [StringLength(200, MinimumLength = 1)]
    public string ReportName { get; set; }

    [StringLength(500)]
    public string ReportUrl { get; set; }
}
```

#### 2. Update Report (Updated - No Description)

```csharp
[HttpPut("{id}")]
[Authorize(Roles = "admin")]
public async Task<IActionResult> UpdateReport(
    string id,
    [FromBody] UpdateReportRequest request)
{
    var report = await _context.Reports.FindAsync(id);
    if (report == null)
        return NotFound(new { message = "Report not found" });

    report.ReportName = request.ReportName;
    report.ReportUrl = request.ReportUrl;
    report.UpdatedAt = DateTime.UtcNow;

    await _context.SaveChangesAsync();

    var dto = new ReportDto
    {
        ReportId = report.ReportId,
        ReportName = report.ReportName,
        ReportUrl = report.ReportUrl,
        IsActive = report.IsActive,
        OrderIndex = 0
    };

    return Ok(dto);
}

public class UpdateReportRequest
{
    [Required]
    [StringLength(200, MinimumLength = 1)]
    public string ReportName { get; set; }

    [StringLength(500)]
    public string ReportUrl { get; set; }
}
```

#### 3. Assign Report to Role (NEW)

```csharp
[HttpPost("role/{roleId}/assign")]
[Authorize(Roles = "admin")]
public async Task<IActionResult> AssignReportToRole(
    string roleId,
    [FromBody] AssignReportRequest request)
{
    // Validate role
    var role = await _context.UserRoles.FindAsync(roleId);
    if (role == null)
        return NotFound(new { message = "Role not found" });

    // Validate report
    var report = await _context.Reports.FindAsync(request.ReportId);
    if (report == null)
        return NotFound(new { message = "Report not found" });

    // Check if already assigned
    var existing = await _context.RoleReports
        .FirstOrDefaultAsync(rr => 
            rr.RoleId == roleId && 
            rr.ReportId == request.ReportId);

    if (existing != null)
        return Conflict(new { message = "Report already assigned to this role" });

    // Create assignment
    var roleReport = new RoleReport
    {
        RoleId = roleId,
        ReportId = request.ReportId,
        OrderIndex = request.OrderIndex,
        CreatedAt = DateTime.UtcNow
    };

    await _context.RoleReports.AddAsync(roleReport);
    await _context.SaveChangesAsync();

    return Ok(new { message = "Report assigned successfully" });
}

public class AssignReportRequest
{
    [Required]
    public string ReportId { get; set; }

    public int OrderIndex { get; set; } = 0;
}
```

#### 4. Unassign Report from Role (NEW)

```csharp
[HttpDelete("role/{roleId}/unassign/{reportId}")]
[Authorize(Roles = "admin")]
public async Task<IActionResult> UnassignReportFromRole(
    string roleId,
    string reportId)
{
    var roleReport = await _context.RoleReports
        .FirstOrDefaultAsync(rr => 
            rr.RoleId == roleId && 
            rr.ReportId == reportId);

    if (roleReport == null)
        return NotFound(new { message = "Assignment not found" });

    _context.RoleReports.Remove(roleReport);
    await _context.SaveChangesAsync();

    return NoContent();
}
```

---

### WidgetsController.cs

#### 1. Create Widget (Updated - Add URL, No Description)

```csharp
[HttpPost]
[Authorize(Roles = "admin")]
public async Task<IActionResult> CreateWidget([FromBody] CreateWidgetRequest request)
{
    if (!ModelState.IsValid)
        return BadRequest(ModelState);

    var widgetId = $"widget-{Guid.NewGuid().ToString("N").Substring(0, 8)}";

    var widget = new Widget
    {
        WidgetId = widgetId,
        WidgetName = request.WidgetName,
        WidgetUrl = request.WidgetUrl,  // ✅ NEW
        WidgetType = request.WidgetType,
        IsActive = true,
        CreatedAt = DateTime.UtcNow,
        UpdatedAt = DateTime.UtcNow
    };

    await _context.Widgets.AddAsync(widget);
    await _context.SaveChangesAsync();

    var dto = new WidgetDto
    {
        WidgetId = widget.WidgetId,
        WidgetName = widget.WidgetName,
        WidgetUrl = widget.WidgetUrl,  // ✅ NEW
        WidgetType = widget.WidgetType,
        IsActive = widget.IsActive,
        OrderIndex = 0
    };

    return CreatedAtAction(nameof(GetWidget), new { id = widgetId }, dto);
}

public class CreateWidgetRequest
{
    [Required]
    [StringLength(200, MinimumLength = 1)]
    public string WidgetName { get; set; }

    [StringLength(500)]
    public string WidgetUrl { get; set; }  // ✅ NEW

    [StringLength(50)]
    public string WidgetType { get; set; }
}
```

#### 2. Update Widget (Updated - Add URL, No Description)

```csharp
[HttpPut("{id}")]
[Authorize(Roles = "admin")]
public async Task<IActionResult> UpdateWidget(
    string id,
    [FromBody] UpdateWidgetRequest request)
{
    var widget = await _context.Widgets.FindAsync(id);
    if (widget == null)
        return NotFound(new { message = "Widget not found" });

    widget.WidgetName = request.WidgetName;
    widget.WidgetUrl = request.WidgetUrl;  // ✅ NEW
    widget.WidgetType = request.WidgetType;
    widget.UpdatedAt = DateTime.UtcNow;

    await _context.SaveChangesAsync();

    var dto = new WidgetDto
    {
        WidgetId = widget.WidgetId,
        WidgetName = widget.WidgetName,
        WidgetUrl = widget.WidgetUrl,  // ✅ NEW
        WidgetType = widget.WidgetType,
        IsActive = widget.IsActive,
        OrderIndex = 0
    };

    return Ok(dto);
}

public class UpdateWidgetRequest
{
    [Required]
    [StringLength(200, MinimumLength = 1)]
    public string WidgetName { get; set; }

    [StringLength(500)]
    public string WidgetUrl { get; set; }  // ✅ NEW

    [StringLength(50)]
    public string WidgetType { get; set; }
}
```

#### 3. Assign Widget to Role (NEW)

```csharp
[HttpPost("role/{roleId}/assign")]
[Authorize(Roles = "admin")]
public async Task<IActionResult> AssignWidgetToRole(
    string roleId,
    [FromBody] AssignWidgetRequest request)
{
    // Validate role
    var role = await _context.UserRoles.FindAsync(roleId);
    if (role == null)
        return NotFound(new { message = "Role not found" });

    // Validate widget
    var widget = await _context.Widgets.FindAsync(request.WidgetId);
    if (widget == null)
        return NotFound(new { message = "Widget not found" });

    // Check if already assigned
    var existing = await _context.RoleWidgets
        .FirstOrDefaultAsync(rw => 
            rw.RoleId == roleId && 
            rw.WidgetId == request.WidgetId);

    if (existing != null)
        return Conflict(new { message = "Widget already assigned to this role" });

    // Create assignment
    var roleWidget = new RoleWidget
    {
        RoleId = roleId,
        WidgetId = request.WidgetId,
        OrderIndex = request.OrderIndex,
        CreatedAt = DateTime.UtcNow
    };

    await _context.RoleWidgets.AddAsync(roleWidget);
    await _context.SaveChangesAsync();

    return Ok(new { message = "Widget assigned successfully" });
}

public class AssignWidgetRequest
{
    [Required]
    public string WidgetId { get; set; }

    public int OrderIndex { get; set; } = 0;
}
```

#### 4. Unassign Widget from Role (NEW)

```csharp
[HttpDelete("role/{roleId}/unassign/{widgetId}")]
[Authorize(Roles = "admin")]
public async Task<IActionResult> UnassignWidgetFromRole(
    string roleId,
    string widgetId)
{
    var roleWidget = await _context.RoleWidgets
        .FirstOrDefaultAsync(rw => 
            rw.RoleId == roleId && 
            rw.WidgetId == widgetId);

    if (roleWidget == null)
        return NotFound(new { message = "Assignment not found" });

    _context.RoleWidgets.Remove(roleWidget);
    await _context.SaveChangesAsync();

    return NoContent();
}
```

---

### ViewGroupsController.cs

#### Reorder View Groups (Already Implemented, but verify)

```csharp
[HttpPost("reorder")]
[Authorize]
public async Task<IActionResult> ReorderViewGroups([FromBody] ReorderRequest request)
{
    // Get current user
    var currentUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
    
    // Verify user owns these view groups
    var viewGroups = await _context.ViewGroups
        .Where(vg => vg.UserId == request.UserId)
        .ToListAsync();

    // Security: Ensure current user can only reorder their own view groups
    if (currentUserId != request.UserId && !User.IsInRole("admin"))
        return Forbid();

    // Update order indices
    foreach (var item in request.Items)
    {
        var viewGroup = viewGroups.FirstOrDefault(vg => vg.ViewGroupId == item.Id);
        if (viewGroup != null)
        {
            viewGroup.OrderIndex = item.OrderIndex;
            viewGroup.UpdatedAt = DateTime.UtcNow;
        }
    }

    await _context.SaveChangesAsync();

    return Ok(new { message = "View groups reordered successfully" });
}
```

#### Reorder Views in Group (Already Implemented, but verify)

```csharp
[HttpPost("{viewGroupId}/views/reorder")]
[Authorize]
public async Task<IActionResult> ReorderViewsInGroup(
    string viewGroupId,
    [FromBody] ReorderRequest request)
{
    // Get current user
    var currentUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

    // Verify user owns this view group
    var viewGroup = await _context.ViewGroups
        .FirstOrDefaultAsync(vg => 
            vg.ViewGroupId == viewGroupId && 
            vg.UserId == request.UserId);

    if (viewGroup == null)
        return NotFound(new { message = "View group not found" });

    // Security check
    if (currentUserId != request.UserId && !User.IsInRole("admin"))
        return Forbid();

    // Update order in ViewGroupViews mapping table
    var mappings = await _context.ViewGroupViews
        .Where(vgv => vgv.ViewGroupId == viewGroupId)
        .ToListAsync();

    foreach (var item in request.Items)
    {
        var mapping = mappings.FirstOrDefault(m => m.ViewId == item.Id);
        if (mapping != null)
        {
            mapping.OrderIndex = item.OrderIndex;
        }
    }

    await _context.SaveChangesAsync();

    return Ok(new { message = "Views reordered successfully" });
}

public class ReorderRequest
{
    [Required]
    public string UserId { get; set; }

    [Required]
    public List<ReorderItem> Items { get; set; }
}

public class ReorderItem
{
    [Required]
    public string Id { get; set; }

    [Required]
    public int OrderIndex { get; set; }
}
```

---

## 📝 Updated DTOs

### ReportDto.cs

```csharp
public class ReportDto
{
    public string ReportId { get; set; }
    public string ReportName { get; set; }
    // ❌ REMOVED: public string ReportDescription { get; set; }
    public string ReportUrl { get; set; }
    public bool IsActive { get; set; }
    public int OrderIndex { get; set; }
}
```

### WidgetDto.cs

```csharp
public class WidgetDto
{
    public string WidgetId { get; set; }
    public string WidgetName { get; set; }
    // ❌ REMOVED: public string WidgetDescription { get; set; }
    public string WidgetUrl { get; set; }  // ✅ ADDED
    public string WidgetType { get; set; }
    public bool IsActive { get; set; }
    public int OrderIndex { get; set; }
}
```

### UserRoleDto.cs

```csharp
public class UserRoleDto
{
    public string RoleId { get; set; }
    public string RoleName { get; set; }
    // ❌ REMOVED: public string Description { get; set; }
}
```

---

## 🧪 Testing with Swagger/Postman

### Test Scenarios

#### 1. Create Report

```http
POST /api/reports
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "reportName": "New Test Report",
  "reportUrl": "/reports/test"
}
```

**Expected Response:**
```json
{
  "reportId": "report-abc12345",
  "reportName": "New Test Report",
  "reportUrl": "/reports/test",
  "isActive": true,
  "orderIndex": 0
}
```

#### 2. Create Widget (with URL)

```http
POST /api/widgets
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "widgetName": "New Test Widget",
  "widgetUrl": "/widgets/test",
  "widgetType": "Chart"
}
```

**Expected Response:**
```json
{
  "widgetId": "widget-xyz67890",
  "widgetName": "New Test Widget",
  "widgetUrl": "/widgets/test",
  "widgetType": "Chart",
  "isActive": true,
  "orderIndex": 0
}
```

#### 3. Assign Report to Role

```http
POST /api/reports/role/user/assign
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "reportId": "report-abc12345",
  "orderIndex": 5
}
```

**Expected Response:**
```json
{
  "message": "Report assigned successfully"
}
```

#### 4. Unassign Report from Role

```http
DELETE /api/reports/role/user/unassign/report-abc12345
Authorization: Bearer {admin_token}
```

**Expected Response:**
```
204 No Content
```

#### 5. Reorder View Groups

```http
POST /api/viewgroups/reorder
Authorization: Bearer {user_token}
Content-Type: application/json

{
  "userId": "user1",
  "items": [
    { "id": "vg-user1-2", "orderIndex": 0 },
    { "id": "vg-user1-1", "orderIndex": 1 },
    { "id": "vg-user1-3", "orderIndex": 2 }
  ]
}
```

**Expected Response:**
```json
{
  "message": "View groups reordered successfully"
}
```

---

## ✅ Implementation Checklist

### Database
- [ ] Backup current database
- [ ] Run migration script
- [ ] Verify columns removed/added
- [ ] Update existing widget URLs
- [ ] Test database constraints

### Backend Code
- [ ] Update ReportDto (remove description)
- [ ] Update WidgetDto (remove description, add URL)
- [ ] Update UserRoleDto (remove description)
- [ ] Implement AssignReportToRole endpoint
- [ ] Implement UnassignReportFromRole endpoint
- [ ] Implement AssignWidgetToRole endpoint
- [ ] Implement UnassignWidgetFromRole endpoint
- [ ] Update CreateReport (remove description)
- [ ] Update UpdateReport (remove description)
- [ ] Update CreateWidget (add URL, remove description)
- [ ] Update UpdateWidget (add URL, remove description)
- [ ] Verify ReorderViewGroups endpoint exists
- [ ] Verify ReorderViewsInGroup endpoint exists
- [ ] Add authorization attributes ([Authorize(Roles = "admin")])
- [ ] Add request validation attributes
- [ ] Update Swagger documentation

### Testing
- [ ] Test create report (without description)
- [ ] Test update report (without description)
- [ ] Test create widget (with URL, without description)
- [ ] Test update widget (with URL, without description)
- [ ] Test assign report to role
- [ ] Test unassign report from role
- [ ] Test assign widget to role
- [ ] Test unassign widget from role
- [ ] Test reorder view groups
- [ ] Test reorder views in group
- [ ] Test role authorization (non-admin cannot assign)
- [ ] Test error cases (invalid IDs, duplicate assignments)

### Frontend Integration
- [ ] Update API base URL if needed
- [ ] Test with UserRolePermissionsApi component
- [ ] Test with AllReportsWidgetsApi component
- [ ] Test with AddReportWidgetApi component
- [ ] Verify notifications work
- [ ] Test error handling
- [ ] Test loading states

---

## 🔐 Security Considerations

### Authorization Rules

1. **Admin-Only Operations:**
   - Create/Edit/Delete reports
   - Create/Edit/Delete widgets
   - Assign/Unassign reports to roles
   - Assign/Unassign widgets to roles

2. **User-Specific Operations:**
   - Create/Edit/Delete own views
   - Create/Edit/Delete own view groups
   - Reorder own view groups
   - Reorder views in own view groups

3. **Read Operations:**
   - Users can only see reports/widgets assigned to their role
   - Users can only see their own views and view groups

### Implementation

```csharp
// Add to Startup.cs or Program.cs
services.AddAuthorization(options =>
{
    options.AddPolicy("AdminOnly", policy => 
        policy.RequireRole("admin"));
    
    options.AddPolicy("UserOrAdmin", policy => 
        policy.RequireRole("admin", "user"));
});

// Use in controllers
[Authorize(Policy = "AdminOnly")]
public async Task<IActionResult> CreateReport(...) { }

// Or
[Authorize(Roles = "admin")]
public async Task<IActionResult> AssignReportToRole(...) { }
```

---

## 📚 Additional Notes

### Widget URL Examples

After migration, update existing widgets with meaningful URLs:

```sql
UPDATE Widgets SET WidgetUrl = '/dashboards/sales-chart' WHERE WidgetId = 'widget-1';
UPDATE Widgets SET WidgetUrl = '/dashboards/revenue-gauge' WHERE WidgetId = 'widget-2';
UPDATE Widgets SET WidgetUrl = '/dashboards/customer-table' WHERE WidgetId = 'widget-3';
-- etc...
```

### Error Responses

Standardize error responses:

```csharp
// Not Found
return NotFound(new { 
    message = "Report not found",
    id = reportId
});

// Bad Request
return BadRequest(new {
    message = "Invalid data",
    errors = ModelState.Values.SelectMany(v => v.Errors)
});

// Conflict
return Conflict(new {
    message = "Report already assigned to this role",
    roleId = roleId,
    reportId = reportId
});

// Forbidden
return Forbid();
```

---

## 🎯 Summary

All backend API changes required for the new features:

✅ Database schema updated (migration script provided)  
✅ DTOs updated (removed descriptions, added widget URL)  
✅ Create/Update endpoints updated  
✅ Role assignment endpoints specified  
✅ Reorder endpoints verified  
✅ Authorization rules defined  
✅ Testing scenarios provided  
✅ Security considerations documented  

**Status:** Ready for implementation in backend repository  
**Repository:** https://github.com/ashishsaurav/DashboardPortal/

---

**Document Created:** 2025-10-17  
**Last Updated:** 2025-10-17  
**Version:** 1.0
