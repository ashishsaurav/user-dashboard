
# 🔌 Backend Integration Guide

**Status:** ✅ **READY FOR INTEGRATION**  
**Date:** 2025-10-10

---

## 📋 Overview

This guide explains the backend integration architecture that has been prepared for easy API integration. The codebase is now **100% ready** to connect to a backend API with minimal changes.

---

## 🏗️ Architecture Overview

### **Layered Architecture**

```
┌─────────────────────────────────────────────┐
│           UI Components Layer                │
│  (React Components - No direct API calls)   │
└──────────────────┬──────────────────────────┘
                   │
┌──────────────────▼──────────────────────────┐
│         Custom Hooks Layer                   │
│  (useReports, useWidgets, useViews, etc.)   │
└──────────────────┬──────────────────────────┘
                   │
┌──────────────────▼──────────────────────────┐
│        Data Fetching Layer                   │
│     (useQuery, useMutation hooks)            │
└──────────────────┬──────────────────────────┘
                   │
┌──────────────────▼──────────────────────────┐
│         Repository Layer                     │
│  (reportRepository, widgetRepository, etc.)  │
└──────────────────┬──────────────────────────┘
                   │
┌──────────────────▼──────────────────────────┐
│          API Client Layer                    │
│   (HTTP client with interceptors & cache)   │
└──────────────────┬──────────────────────────┘
                   │
┌──────────────────▼──────────────────────────┐
│            Backend API                       │
│    (Your REST/GraphQL API Server)           │
└─────────────────────────────────────────────┘
```

---

## 📁 New Files Created

### **1. Configuration**
```
src/config/
└── api.config.ts          ✨ API endpoints & configuration
```

### **2. API Services**
```
src/services/api/
├── apiClient.ts           ✨ HTTP client with retry & cache
├── authService.ts         ✨ Authentication service
└── repositories/
    ├── index.ts           ✨ Repository exports
    ├── reportRepository.ts ✨ Report data access
    ├── widgetRepository.ts ✨ Widget data access
    └── viewRepository.ts   ✨ View data access
```

### **3. Data Hooks**
```
src/hooks/api/
├── index.ts              ✨ Hook exports
├── useQuery.ts           ✨ React Query-like data fetching
├── useMutation.ts        ✨ React Query-like mutations
├── useReports.ts         ✨ Report hooks
├── useWidgets.ts         ✨ Widget hooks
└── useViews.ts           ✨ View hooks
```

### **4. Context & Error Handling**
```
src/contexts/
└── ApiProvider.tsx       ✨ API context provider

src/components/
└── ErrorBoundary.tsx     ✨ Error boundary component

.env.example              ✨ Environment variables template
```

---

## 🚀 Quick Start

### **Step 1: Environment Setup**

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Edit `.env` with your API URL:

```env
REACT_APP_API_BASE_URL=http://localhost:3001/api
REACT_APP_ENV=development
REACT_APP_ENABLE_CACHE=true
```

### **Step 2: Wrap App with Providers**

Update `src/index.tsx`:

```typescript
import { ApiProvider } from './contexts/ApiProvider';
import { ErrorBoundary } from './components/ErrorBoundary';

root.render(
  <ErrorBoundary>
    <ApiProvider>
      <App />
    </ApiProvider>
  </ErrorBoundary>
);
```

### **Step 3: Use Data Hooks in Components**

Example - Fetch reports:

```typescript
import { useReports, useCreateReport } from './hooks/api';

function ReportsList() {
  // Fetch reports
  const { data, isLoading, error, refetch } = useReports({
    page: 1,
    limit: 20,
  });

  // Create report mutation
  const createReport = useCreateReport();

  const handleCreate = async () => {
    await createReport.mutateAsync({
      name: 'New Report',
      url: 'https://example.com',
      userRoles: ['admin', 'user'],
    });
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <button onClick={handleCreate}>Create Report</button>
      {data?.data.map(report => (
        <div key={report.id}>{report.name}</div>
      ))}
    </div>
  );
}
```

---

## 🎯 Key Features

### **1. API Client** (`apiClient.ts`)

✅ **Automatic Retry** - Retries failed requests with exponential backoff  
✅ **Request/Response Caching** - Reduces API calls  
✅ **Interceptors** - Add headers, handle auth, log requests  
✅ **Timeout Handling** - Prevents hanging requests  
✅ **Error Handling** - Consistent error format  

