# Project Architecture

This document describes the architecture and structure of the User Dashboard application.

## Project Structure

```
src/
├── components/          # React components
│   ├── ui/             # Reusable UI components (Icons, Button, Card, Modal)
│   ├── navigation/     # Navigation-specific components
│   ├── content/        # Content display components
│   └── *.tsx           # Feature components
├── hooks/              # Custom React hooks
│   ├── useViews.ts     # View and ViewGroup state management
│   ├── useReportsWidgets.ts  # Reports/Widgets state management
│   └── useDragAndDrop.ts     # Drag and drop logic
├── services/           # Business logic and data operations
│   ├── storageService.ts     # Session storage operations
│   ├── navigationService.ts  # Navigation data operations
│   └── reportsWidgetsService.ts  # Reports/Widgets operations
├── utils/              # Utility functions
│   ├── arrayUtils.ts   # Array manipulation utilities
│   ├── validationUtils.ts    # Form validation utilities
│   ├── idGenerator.ts  # ID generation utilities
│   └── dateUtils.ts    # Date formatting utilities
├── constants/          # Application constants
│   ├── roles.ts        # User roles and permissions
│   ├── themes.ts       # Theme constants
│   ├── layout.ts       # Layout sizes and thresholds
│   └── notifications.ts      # Notification messages
├── contexts/           # React contexts
│   └── ThemeContext.tsx      # Theme management
├── types/              # TypeScript type definitions
│   └── index.ts
└── data/               # Test data and initialization
    └── testData.ts
```

## Architecture Principles

### 1. Separation of Concerns
- **Components**: Presentation logic only
- **Hooks**: Reusable stateful logic
- **Services**: Business logic and data operations
- **Utils**: Pure functions for common operations

### 2. Modularity
- Small, focused components
- Single responsibility principle
- Easy to test and maintain

### 3. Reusability
- Shared UI components in `components/ui/`
- Custom hooks for common patterns
- Utility functions for repeated operations

### 4. Type Safety
- TypeScript throughout
- Comprehensive type definitions
- Type-safe constants

## Component Organization

### UI Components (`components/ui/`)
Reusable, generic components:
- `Icons.tsx`: All SVG icons with consistent props
- `Button.tsx`: Button and IconButton components
- `Card.tsx`: Card, CardHeader, CardContent
- `Modal.tsx`: Modal wrapper with standardized behavior

### Feature Components
Domain-specific components:
- Navigation components
- Content display components
- Modal dialogs
- Management interfaces

## Custom Hooks

### `useViews`
Manages view and view group state:
```typescript
const {
  views,
  viewGroups,
  navSettings,
  updateViews,
  updateViewGroups,
  updateNavSettings
} = useViews(userId);
```

### `useReportsWidgets`
Manages reports and widgets state:
```typescript
const {
  reports,
  widgets,
  updateReports,
  updateWidgets
} = useReportsWidgets();
```

### `useDragAndDrop`
Handles drag and drop operations:
```typescript
const {
  draggedItem,
  dragOverItem,
  handleDragStart,
  handleDragEnd,
  // ...
} = useDragAndDrop();
```

## Services Layer

### Storage Service
Centralized storage operations:
```typescript
storageService.get<Type>(key, userId?)
storageService.set<Type>(key, value, userId?)
storageService.remove(key, userId?)
```

### Navigation Service
Navigation-specific operations:
```typescript
navigationService.getViews(userId)
navigationService.saveViews(userId, views)
navigationService.addView(userId, view)
navigationService.updateView(userId, view)
navigationService.deleteView(userId, viewId)
```

### Reports/Widgets Service
Reports and widgets operations:
```typescript
reportsWidgetsService.getReports()
reportsWidgetsService.saveReports(reports)
reportsWidgetsService.filterByRole(items, role)
```

## Utility Functions

### Array Utilities
- `reorderArray`: Reorder items in array
- `moveItemBetweenArrays`: Move item between two arrays
- `sortByOrder`: Sort by order property
- `filterByIds`: Filter items by ID array

### Validation Utilities
- `isValidUrl`: URL validation
- `isValidEmail`: Email validation
- `validateRequired`: Required field validation
- `validateForm`: Form validation with rules

### ID Generation
- `generateId`: Generic ID generator
- `generateViewId`: Generate view ID
- `generateReportId`: Generate report ID

### Date Utilities
- `formatDate`: Format date
- `formatDateTime`: Format date and time
- `getRelativeTime`: Get relative time string

## Constants

### Roles
- User role definitions
- Role permissions matrix
- Role labels

### Themes
- Theme constants
- Theme labels

### Layout
- Panel sizes
- Drag thresholds
- Animation durations

### Notifications
- Notification types
- Notification durations
- Standard messages

## Best Practices

1. **Component Size**: Keep components under 300 lines
2. **Single Responsibility**: Each component/function has one clear purpose
3. **Props Interface**: Always define props interface
4. **Type Safety**: Use TypeScript types everywhere
5. **No Magic Values**: Use constants for repeated values
6. **Composition**: Prefer composition over inheritance
7. **Hooks**: Extract complex logic into custom hooks
8. **Services**: Keep business logic in services
9. **Pure Functions**: Utils should be pure functions
10. **Error Handling**: Handle errors gracefully

## Testing Strategy

- **Unit Tests**: Test utilities and pure functions
- **Component Tests**: Test UI components in isolation
- **Integration Tests**: Test feature flows
- **E2E Tests**: Test critical user journeys

## Performance Considerations

1. **Memoization**: Use React.memo for expensive components
2. **useCallback**: Memoize callbacks passed to child components
3. **useMemo**: Memoize expensive calculations
4. **Code Splitting**: Lazy load routes and heavy components
5. **Virtualization**: Use for long lists

## Future Improvements

1. **State Management**: Consider Redux/Zustand for complex state
2. **API Integration**: Replace session storage with real API
3. **Real-time Updates**: Add WebSocket support
4. **Offline Support**: Add service worker
5. **Testing**: Add comprehensive test suite
6. **Documentation**: Add Storybook for components
7. **Accessibility**: Improve ARIA labels and keyboard navigation
8. **Performance**: Add performance monitoring
