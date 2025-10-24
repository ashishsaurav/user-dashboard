# How to Restart Your React App (Compile Changes)

## Simple Steps

### 1. Stop the Current Server

In your terminal where the app is running, press:
```
Ctrl + C
```

You should see the server stop.

### 2. Clear the Cache (Important!)

Run this command:

**Linux/Mac:**
```bash
rm -rf node_modules/.cache
```

**Windows (PowerShell):**
```powershell
Remove-Item -Recurse -Force node_modules\.cache
```

**Windows (Command Prompt):**
```cmd
rmdir /s /q node_modules\.cache
```

### 3. Start the Server Again

```bash
npm start
```

The app will:
- Compile all your code (including the changes)
- Start the development server
- Open in your browser (usually http://localhost:3000)

### 4. Wait for It to Finish

You'll see output like:
```
Compiled successfully!

You can now view user-dashboard in the browser.

  Local:            http://localhost:3000
  On Your Network:  http://192.168.x.x:3000
```

## That's It!

Your changes are now compiled and running. Open the browser console (F12) and test maximize/minimize - you should now see the new log messages.

---

## Alternative: If npm start Doesn't Work

If `npm start` gives errors, try this full reset:

```bash
# 1. Stop server (Ctrl+C)

# 2. Clear ALL caches
rm -rf node_modules/.cache
rm -rf build

# 3. Start fresh
npm start
```

## Troubleshooting

### "Port 3000 already in use"

If you get this error:

**Option 1: Kill the old process**
```bash
# Linux/Mac
lsof -ti:3000 | xargs kill -9

# Windows (PowerShell)
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process
```

**Option 2: Use a different port**
```bash
PORT=3001 npm start
```

### Changes Still Not Showing

1. Hard refresh browser: `Ctrl + Shift + R` (Windows/Linux) or `Cmd + Shift + R` (Mac)
2. Clear browser cache in DevTools:
   - Open DevTools (F12)
   - Go to Network tab
   - Check "Disable cache" checkbox
   - Refresh page

### Still Having Issues?

Try the nuclear option:
```bash
# Stop server
# Clear everything
rm -rf node_modules
rm -rf node_modules/.cache
rm -rf build

# Reinstall
npm install

# Start
npm start
```