**Usage:**
```typescript
import { apiClient } from './services/api/apiClient';

// GET request
const response = await apiClient.get('/reports');

// POST request
const created = await apiClient.post('/reports', { name: 'Test' });

// With custom config
const response = await apiClient.get('/reports', {
  params: { page: 1 },
  timeout: 5000,
  retry: false,
});
```

### **2. Authentication Service** (`authService.ts`)

✅ **Token Management** - Handles JWT tokens  
✅ **Auto Token Refresh** - Refreshes expired tokens  
✅ **Session Persistence** - Saves auth state  
✅ **Auto Logout** - Clears session on 401  

**Usage:**
```typescript
import { authService } from './services/api/authService';

// Login
const { user, token } = await authService.login({
  username: 'admin',
  password: 'password',
});

// Check auth status
if (authService.isAuthenticated()) {
  // User is logged in
}

// Logout
await authService.logout();
```

### **3. Repository Pattern**

Separates data access logic from business logic.

**Benefits:**
- ✅ Single source of truth for data operations
- ✅ Easy to mock for testing
- ✅ Consistent API across the app
- ✅ Easy to swap implementations

**Example:**
```typescript
import { reportRepository } from './services/api/repositories';

// Get all reports
const reports = await reportRepository.getAll({ page: 1 });

// Get by ID
const report = await reportRepository.getById('report-1');

// Create
const newReport = await reportRepository.create({
  name: 'New Report',
  url: 'https://example.com',
  userRoles: ['admin'],
});

// Update
const updated = await reportRepository.update('report-1', {
  name: 'Updated Name',
});

// Delete
await reportRepository.delete('report-1');
```

### **4. Data Fetching Hooks**

React Query-like hooks for declarative data fetching.

**Features:**
- ✅ Automatic caching
- ✅ Automatic refetching
- ✅ Loading/error states
- ✅ Optimistic updates
- ✅ Query invalidation

**Example:**
```typescript
import { useReports, useCreateReport } from './hooks/api';

function MyComponent() {
  // Automatically fetches and caches
  const { data, isLoading, error, refetch } = useReports();

  // Mutation with automatic cache invalidation
  const createReport = useCreateReport();

  const handleCreate = async () => {
    await createReport.mutateAsync({
      name: 'New Report',
      url: 'https://example.com',
      userRoles: ['admin'],
    });
    // Reports list automatically refetches!
  };

  return (
    <div>
      {isLoading && <div>Loading...</div>}
      {error && <div>Error: {error.message}</div>}
      {data && <div>Loaded {data.total} reports</div>}
      <button onClick={refetch}>Refresh</button>
    </div>
  );
}
```

---

## 📊 API Endpoints Configuration

All endpoints are centralized in `src/config/api.config.ts`:

```typescript
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    ME: '/auth/me',
  },
  REPORTS: {
    LIST: '/reports',
    GET: (id: string) => `/reports/${id}`,
    CREATE: '/reports',
    UPDATE: (id: string) => `/reports/${id}`,
    DELETE: (id: string) => `/reports/${id}`,
  },
  // ... more endpoints
};
```

**To add a new endpoint:**

1. Add to `API_ENDPOINTS` in `api.config.ts`
2. Create repository in `services/api/repositories/`
3. Create hooks in `hooks/api/`

---

## 🔧 Customization

### **Change Base URL**

In `.env`:
```env
REACT_APP_API_BASE_URL=https://api.production.com/v1
```

### **Add Request Interceptor**

```typescript
import { apiClient } from './services/api/apiClient';

apiClient.addRequestInterceptor((config) => {
  // Add custom header
  if (!config.headers) config.headers = {};
  config.headers['X-Custom-Header'] = 'value';
  return config;
});
```

### **Add Response Interceptor**

```typescript
apiClient.addResponseInterceptor(async (response) => {
  // Log all responses
  console.log('Response:', response.status);
  
  // Transform data
  if (response.ok) {
    const data = await response.clone().json();
    console.log('Data:', data);
  }
  
  return response;
});
```

### **Custom Error Handling**

