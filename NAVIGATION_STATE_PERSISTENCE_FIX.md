# Navigation State Persistence - Bug Fixes

**Date:** 2025-10-22  
**Issues:** State not persisting correctly, groups re-expanding

---

## 🐛 Issues Fixed

### Issue 1: Collapse All Not Working
**Problem:** When clicking "Collapse All", view groups would immediately expand again.

**Root Cause:** The `useEffect` that loads the initial state had viewGroups in dependency array, causing it to re-run and reset the state.

**Solution:**
```typescript
// BEFORE (BAD):
useEffect(() => {
  if (viewGroups.length > 0) {
    // This runs every time viewGroups changes!
    setExpandedViewGroups(initialExpanded);
  }
}, [viewGroups, userNavSettings.expandedViewGroups]);

// AFTER (GOOD):
const hasInitializedRef = useRef(false);

useEffect(() => {
  if (viewGroups.length > 0 && !hasInitializedRef.current) {
    // Only runs ONCE on initial load
    setExpandedViewGroups(initialExpanded);
    hasInitializedRef.current = true;
  }
}, [viewGroups, userNavSettings]);
```

---

### Issue 2: Saved State Ignored on Load
**Problem:** Even though backend had saved state, it was being overridden by default (all expanded).

**Root Cause:** The code was treating `undefined` and empty array the same way.

**Critical Fix:**
```typescript
// BEFORE (WRONG):
if (userNavSettings.expandedViewGroups && userNavSettings.expandedViewGroups.length > 0) {
  // Use saved state
} else {
  // Default to all expanded
}

// This is WRONG because empty array [] means "all collapsed" (user clicked collapse all)
// But the code treats it as "no saved state" and defaults to all expanded!

// AFTER (CORRECT):
if (userNavSettings.expandedViewGroups !== undefined && userNavSettings.expandedViewGroups !== null) {
  // Use saved state (even if empty array)
  viewGroups.forEach((vg) => {
    initialExpanded[vg.id] = userNavSettings.expandedViewGroups!.includes(vg.id);
  });
} else {
  // Only default to all expanded if NO saved state exists
  viewGroups.forEach((vg) => {
    initialExpanded[vg.id] = true;
  });
}
```

**Key Insight:**
- `expandedViewGroups = []` → All collapsed (valid state)
- `expandedViewGroups = undefined` → No saved state (use default)

---

### Issue 3: Navigation Panel Collapse State Not Loading
**Problem:** Even when `isNavigationCollapsed = true` in backend, panel would load as expanded.

**Root Cause:** State was initialized as `false` before API data loaded.

**Solution:**
```typescript
// BEFORE:
const [isDockCollapsed, setIsDockCollapsed] = useState(false);

// AFTER:
const [isDockCollapsed, setIsDockCollapsed] = useState(() => {
  // Initialize from API data if available
  return apiNavSettings?.isNavigationCollapsed ?? false;
});

// PLUS: Update when API data loads
useEffect(() => {
  if (apiNavSettings?.isNavigationCollapsed !== undefined) {
    setIsDockCollapsed(apiNavSettings.isNavigationCollapsed);
  }
}, [apiNavSettings]);
```

---

### Issue 4: Button Not Always Visible
**Problem:** Button only showed when `viewGroups.length > 0`.

**Solution:**
```typescript
// BEFORE:
{!isHorizontalLayout && viewGroups.length > 0 && (
  <div className="nav-toolbar">...</div>
)}

// AFTER:
{!isHorizontalLayout && (
  <div className="nav-toolbar">
    <button disabled={viewGroups.length === 0}>...</button>
  </div>
)}
```

Now the button always shows but is disabled when no groups exist.

---

## 🔍 State Loading Flow

### Correct Sequence:

```
1. App starts
   ↓
2. useApiData hook fetches data
   ↓
3. apiNavSettings loaded from backend
   {
     expandedViewGroups: ["vg-1", "vg-3"],  // Only these are expanded
     isNavigationCollapsed: true
   }
   ↓
4. DashboardDock receives apiNavSettings
   ↓
5. Sets isDockCollapsed = true (from backend)
   ↓
6. NavigationPanel receives userNavSettings
   ↓
7. Initializes expandedViewGroups (ONLY ONCE)
   {
     "vg-1": true,   // Expanded
     "vg-2": false,  // Collapsed
     "vg-3": true,   // Expanded
     "vg-4": false   // Collapsed
   }
   ↓
8. State is now correctly loaded from backend ✅
```

---

## 🧪 Testing Scenarios

