# 🚀 Frontend-Backend Integration Guide

## ✅ Integration Complete!

Your React frontend is now fully integrated with your .NET Core backend API.

---

## 🔧 Quick Setup

### 1. **Configure Backend URL**

The frontend is configured to connect to: `https://localhost:7153/api`

**To change the port:**
1. Open `.env` file in the root directory
2. Update `REACT_APP_API_BASE_URL` with your backend URL:
   ```
   REACT_APP_API_BASE_URL=https://localhost:YOUR_PORT/api
   ```

### 2. **Find Your Backend Port**

Check your backend's `Properties/launchSettings.json` or when you run the backend, it will show:
```
Now listening on: https://localhost:7153
```

### 3. **Start the Backend**

```bash
cd path/to/DashboardPortal
dotnet run
```

Or run from Visual Studio by pressing F5.

### 4. **Start the Frontend**

```bash
npm install  # First time only
npm start
```

The app will open at `http://localhost:3000`

---

## 🔐 Login Credentials

Use these email addresses to login (from your database):

**Admin Users:**
- john.admin@company.com
- sarah.admin@company.com

**Standard Users:**
- alice.dev@company.com
- bob.dev@company.com
- charlie.test@company.com

**Viewers:**
- david.view@company.com
- emma.view@company.com

---

## 📋 What's Been Integrated

### ✅ **Authentication**
- Email-based login (POST /api/users/login)
- Session management with sessionStorage
- Auto-logout on browser close

### ✅ **Reports & Widgets**
- Role-based access (GET /api/reports/role/{roleId})
- CRUD operations
- Assignment to roles

### ✅ **Views & View Groups**
- User-specific data (GET /api/views/user/{userId})
- Create, update, delete operations
- Many-to-many relationships
- Reordering functionality

### ✅ **Navigation Settings**
- Per-user navigation preferences
- Hidden items tracking
- View group/view ordering

### ✅ **Layout Persistence**
- Custom layouts saved to database
- Layout signatures for different states
- Automatic layout restoration

---

## 🗂️ New Files Created

### Services (src/services/)
- `apiClient.ts` - HTTP client with error handling
- `authService.ts` - Authentication API calls
- `reportsService.ts` - Reports API calls
- `widgetsService.ts` - Widgets API calls
- `viewsService.ts` - Views API calls
- `viewGroupsService.ts` - View Groups API calls
- `navigationService.ts` - Navigation settings API calls
- `layoutService.ts` - Layout customization API calls
- `layoutPersistenceServiceApi.ts` - API-based layout persistence

### Hooks (src/hooks/)
- `useApiData.ts` - Custom hook to load all user data

### Configuration
- `.env` - Environment variables
- `.env.example` - Template for environment variables

---

## 🔄 Data Flow

```
User Login (Email)
    ↓
Frontend → POST /api/users/login
    ↓
Backend returns User data (userId, roleId, etc.)
    ↓
Frontend loads:
    - Reports (by role)
    - Widgets (by role)
    - Views (by userId)
    - ViewGroups (by userId)
    - Navigation Settings (by userId)
    - Layout Customizations (by userId)
    ↓
Dashboard renders with real data
```

---

## 🐛 Troubleshooting

### ❌ "Network request failed"
**Problem:** Can't connect to backend

**Solutions:**
1. Make sure backend is running (`dotnet run`)
2. Check the port in `.env` matches your backend
3. Verify CORS is enabled in backend (already done)
4. Check for HTTPS certificate issues (accept self-signed cert in browser)

### ❌ "User not found"
**Problem:** Login fails

**Solutions:**
1. Make sure database is populated (run your SQL scripts)
2. Check user exists: `SELECT * FROM Users WHERE Email = 'john.admin@company.com'`
3. Verify connection string in backend's `appsettings.json`

### ❌ "CORS policy error"
**Problem:** Browser blocks requests

**Solutions:**
1. Backend CORS is already configured for all origins
2. Make sure backend is actually running
3. Check browser console for exact error

### ❌ SSL/Certificate errors
**Problem:** "Certificate not trusted"