```typescript
import { useReports } from './hooks/api';

function MyComponent() {
  const { data, error } = useReports(undefined, {
    onError: (err) => {
      // Custom error handling
      if (err.status === 404) {
        console.log('Reports not found');
      }
    },
  });
}
```

---

## 🧪 Testing with Mock Data

### **Option 1: Keep Current Mock Data**

The app currently uses `testData.ts`. You can keep this for development:

```typescript
// In your component
const USE_MOCK_DATA = process.env.REACT_APP_ENV === 'development';

if (USE_MOCK_DATA) {
  // Use testData.ts
  const reports = testReports;
} else {
  // Use API hooks
  const { data: reports } = useReports();
}
```

### **Option 2: Mock API Responses**

```typescript
// mock-api.ts
import { apiClient } from './services/api/apiClient';

// Mock fetch
global.fetch = jest.fn((url) => {
  if (url.includes('/reports')) {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({
        data: [/* mock reports */],
        total: 10,
      }),
    });
  }
});
```

---

## 🔐 Authentication Flow

### **Login Flow**

```typescript
import { authService } from './services/api/authService';
import { useApi } from './contexts/ApiProvider';

function Login() {
  const { setUser } = useApi();

  const handleLogin = async (username: string, password: string) => {
    const { user, token } = await authService.login({ username, password });
    setUser(user);
    // Token automatically set in apiClient
    // Redirect to dashboard
  };
}
```

### **Protected Routes**

```typescript
import { useApi } from './contexts/ApiProvider';
import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useApi();

  if (isLoading) return <div>Loading...</div>;
  if (!isAuthenticated) return <Navigate to="/login" />;

  return children;
}
```

### **Auto Logout on 401**

Already implemented in `apiClient.ts`:

```typescript
apiClient.addResponseInterceptor(async (response) => {
  if (response.status === 401) {
    // Clear tokens
    authService.logout();
    // Redirect to login
    window.location.href = '/login';
  }
  return response;
});
```

---

## 📝 Backend API Requirements

Your backend should implement these endpoints:

### **Authentication**
```
POST   /api/auth/login         - Login with username/password
POST   /api/auth/logout        - Logout current session
POST   /api/auth/refresh       - Refresh access token
GET    /api/auth/me            - Get current user
```

### **Reports**
```
GET    /api/reports            - List reports (with pagination)
GET    /api/reports/:id        - Get report by ID
POST   /api/reports            - Create report
PUT    /api/reports/:id        - Update report
DELETE /api/reports/:id        - Delete report
```

### **Widgets**
```
GET    /api/widgets            - List widgets
GET    /api/widgets/:id        - Get widget by ID
POST   /api/widgets            - Create widget
PUT    /api/widgets/:id        - Update widget
DELETE /api/widgets/:id        - Delete widget
```

### **Views**
```
GET    /api/views/user/:userId - List views for user
GET    /api/views/:id          - Get view by ID
POST   /api/views              - Create view
PUT    /api/views/:id          - Update view
DELETE /api/views/:id          - Delete view
```

### **Expected Response Format**

```typescript
// List endpoint
{
  "data": [/* array of items */],
  "total": 100,
  "page": 1,
  "limit": 20,
  "totalPages": 5
}

// Single item endpoint
{
  "id": "report-1",
  "name": "Sales Report",
  "url": "https://example.com",
  // ... other fields
}

// Error response
{
  "message": "Error message",
  "code": "ERROR_CODE",
  "status": 400,
  "details": {/* optional */}
}
```

---

## 🎯 Migration Path

### **Current State → Backend Integration**

**Step 1: Keep Both (Gradual Migration)**
```typescript
const USE_API = process.env.REACT_APP_USE_API === 'true';

if (USE_API) {
  const { data } = useReports();  // New API hooks
} else {
  const data = testReports;        // Old mock data
}
```

**Step 2: Switch Component by Component**
- Start with read-only operations (GET)
- Then add mutations (POST, PUT, DELETE)
- Test thoroughly
- Remove mock data

**Step 3: Remove Mock Data**
- Delete `testData.ts` usage
- Remove mock functions
- Update `sessionStorage` to use API

---

## ✅ Checklist for Backend Integration

