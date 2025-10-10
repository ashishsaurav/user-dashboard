# Layout Persistence Testing Checklist

## ✅ Visual Testing Guide

Use this checklist to verify the layout persistence system is working correctly.

---

## 🧪 Test Suite

### Test 1: Basic Persistence ⭐ (Critical)

**Steps:**
1. [ ] Login as `admin` / `admin123`
2. [ ] Select any view with both reports and widgets
3. [ ] Drag the panel divider to resize panels
   - Set reports to ~60% width
   - Set widgets to ~40% width
4. [ ] Note the panel sizes
5. [ ] Refresh the page (F5 or Ctrl+R)
6. [ ] Login again if needed

**Expected Result:**
- ✅ Panel sizes are restored to ~60%/40%
- ✅ Layout looks exactly as you left it

**Actual Result:**
- [ ] PASS ✓
- [ ] FAIL ✗ (Describe issue: _____________)

---

### Test 2: Structure Change Reset ⭐ (Critical)

**Steps:**
1. [ ] Login as `admin`
2. [ ] Select a view with both reports and widgets
3. [ ] Customize panel sizes (e.g., 70%/30%)
4. [ ] Note the sizes
5. [ ] Click on a different view that has ONLY reports (no widgets)
6. [ ] Observe the layout

**Expected Result:**
- ✅ Layout resets to default (reports takes full width)
- ✅ No broken panels or errors

**Actual Result:**
- [ ] PASS ✓
- [ ] FAIL ✗ (Describe issue: _____________)

---

### Test 3: Layout Restoration ⭐ (Critical)

**Prerequisite:** Complete Test 2 first

**Steps:**
1. [ ] You should be on a view with only reports
2. [ ] Return to the view from Test 2 (had reports + widgets)
3. [ ] Observe the layout

**Expected Result:**
- ✅ Custom layout is restored (70%/30% from Test 2)
- ✅ Panels are positioned as before

**Actual Result:**
- [ ] PASS ✓
- [ ] FAIL ✗ (Describe issue: _____________)

---

### Test 4: Panel Close/Reopen ⭐ (Important)

**Steps:**
1. [ ] Select a view with both reports and widgets visible
2. [ ] Customize the layout (resize panels)
3. [ ] Note the panel sizes
4. [ ] Close the widgets panel (X button on panel)
5. [ ] Observe the layout
6. [ ] Click "Show Widgets" to reopen it
7. [ ] Observe the layout

**Expected Result:**
- ✅ When closed: Layout resets (reports takes full space)
- ✅ When reopened: Custom layout is restored
- ✅ No errors in console

**Actual Result:**
- [ ] PASS ✓
- [ ] FAIL ✗ (Describe issue: _____________)

---

### Test 5: Layout Settings Tab ⭐ (Important)

**Steps:**
1. [ ] Login as any user
2. [ ] Customize a few different layouts
3. [ ] Click the Settings icon (⚙️)
4. [ ] Click "Layout Settings" tab
5. [ ] Observe the content

**Expected Result:**
- ✅ Tab is visible and accessible
- ✅ Shows list of saved layout configurations
- ✅ Shows reset button
- ✅ Shows helpful information

**Actual Result:**
- [ ] PASS ✓
- [ ] FAIL ✗ (Describe issue: _____________)

---

### Test 6: Layout Reset Feature ⭐ (Important)

**Steps:**
1. [ ] Have some customized layouts (from previous tests)
2. [ ] Open Settings → Layout Settings tab
3. [ ] Note the number of saved configurations
4. [ ] Click "🔄 Reset Layout" button
5. [ ] Click "Yes" to confirm
6. [ ] Page reloads
7. [ ] Login again if needed
8. [ ] Select a previously customized view

**Expected Result:**
- ✅ All customizations are cleared
- ✅ Layout shows default configuration
- ✅ Settings tab shows "No custom layouts saved yet"

**Actual Result:**
- [ ] PASS ✓
- [ ] FAIL ✗ (Describe issue: _____________)

---

### Test 7: User Isolation ⭐ (Important)

**Steps:**
1. [ ] Login as `admin` / `admin123`
2. [ ] Select a view and customize the layout
3. [ ] Logout
4. [ ] Login as `user` / `user123`
5. [ ] Select the same view (if available) or any view
6. [ ] Observe the layout
7. [ ] Logout
8. [ ] Login as `admin` again
9. [ ] Select the same view

**Expected Result:**
- ✅ Admin's customizations are NOT visible to user
- ✅ User sees default layout (or their own customizations)
- ✅ Admin's customizations are restored when admin logs back in
- ✅ Each user has isolated layouts

**Actual Result:**
- [ ] PASS ✓
- [ ] FAIL ✗ (Describe issue: _____________)

