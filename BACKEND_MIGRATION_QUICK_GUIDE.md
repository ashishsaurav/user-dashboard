# Backend Migration - Quick Guide

**Time Required:** 10 minutes  
**Risk Level:** Low (adding columns only)

---

## 🚀 Quick Steps

### Step 1: Update NavigationSetting.cs (2 min)

**File:** `DashboardPortal/Models/NavigationSetting.cs`

Add these two lines:
```csharp
public string ExpandedViewGroups { get; set; }  // Add after HiddenViews
public bool? IsNavigationCollapsed { get; set; } // Add after ExpandedViewGroups
```

**Full property list should be:**
```csharp
public class NavigationSetting
{
    public int Id { get; set; }
    public string UserId { get; set; }
    public string ViewGroupOrder { get; set; }
    public string ViewOrders { get; set; }
    public string HiddenViewGroups { get; set; }
    public string HiddenViews { get; set; }
    public string ExpandedViewGroups { get; set; }     // ← NEW
    public bool? IsNavigationCollapsed { get; set; }    // ← NEW
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public User User { get; set; }
}
```

---

### Step 2: Update DTOs (2 min)

**File:** `DashboardPortal/DTOs/NavigationSettingDto.cs`

Add to both DTOs:

```csharp
// In NavigationSettingDto class:
public List<string> ExpandedViewGroups { get; set; }
public bool? IsNavigationCollapsed { get; set; }

// In UpdateNavigationSettingDto class:
public List<string> ExpandedViewGroups { get; set; }
public bool? IsNavigationCollapsed { get; set; }
```

---

### Step 3: Update NavigationController (3 min)

**File:** `DashboardPortal/Controllers/NavigationController.cs`

#### In UpdateNavigationSetting method, add these two lines:
```csharp
setting.ExpandedViewGroups = JsonSerializer.Serialize(dto.ExpandedViewGroups ?? new List<string>());
setting.IsNavigationCollapsed = dto.IsNavigationCollapsed ?? false;
```

**Insert after:**
```csharp
setting.HiddenViews = JsonSerializer.Serialize(dto.HiddenViews ?? new List<string>());
// ← ADD NEW LINES HERE
setting.UpdatedAt = DateTime.UtcNow;
```

#### In MapToDto method, add these two lines:
```csharp
ExpandedViewGroups = JsonSerializer.Deserialize<List<string>>(setting.ExpandedViewGroups ?? "[]"),
IsNavigationCollapsed = setting.IsNavigationCollapsed ?? false
```

**Insert after:**
```csharp
HiddenViews = JsonSerializer.Deserialize<List<string>>(setting.HiddenViews ?? "[]"),
// ← ADD NEW LINES HERE
```

---

### Step 4: Create Migration (1 min)

```bash
cd DashboardPortal
dotnet ef migrations add AddExpandCollapseToNavigationSettings
```

---

### Step 5: Apply Migration (1 min)

```bash
dotnet ef database update
```

---

### Step 6: Restart Backend (1 min)

```bash
# Stop backend (Ctrl+C)
dotnet run
```

---

## ✅ Verification (2 min)

### Test the API:

```bash
# Get navigation settings
GET https://localhost:7273/api/Navigation/your-user-id

# Should return:
{
  "expandedViewGroups": [],  // ← Should be present
  "isNavigationCollapsed": false  // ← Should be present
}
```

### Test from Frontend:

1. Login to dashboard
2. Click "Collapse All"
3. Check browser Network tab
4. Look for PUT request to `/api/Navigation/{userId}`
5. Verify request body includes:
   ```json
   {
     "expandedViewGroups": [],
     "isNavigationCollapsed": false
   }
   ```

---

## 🔍 Quick Debug

### If migration fails:

```bash
# Check migrations list
dotnet ef migrations list

# Remove last migration if needed
dotnet ef migrations remove

# Try again
dotnet ef migrations add AddExpandCollapseToNavigationSettings
```

### If API doesn't return new fields:

**Check:**
1. Did you update the model? ✓
2. Did you update MapToDto? ✓
3. Did you restart backend? ✓

---

## 📊 Database Schema After Migration

```sql
-- NavigationSettings table
CREATE TABLE [NavigationSettings] (
    [Id] int NOT NULL IDENTITY,
    [UserId] nvarchar(50) NOT NULL,
    [ViewGroupOrder] nvarchar(max) NULL,
    [ViewOrders] nvarchar(max) NULL,
    [HiddenViewGroups] nvarchar(max) NULL,
    [HiddenViews] nvarchar(max) NULL,
    [ExpandedViewGroups] nvarchar(max) NULL,      -- ← NEW
    [IsNavigationCollapsed] bit NULL,              -- ← NEW
    [CreatedAt] datetime2 NOT NULL,
    [UpdatedAt] datetime2 NOT NULL,
    CONSTRAINT [PK_NavigationSettings] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_NavigationSettings_Users_UserId] FOREIGN KEY ([UserId]) 
        REFERENCES [Users] ([UserId]) ON DELETE CASCADE
);

CREATE UNIQUE INDEX [IX_NavigationSettings_UserId] ON [NavigationSettings] ([UserId]);
```

---

## 🎯 Expected Behavior After Migration

### Scenario: Collapse All

1. User clicks "Collapse All"
2. Frontend saves:
   ```json
   {
     "expandedViewGroups": [],
     "isNavigationCollapsed": false
   }
   ```
3. Backend stores in database
4. User refreshes page
5. Backend returns saved state
6. Frontend loads: all groups collapsed ✅

### Scenario: Collapse Navigation

1. User clicks hamburger menu
2. Frontend saves:
   ```json
   {
     "isNavigationCollapsed": true
   }
   ```
3. User refreshes page
4. Panel loads collapsed ✅

---

## ⏱️ Total Time: ~10 minutes

- Update model: 2 min
- Update DTOs: 2 min
- Update controller: 3 min
- Create migration: 1 min
- Apply migration: 1 min
- Test: 2 min

---

## ✅ Done!

After completing these steps:
- ✅ State persists across refreshes
- ✅ State persists across logout/login
- ✅ Per-user settings work
- ✅ No more re-expansion bugs

**Test immediately after migration to verify!**
