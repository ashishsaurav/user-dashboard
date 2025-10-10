# ⚡ Quick Reference Guide

**For:** Developers who need quick answers  
**Updated:** 2025-10-10

---

## 🚀 Quick Start

### Install & Run
```bash
npm install
npm start
```

### Login Credentials
- Admin: `admin` / `admin123`
- User: `user` / `user123`
- Viewer: `viewer` / `viewer123`

---

## 📁 Where Is Everything?

```
src/components/
├── auth/         - Login, authentication
├── dashboard/    - Main dashboard, layout
├── modals/       - All modals (10 total)
├── forms/        - Create forms (3 total)
├── features/     - Complex features (3 total)
├── common/       - Common utilities (4 total)
├── navigation/   - Navigation components
├── panels/       - Panel components
├── content/      - Content display
├── shared/       - Shared components
└── ui/           - UI primitives

src/hooks/
├── api/          - Data fetching hooks
└── ...           - Other hooks (17+ total)

src/services/
├── api/          - API client & repositories
└── ...           - Other services

src/utils/
├── formValidators.ts  - 10+ validators
├── arrayHelpers.ts    - 17 array functions
├── layoutUtils.ts     - 8 layout functions
└── ...                - Other utilities
```

---

## 💡 Common Tasks

### Import Components
```typescript
// From category
import { CreateView } from './components/forms';
import { AllReportsWidgets } from './components/features';

// From main index
import { CreateView, AllReportsWidgets } from './components';
```

### Create Modal
```typescript
import { ConfirmDialog } from './components';

<ConfirmDialog
  isOpen={true}
  type="danger"
  title="Delete?"
  message="Are you sure?"
  onConfirm={handleDelete}
  onCancel={handleCancel}
/>
```

### Create Form
```typescript
import { useForm } from './hooks';
import { validators } from './utils';
import { FormField } from './components';

const { values, errors, setValue, handleSubmit } = useForm({
  initialValues: { name: '' },
  validations: { name: validators.required("Name") },
  onSubmit: saveData,
});
```

### Fetch Data
```typescript
import { useReports } from './hooks/api';

const { data, isLoading, error } = useReports();
```

### Manage Modals
```typescript
import { useModalState } from './hooks';

const { isOpen, openModal, closeModal } = useModalState({
  settings: false,
});
```

### Array Operations
```typescript
import { updateById, sortBy } from './utils/arrayHelpers';

const updated = updateById(items, 'id-1', { name: 'New' });
const sorted = sortBy(items, 'order', 'asc');
```

---

## 📖 Documentation

**Main:** [START_HERE.md](./START_HERE.md)  
**Complete:** [FINAL_ARCHITECTURE_SUMMARY.md](./FINAL_ARCHITECTURE_SUMMARY.md)  
**Backend:** [BACKEND_INTEGRATION_GUIDE.md](./BACKEND_INTEGRATION_GUIDE.md)  
**All Docs:** [DOCUMENTATION_INDEX.md](./DOCUMENTATION_INDEX.md)

---

**For detailed info, see comprehensive documentation (264 KB total)**