### Scenario 1: Collapse All, Refresh Page

**Steps:**
1. Click "Collapse All"
2. Wait 1 second
3. Refresh page (F5)

**Expected:**
- ✅ All view groups remain collapsed
- ✅ Button shows "Expand All"
- ✅ Backend has `expandedViewGroups: []`

**Debug Output:**
```
💾 Saving view group expand/collapse state: []
  Total groups: 4
  Expanded count: 0
✅ Saved to backend successfully

[Page refresh]

🔄 Initializing view group expand state
  Saved expandedViewGroups: []
  ViewGroups count: 4
  ✅ Using saved state from backend
    View Group 1: COLLAPSED
    View Group 2: COLLAPSED
    View Group 3: COLLAPSED
    View Group 4: COLLAPSED
  ✅ Final expanded state: {...all false...}
```

---

### Scenario 2: Expand Some, Collapse Others, Refresh

**Steps:**
1. Expand Group 1
2. Collapse Group 2
3. Expand Group 3
4. Collapse Group 4
5. Refresh page

**Expected:**
- ✅ Group 1 is expanded
- ✅ Group 2 is collapsed
- ✅ Group 3 is expanded
- ✅ Group 4 is collapsed
- ✅ Backend has `expandedViewGroups: ["vg-1", "vg-3"]`

---

### Scenario 3: Collapse Navigation Panel, Refresh

**Steps:**
1. Click hamburger menu to collapse panel
2. Refresh page

**Expected:**
- ✅ Navigation panel loads in collapsed state
- ✅ Shows abbreviated view group names
- ✅ Backend has `isNavigationCollapsed: true`

**Debug Output:**
```
💾 Saved navigation collapse state: true

[Page refresh]

📊 API NavSettings updated: {...}
💾 Backend navigation collapse state: true
✅ Applying saved collapse state: true
```

---

## 📊 Files Modified

### Frontend Files:
1. ✅ `src/types/index.ts`
   - Added `expandedViewGroups?: string[]`
   - Added `isNavigationCollapsed?: boolean`

2. ✅ `src/services/navigationService.ts`
   - Added field handling in DTOs
   - Added transform methods

3. ✅ `src/components/navigation/NavigationPanel.tsx`
   - Fixed initialization logic (use ref instead of state)
   - Fixed empty array handling
   - Added collapse/expand all buttons
   - Added save state logic
   - Added debug logging

4. ✅ `src/components/navigation/styles/NavigationPanel.css`
   - Created new CSS file
   - Added toolbar styles
   - Added button hover/active states
   - Added disabled state

5. ✅ `src/components/dashboard/DashboardDock.tsx`
   - Initialize with saved state
   - Update when API data loads
   - Save on toggle

---

## 🔧 Backend Requirements

### Model Update

**File:** `DashboardPortal/Models/NavigationSetting.cs`

```csharp
public class NavigationSetting
{
    public int Id { get; set; }
    public string UserId { get; set; }
    public string ViewGroupOrder { get; set; }      // JSON
    public string ViewOrders { get; set; }          // JSON
    public string HiddenViewGroups { get; set; }    // JSON
    public string HiddenViews { get; set; }         // JSON
    
    // ✅ ADD THESE TWO FIELDS:
    public string ExpandedViewGroups { get; set; }  // JSON array
    public bool? IsNavigationCollapsed { get; set; } // boolean
    
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    
    public User User { get; set; }
}
```

### Migration

```bash
cd DashboardPortal
dotnet ef migrations add AddExpandCollapseToNavigationSettings
dotnet ef database update
```

**Generated SQL:**
```sql
ALTER TABLE [NavigationSettings]
ADD [ExpandedViewGroups] nvarchar(max) NULL,
    [IsNavigationCollapsed] bit NULL;
```

### Controller Update

**File:** `DashboardPortal/Controllers/NavigationController.cs`