**Solutions:**
1. In browser, visit `https://localhost:7153` directly
2. Accept the self-signed certificate warning
3. Then try the frontend again

---

## 📊 API Endpoints Reference

### Authentication
- `POST /api/users/login` - Login with email
- `GET /api/users/{userId}` - Get user details

### Reports
- `GET /api/reports/role/{roleId}` - Get reports for role
- `POST /api/reports` - Create report
- `PUT /api/reports/{id}` - Update report
- `DELETE /api/reports/{id}` - Delete report

### Widgets
- `GET /api/widgets/role/{roleId}` - Get widgets for role
- `POST /api/widgets` - Create widget
- `PUT /api/widgets/{id}` - Update widget
- `DELETE /api/widgets/{id}` - Delete widget

### Views
- `GET /api/views/user/{userId}` - Get user's views
- `POST /api/views` - Create view
- `PUT /api/views/{id}` - Update view
- `DELETE /api/views/{id}` - Delete view
- `POST /api/views/{id}/reports` - Add reports to view
- `POST /api/views/{id}/widgets` - Add widgets to view

### View Groups
- `GET /api/viewgroups/user/{userId}` - Get user's view groups
- `POST /api/viewgroups` - Create view group
- `PUT /api/viewgroups/{id}` - Update view group
- `DELETE /api/viewgroups/{id}` - Delete view group

### Navigation
- `GET /api/navigation/{userId}` - Get navigation settings
- `PUT /api/navigation/{userId}` - Update navigation settings

### Layout
- `GET /api/layout/{userId}` - Get all layouts
- `GET /api/layout/{userId}/{signature}` - Get specific layout
- `POST /api/layout/{userId}` - Save layout
- `DELETE /api/layout/{userId}/{signature}` - Delete layout

---

## 🎯 Testing the Integration

### 1. **Test Login**
1. Start backend and frontend
2. Use email: `john.admin@company.com`
3. Should see dashboard with navigation

### 2. **Test Data Loading**
1. Open browser console (F12)
2. Look for: `✅ API Data loaded successfully`
3. Check network tab for API calls

### 3. **Test CRUD Operations**
1. Try creating a new view
2. Add reports/widgets to it
3. Check database to see changes

### 4. **Test Layout Persistence**
1. Resize panels in dashboard
2. Refresh page
3. Layout should be restored

---

## 📝 Next Steps

### Recommended Enhancements:

1. **Add JWT Authentication**
   - Currently using simple email login
   - Add proper token-based auth for production

2. **Add Error Boundaries**
   - Already have ErrorBoundary component
   - Use it to wrap more components

3. **Add Loading States**
   - Loading indicators while fetching data
   - Skeleton loaders for better UX

4. **Add Optimistic Updates**
   - Update UI before API call completes
   - Rollback on error

5. **Add Data Caching**
   - Cache frequently accessed data
   - Reduce API calls

6. **Add Real-time Updates**
   - SignalR integration
   - Live updates when data changes

---

## 🆘 Need Help?

### Common Issues:

1. **Port conflicts:** Change backend port in `launchSettings.json`
2. **Database not found:** Run SQL scripts to create DB
3. **CORS errors:** Already configured, check backend is running
4. **Type errors:** Run `npm install` to ensure all dependencies

### Useful Commands:

```bash
# Check if backend is responding
curl https://localhost:7153/api/users

# Clear browser cache
Ctrl+Shift+Delete (or Cmd+Shift+Delete on Mac)

# Reset database
# Run your schema.sql script again

# Reset frontend storage
# Open browser console and run:
sessionStorage.clear()
```

---

## ✨ Success Checklist

- [ ] Backend running without errors
- [ ] Frontend connecting to correct port
- [ ] Can login with test email
- [ ] Dashboard loads with data
- [ ] Can create/edit views
- [ ] Can add reports/widgets
- [ ] Layout persists after refresh
- [ ] No CORS errors in console

---

## 🎉 You're All Set!

Your dashboard is now fully integrated with the backend. All data is coming from your SQL Server database through the .NET Core API.

**Happy coding! 🚀**
