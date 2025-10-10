# ⚡ Quick Reference Guide

**For:** Developers who want quick answers  
**Last Updated:** 2025-10-10

---

## 🚀 Quick Start

```bash
# Install
npm install

# Run dev server
npm start

# Build
npm run build

# Test
npm test
```

---

## 📁 Folder Structure

```
src/components/
├── auth/        → Login, authentication
├── dashboard/   → Main dashboard
├── modals/      → All modal components (10)
├── forms/       → Create/add forms (3)
├── features/    → Complex features (3)
├── common/      → Common utilities (4)
├── navigation/  → Navigation components (7)
├── panels/      → Panel components
├── content/     → Content display
├── shared/      → Shared/reusable
└── ui/          → UI primitives
```

---

## 💡 Common Tasks

### **Import Components**

```typescript
// From category
import { CreateView } from './components/forms';
import { AllReportsWidgets } from './components/features';
import { DeleteConfirmModal } from './components/modals';

// From main index
import { CreateView, AllReportsWidgets } from './components';
```

### **Create Modal**

```typescript
import { ConfirmDialog } from './ui/ConfirmDialog';

<ConfirmDialog
  isOpen={true}
  type="danger"
  title="Delete?"
  message="Are you sure?"
  onConfirm={handleDelete}
  onCancel={handleCancel}
/>
```

### **Create Form**

```typescript
import { useForm } from './hooks';
import { FormField } from './components/shared';
import { validators } from './utils';

const { values, errors, setValue, handleSubmit } = useForm({
  initialValues: { name: '' },
  validations: { name: validators.required("Name") },
  onSubmit: saveData,
});

<FormField
  label="Name"
  value={values.name}
  onChange={(v) => setValue('name', v)}
  error={errors.name}
  required
/>
```

### **Manage Modal State**

```typescript
import { useModalState } from './hooks';

const { isOpen, openModal, closeModal } = useModalState({
  settings: false,
});

<button onClick={() => openModal('settings')}>Settings</button>
{isOpen('settings') && <Modal onClose={() => closeModal('settings')} />}
```

### **Fetch Data (API)**

```typescript
import { useReports } from './hooks/api';

const { data, isLoading, error } = useReports();

if (isLoading) return <Spinner />;
if (error) return <Error />;
return <List data={data?.data} />;
```

### **Create Data (API)**

```typescript
import { useCreateReport } from './hooks/api';

const createReport = useCreateReport();

await createReport.mutateAsync({
  name: 'Report',
  url: 'https://...',
  userRoles: ['admin'],
});
// Auto-refetches all useReports() queries!
```

### **Array Operations**

```typescript
import { updateById, sortBy, toggleItem } from './utils/arrayHelpers';

const updated = updateById(items, 'id-1', { name: 'New' });
const sorted = sortBy(items, 'order', 'asc');
const toggled = toggleItem(selected, 'id-1');
```

### **Validate Form**

```typescript
import { validators, commonValidations } from './utils';

validations: {
  name: validators.required("Name"),
  email: commonValidations.requiredEmail,
  url: validators.url,
  age: validators.minValue(18),
}
```

---

## 🔧 Configuration

### **Environment Variables**

Create `.env`:
```env
REACT_APP_API_BASE_URL=http://localhost:3001/api
REACT_APP_ENV=development
```

### **API Config**

Edit `src/config/api.config.ts`:
```typescript
export const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_BASE_URL,
  TIMEOUT: 30000,
};
```

---

## 📦 Import Cheatsheet

### **Hooks**
```typescript
import {
  useForm,
  useModalState,
  useLocalStorage,
  useDebouncedCallback,
} from './hooks';

import {
  useReports,
  useCreateReport,
  useQuery,
  useMutation,
} from './hooks/api';
```

### **Components**
```typescript
import {
  ConfirmDialog,
  FormField,
  Modal,
  Button,
} from './components/ui';

import {
  EditItemModal,
  CheckboxGroup,
} from './components/shared';
```

### **Utilities**
```typescript
import {
  validators,
  commonValidations,
} from './utils/formValidators';

import {
  updateById,
  sortBy,
  toggleItem,
} from './utils/arrayHelpers';

import {
  cloneLayout,
  updatePanelContent,
} from './utils/layoutUtils';
```

---

## 🎯 Patterns

### **Form Pattern**
```typescript
const { values, errors, setValue, handleSubmit } = useForm({
  initialValues: {},
  validations: {},
  onSubmit: async (vals) => {},
});
```

### **Modal Pattern**
```typescript
const { isOpen, openModal, closeModal } = useModalState({});
```

### **Query Pattern**
```typescript
const { data, isLoading, error, refetch } = useQuery(key, fn, options);
```

### **Mutation Pattern**
```typescript
const mutation = useMutation(fn, { invalidateQueries: 'key' });
await mutation.mutateAsync(variables);
```

---

## 🐛 Troubleshooting

### **TypeScript Errors**
- Check all types are imported
- Verify generic types are correct
- Use `type` for mapped types, not `interface`

### **Import Errors**
- Use category imports: `./components/forms`
- Or main index: `./components`
- Don't use deep imports

### **API Errors**
- Check `.env` has `REACT_APP_API_BASE_URL`
- Verify backend is running
- Check CORS settings

---

## 📚 Full Documentation

For complete details, see:
- [DOCUMENTATION_INDEX.md](./DOCUMENTATION_INDEX.md) - This file
- [START_HERE.md](./START_HERE.md) - Getting started
- [BACKEND_INTEGRATION_GUIDE.md](./BACKEND_INTEGRATION_GUIDE.md) - Backend guide

---

**For questions:** Check the comprehensive documentation (264 KB)

*Last Updated: 2025-10-10*