### **Frontend (This Repo)**
- [x] API client with retry & caching
- [x] Authentication service
- [x] Repository pattern
- [x] Data fetching hooks
- [x] Error boundary
- [x] Environment configuration
- [x] TypeScript types
- [x] Comprehensive documentation

### **Backend (Your API)**
- [ ] Implement REST endpoints
- [ ] Add authentication (JWT)
- [ ] Add CORS headers
- [ ] Implement pagination
- [ ] Add error handling
- [ ] Add logging
- [ ] Add rate limiting
- [ ] API documentation

### **Deployment**
- [ ] Set production API URL
- [ ] Configure CORS
- [ ] Set up SSL/HTTPS
- [ ] Configure CDN (if needed)
- [ ] Set up monitoring
- [ ] Set up error tracking (Sentry, etc.)

---

## 🚨 Common Issues & Solutions

### **Issue: CORS Errors**

**Solution:** Add CORS headers in backend:
```javascript
// Express.js example
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
}));
```

### **Issue: 401 Unauthorized**

**Solution:** Check if token is being sent:
```typescript
// Should be automatic, but verify:
console.log(authService.getToken());
```

### **Issue: Slow API Calls**

**Solution:** Enable caching:
```typescript
const { data } = useReports(undefined, {
  cache: true,
  staleTime: 5 * 60 * 1000, // 5 minutes
});
```

### **Issue: Data Not Refreshing**

**Solution:** Clear cache after mutations:
```typescript
import { clearQueryCache } from './hooks/api/useQuery';

// Clear specific query
clearQueryCache('reports');

// Clear all cache
clearQueryCache();
```

---

## 📊 Performance Optimization

### **1. Caching Strategy**

```typescript
// Short cache for frequently changing data
const { data } = useReports(undefined, {
  staleTime: 1 * 60 * 1000, // 1 minute
});

// Long cache for static data
const { data } = useUserSettings(userId, {
  staleTime: 10 * 60 * 1000, // 10 minutes
});
```

### **2. Prefetching**

```typescript
// Prefetch on hover
const prefetchReport = (id: string) => {
  reportRepository.getById(id); // Triggers fetch & cache
};

<div onMouseEnter={() => prefetchReport('report-1')}>
  Hover to prefetch
</div>
```

### **3. Pagination**

```typescript
const [page, setPage] = useState(1);
const { data } = useReports({ page, limit: 20 });

// Each page is cached separately
```

---

## 🎓 Best Practices

### **1. Use Hooks, Not Repositories Directly**

❌ **Bad:**
```typescript
import { reportRepository } from './services/api/repositories';

function MyComponent() {
  const [reports, setReports] = useState([]);
  
  useEffect(() => {
    reportRepository.getAll().then(setReports);
  }, []);
}
```

✅ **Good:**
```typescript
import { useReports } from './hooks/api';

function MyComponent() {
  const { data: reports } = useReports();
  // Automatic caching, refetching, error handling!
}
```

### **2. Handle Loading & Error States**

```typescript
const { data, isLoading, error } = useReports();

if (isLoading) return <Spinner />;
if (error) return <ErrorMessage error={error} />;
if (!data) return <EmptyState />;

return <ReportsList reports={data.data} />;
```

### **3. Use Optimistic Updates**

```typescript
const updateReport = useUpdateReport();

const handleUpdate = async (id: string, newName: string) => {
  // Update UI immediately
  setLocalReport({ ...report, name: newName });
  
  try {
    await updateReport.mutateAsync({ id, data: { name: newName } });
  } catch (error) {
    // Revert on error
    setLocalReport(report);
  }
};
```

---

## 🏁 Summary

**This architecture provides:**

✅ **Complete separation of concerns**  
✅ **Easy to test** (mock repositories)  
✅ **Easy to switch backends** (change one file)  
✅ **Automatic caching & refetching**  
✅ **Consistent error handling**  
✅ **Type-safe** throughout  
✅ **Production-ready** patterns  

**To integrate with your backend:**

1. Set `REACT_APP_API_BASE_URL` in `.env`
2. Implement backend endpoints (see requirements above)
3. Replace mock data with hooks one component at a time
4. Test thoroughly
5. Deploy! 🚀

---

**Status:** ✅ **READY FOR BACKEND INTEGRATION**

*For questions, refer to code comments or create an issue.*