---

### Test 8: Console Logging 📊 (Optional)

**Steps:**
1. [ ] Open browser DevTools (F12)
2. [ ] Go to Console tab
3. [ ] Login and navigate through views
4. [ ] Customize some layouts
5. [ ] Switch between views

**Expected Result:**
- ✅ See informative console logs with emoji indicators:
  - 🔍 Layout Check
  - 🔄 Signature changed
  - ✅ Restoring saved layout
  - 🆕 Generating default layout
  - 💾 Layout saved
  - 📂 Layout loaded
- ✅ No error messages
- ✅ Logs are helpful and clear

**Actual Result:**
- [ ] PASS ✓
- [ ] FAIL ✗ (Describe issue: _____________)

---

### Test 9: Layout Mode Toggle 📊 (Optional)

**Steps:**
1. [ ] Login and select a view
2. [ ] Customize the layout in horizontal mode
3. [ ] Toggle to vertical layout mode (if available)
4. [ ] Observe the layout
5. [ ] Toggle back to horizontal
6. [ ] Observe the layout

**Expected Result:**
- ✅ Horizontal mode customizations are saved
- ✅ Vertical mode gets default layout (or its own customizations)
- ✅ Switching back to horizontal restores customizations
- ✅ Each mode has independent customizations

**Actual Result:**
- [ ] PASS ✓
- [ ] FAIL ✗ (Describe issue: _____________)

---

### Test 10: SessionStorage Inspection 🔧 (Advanced)

**Steps:**
1. [ ] Customize some layouts
2. [ ] Open DevTools → Application tab
3. [ ] Navigate to Session Storage
4. [ ] Find key `layoutCustomizations_admin` (or your username)
5. [ ] Inspect the value

**Expected Result:**
- ✅ Key exists in sessionStorage
- ✅ Value is valid JSON
- ✅ Contains `userId`, `layouts` object
- ✅ Each layout has `signature`, `timestamp`, `layout` fields

**Actual Result:**
- [ ] PASS ✓
- [ ] FAIL ✗ (Describe issue: _____________)

---

## 📊 Test Results Summary

| Test | Status | Priority | Notes |
|------|--------|----------|-------|
| Test 1: Basic Persistence | [ ] PASS / [ ] FAIL | ⭐ Critical | |
| Test 2: Structure Change | [ ] PASS / [ ] FAIL | ⭐ Critical | |
| Test 3: Layout Restoration | [ ] PASS / [ ] FAIL | ⭐ Critical | |
| Test 4: Panel Close/Reopen | [ ] PASS / [ ] FAIL | ⭐ Important | |
| Test 5: Settings Tab | [ ] PASS / [ ] FAIL | ⭐ Important | |
| Test 6: Reset Feature | [ ] PASS / [ ] FAIL | ⭐ Important | |
| Test 7: User Isolation | [ ] PASS / [ ] FAIL | ⭐ Important | |
| Test 8: Console Logging | [ ] PASS / [ ] FAIL | 📊 Optional | |
| Test 9: Layout Mode Toggle | [ ] PASS / [ ] FAIL | 📊 Optional | |
| Test 10: Storage Inspection | [ ] PASS / [ ] FAIL | 🔧 Advanced | |

**Total Tests Passed:** ___ / 10

**Critical Tests Passed:** ___ / 3 (Must be 3/3 ✓)

**Important Tests Passed:** ___ / 4 (Should be 4/4 ✓)

---

## 🐛 Issue Reporting Template

If a test fails, use this template:

```
**Test:** [Test number and name]

**Steps Taken:**
1. 
2. 
3. 

**Expected:**
[What should happen]

**Actual:**
[What actually happened]

**Console Errors:**
[Any error messages from DevTools Console]

**Screenshots:**
[Attach if possible]

**Browser:**
[Chrome/Firefox/Safari version]

**User:**
[admin/user/viewer]
```

---

## ✅ Sign-Off

**Tester Name:** _________________

**Date:** _________________

**Environment:** _________________

**All Critical Tests Passed:** [ ] YES / [ ] NO

**Ready for Production:** [ ] YES / [ ] NO

**Additional Comments:**
_____________________________________________________________
_____________________________________________________________
_____________________________________________________________

---

## 🎯 Quick Verification (1 Minute)

For quick smoke testing:

1. ✅ Resize a panel → Refresh → Size is restored
2. ✅ Change view → Layout resets
3. ✅ Go back → Layout restored
4. ✅ Settings → Layout Settings tab → Shows saved layouts

If all 4 pass → Basic functionality works! ✓

---

**Pro Tip:** Open DevTools Console to see helpful debug logs during testing!