```csharp
[HttpPut("{userId}")]
public async Task<ActionResult<NavigationSettingDto>> UpdateNavigationSetting(
    string userId,
    [FromBody] UpdateNavigationSettingDto dto)
{
    var setting = await _context.NavigationSettings
        .FirstOrDefaultAsync(ns => ns.UserId == userId);

    if (setting == null)
    {
        setting = new NavigationSetting
        {
            UserId = userId,
            CreatedAt = DateTime.UtcNow
        };
        _context.NavigationSettings.Add(setting);
    }

    setting.ViewGroupOrder = JsonSerializer.Serialize(dto.ViewGroupOrder ?? new List<string>());
    setting.ViewOrders = JsonSerializer.Serialize(dto.ViewOrders ?? new Dictionary<string, List<string>>());
    setting.HiddenViewGroups = JsonSerializer.Serialize(dto.HiddenViewGroups ?? new List<string>());
    setting.HiddenViews = JsonSerializer.Serialize(dto.HiddenViews ?? new List<string>());
    
    // ✅ ADD THESE TWO LINES:
    setting.ExpandedViewGroups = JsonSerializer.Serialize(dto.ExpandedViewGroups ?? new List<string>());
    setting.IsNavigationCollapsed = dto.IsNavigationCollapsed ?? false;
    
    setting.UpdatedAt = DateTime.UtcNow;

    await _context.SaveChangesAsync();

    return Ok(MapToDto(setting));
}

private NavigationSettingDto MapToDto(NavigationSetting setting)
{
    return new NavigationSettingDto
    {
        Id = setting.Id,
        UserId = setting.UserId,
        ViewGroupOrder = JsonSerializer.Deserialize<List<string>>(setting.ViewGroupOrder ?? "[]"),
        ViewOrders = JsonSerializer.Deserialize<Dictionary<string, List<string>>>(setting.ViewOrders ?? "{}"),
        HiddenViewGroups = JsonSerializer.Deserialize<List<string>>(setting.HiddenViewGroups ?? "[]"),
        HiddenViews = JsonSerializer.Deserialize<List<string>>(setting.HiddenViews ?? "[]"),
        
        // ✅ ADD THESE TWO LINES:
        ExpandedViewGroups = JsonSerializer.Deserialize<List<string>>(setting.ExpandedViewGroups ?? "[]"),
        IsNavigationCollapsed = setting.IsNavigationCollapsed ?? false
    };
}
```

---

## 🎯 Key Fixes Summary

| Issue | Root Cause | Solution |
|-------|------------|----------|
| Groups re-expand | useEffect dependency array | Use useRef instead of useState for initialization flag |
| Empty array ignored | Treating `[]` as "no state" | Check for `undefined` not length > 0 |
| Button not visible | Conditional on viewGroups length | Always show, disable when empty |
| Panel state ignored | Initialize before API loads | Initialize with API value, update on change |

---

## ✅ Verification Checklist

After deploying backend changes:

- [ ] Click "Collapse All" → All groups collapse
- [ ] Refresh page → Groups stay collapsed
- [ ] Click "Expand All" → All groups expand
- [ ] Refresh page → Groups stay expanded
- [ ] Collapse navigation panel → Panel collapses
- [ ] Refresh page → Panel stays collapsed
- [ ] Expand navigation panel → Panel expands
- [ ] Refresh page → Panel stays expanded
- [ ] Check browser console for debug logs
- [ ] Verify API calls in Network tab
- [ ] Check database for saved values

---

## 🔍 Debug Logging

**What to look for in browser console:**

### On Initial Load:
```
🔄 Initializing view group expand state
  Saved expandedViewGroups: ["vg-1", "vg-3"]
  ViewGroups count: 4
  ✅ Using saved state from backend
    View Group 1: EXPANDED
    View Group 2: COLLAPSED
    View Group 3: EXPANDED
    View Group 4: COLLAPSED
  ✅ Final expanded state: {...}
```

### On Collapse All:
```
💾 Saving view group expand/collapse state: []
  Total groups: 4
  Expanded count: 0
✅ Saved to backend successfully
```

### On Expand All:
```
💾 Saving view group expand/collapse state: ["vg-1", "vg-2", "vg-3", "vg-4"]
  Total groups: 4
  Expanded count: 4
✅ Saved to backend successfully
```

### On Navigation Panel Toggle:
```
💾 Saved navigation collapse state: true
```

---

## 🚀 Next Steps

1. **Apply backend migration:**
   ```bash
   cd DashboardPortal
   dotnet ef migrations add AddExpandCollapseToNavigationSettings
   dotnet ef database update
   ```

2. **Update backend code:**
   - NavigationSetting model
   - NavigationController
   - DTOs

3. **Test:**
   - Test all scenarios in checklist
   - Check console logs
   - Verify database values

4. **Deploy:**
   - Frontend changes are already live
   - Deploy backend changes
   - Clear browser cache if needed

---

**Status:** ✅ Frontend fixes complete, backend migration required

**Expected Behavior After Backend Update:**
- Click "Collapse All" → Stays collapsed on refresh ✅
- Click "Expand All" → Stays expanded on refresh ✅
- Individual group states → Persist correctly ✅
- Navigation panel collapse → Persists correctly ✅
