# ⚡ Quick Start Guide

## 🚀 Get Running in 3 Steps

### Step 1: Configure Backend URL (30 seconds)

1. Find your backend port by looking at `DashboardPortal/Properties/launchSettings.json`:
   ```json
   "applicationUrl": "https://localhost:7153;http://localhost:5153"
   ```
   The HTTPS port is `7153` in this example.

2. Update `.env` file in frontend root:
   ```bash
   REACT_APP_API_BASE_URL=https://localhost:7153/api
   ```
   *(Change 7153 to your port)*

### Step 2: Start Backend (1 minute)

**Option A: Visual Studio**
- Open `DashboardPortal.sln`
- Press `F5`
- Wait for: "Now listening on: https://localhost:7153"

**Option B: Command Line**
```bash
cd path/to/DashboardPortal/DashboardPortal
dotnet run
```

### Step 3: Start Frontend (1 minute)

```bash
# In your frontend directory
npm install        # First time only
npm start
```

Browser opens automatically at `http://localhost:3000`

---

## 🔐 Login

Use any of these emails (no password required):

**Click to copy:**
```
john.admin@company.com       (Admin - Full Access)
alice.dev@company.com        (User - Standard Access)
david.view@company.com       (Viewer - Read Only)
```

---

## ✅ Verify It's Working

You should see:

### In Browser Console (F12):
```
🌐 API Request: POST https://localhost:7153/api/users/login
✅ API Response: POST https://localhost:7153/api/users/login {userId: "admin1", ...}
✅ API Data loaded successfully {reports: 10, widgets: 10, views: 5, viewGroups: 3}
```

### In UI:
- ✅ Navigation panel on left
- ✅ View groups visible
- ✅ Views visible
- ✅ Can click on views
- ✅ Reports and widgets load

---

## 🐛 Something Wrong?

### Backend not responding?
```bash
# Check if it's running
curl https://localhost:7153/api/users

# Should return list of users
```

### SSL certificate error?
1. Visit `https://localhost:7153` in browser
2. Click "Advanced"
3. Click "Proceed to localhost (unsafe)"
4. Now try frontend again

### Wrong port?
1. Check backend console output for actual port
2. Update `.env` file
3. Restart frontend (`npm start`)

### Database not found?
```sql
-- Run this in SQL Server Management Studio
USE master;
SELECT name FROM sys.databases WHERE name = 'DashboardPortal';

-- If not found, run your schema.sql script
```

---

## 🎉 Success!

If you can:
- ✅ Login with email
- ✅ See navigation panel
- ✅ See your views
- ✅ Create/edit views
- ✅ Add reports/widgets

**You're all set!** 🚀

---

## 📖 Need More Info?

- **Complete Setup:** See `INTEGRATION_GUIDE.md`
- **What Changed:** See `INTEGRATION_COMPLETE.md`
- **Troubleshooting:** See `INTEGRATION_GUIDE.md` → Troubleshooting

---

**Total Time to Get Running: ~2-3 minutes** ⚡
