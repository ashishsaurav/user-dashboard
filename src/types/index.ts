// User and Authentication Types
export interface User {
  name: string;
  username: string;  // Add this
  password: string;  // Add this
  role: 'admin' | 'user' | 'viewer';
}

export interface LoginFormData {
  username: string;
  password: string;
}

// Report and Widget Types
export interface Report {
  id: string;
  name: string;
  url: string;
  type: 'Report';
  userRoles: string[];
  workspaceId?: string; // PowerBI workspace ID
  reportId?: string; // PowerBI report ID
}

export interface Widget {
  id: string;
  name: string;
  url: string;
  type: 'Widget';
  userRoles: string[];
  workspaceId?: string; // PowerBI workspace ID
  reportId?: string; // PowerBI report ID
  pageName?: string; // PowerBI page name
  visualName?: string; // PowerBI visual name
}

// Form Data Types
export interface ReportFormData {
  name: string;
  url: string;
  userRoles: string[];
  workspaceId?: string;
  reportId?: string;
}

export interface WidgetFormData {
  name: string;
  url: string;
  userRoles: string[];
  workspaceId?: string;
  reportId?: string;
  pageName?: string;
  visualName?: string;
}

// Navigation Types - Updated for user-specific navigation
export interface View {
  id: string;
  name: string;
  reportIds: string[];
  widgetIds: string[];
  isVisible: boolean;
  order: number;
  createdBy: string;
}

export interface ViewGroup {
  id: string;
  name: string;
  viewIds: string[];
  isVisible: boolean;
  order: number;
  isDefault: boolean;
  createdBy: string;
}

export interface UserNavigationSettings {
  userId: string;
  viewGroupOrder: string[];
  viewOrders: { [viewGroupId: string]: string[] };
  hiddenViewGroups: string[];
  hiddenViews: string[];
  expandedViewGroups?: string[]; // NEW: Track which view groups are expanded
  isNavigationCollapsed?: boolean; // NEW: Track if navigation panel itself is collapsed
}

// User-specific Navigation Data
export interface UserNavigationData {
  userId: string;
  viewGroups: ViewGroup[];
  views: View[];
  navigationSettings: UserNavigationSettings;
}

// Form Data Types for Navigation
export interface ViewFormData {
  name: string;
  reportIds: string[];
  widgetIds: string[];
}

export interface ViewGroupFormData {
  name: string;
  viewIds: string[];
}

// Theme Types
export interface ThemeContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

// Component Props Types
export interface LoginProps {
  onLogin: (user: User) => void;
}

export interface DashboardProps {
  user: User;
  onLogout: () => void;
}

// Modal and Form Types
export interface ManageModalProps {
  onClose: () => void;
}

export interface NavigationManageModalProps {
  user: User;
  onClose: () => void;
}

// Notification Types
export interface NotificationData {
  id: string;
  message: string;
  subMessage?: string;
  type: 'success' | 'info' | 'warning' | 'error';
  duration?: number;
}

export interface NotificationContextType {
  showNotification: (
    message: string, 
    subMessage?: string, 
    type?: 'success' | 'info' | 'warning' | 'error',
    duration?: number
  ) => void;
  showSuccess: (message: string, subMessage?: string) => void;
  showError: (message: string, subMessage?: string) => void;
  showWarning: (message: string, subMessage?: string) => void;
  showInfo: (message: string, subMessage?: string) => void;
}

// Extended View type for creation with multiple view groups
export interface ViewWithGroups extends View {
  viewGroupIds?: string[];
}

// Filter and Search Types
export interface FilterOptions {
  role?: string;
  type?: 'Report' | 'Widget';
  searchTerm?: string;
}

// Permission Types
export interface Permission {
  id: string;
  resourceId: string;
  resourceType: 'Report' | 'Widget' | 'View' | 'ViewGroup';
  userRoles: string[];
  canEdit: boolean;
  canDelete: boolean;
  canView: boolean;
}

// Action Types for State Management
export interface Action {
  type: string;
  payload?: any;
}

// Error Types
export interface ErrorInfo {
  message: string;
  code?: string;
  details?: any;
}

// Loading States
export interface LoadingState {
  isLoading: boolean;
  operation?: string;
  progress?: number;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ErrorInfo;
  message?: string;
}

// Session Storage Keys
export type StorageKey = 
  | 'reports' 
  | 'widgets' 
  | 'navigationViews' 
  | 'navigationViewGroups' 
  | 'navigationSettings'
  | 'currentUser'
  | 'theme';

// Drag and Drop Types
export interface DragItem {
  type: 'view' | 'viewgroup' | 'report' | 'widget';
  id: string;
  index?: number;
}

export interface DropResult {
  draggedId: string;
  targetId: string;
  position: 'before' | 'after' | 'inside';
}

// Chart and Analytics Types (for future use) - FIXED
export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    '':number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
  }[];
}

export interface AnalyticsData {
  totalReports: number;
  totalWidgets: number;
  totalViews: number;
  totalViewGroups: number;
  userActivity: {
    userId: string;
    lastActive: string;
    actionsCount: number;
  }[];
}

// Tab Types for Navigation Modal
export type NavTabType = 'all' | 'createGroup' | 'createView';

// Modal Types
export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children?: React.ReactNode;
}

// Form Validation Types
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

// Event Handler Types
export type EventHandler<T = any> = (event: T) => void;
export type ChangeHandler = (value: string) => void;
export type SubmitHandler = (event: React.FormEvent) => void;
export type ClickHandler = (event: React.MouseEvent) => void;

// Data Table Types - FIXED
export interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

export interface TableProps {
  columns: TableColumn[];
  '': any[];
  loading?: boolean;
  emptyMessage?: string;
  onSort?: (key: string, direction: 'asc' | 'desc') => void;
}

// Search and Filter Types
export interface SearchOptions {
  query: string;
  filters: Record<string, any>;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Pagination Types
export interface PaginationState {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// Theme Configuration Types
export interface ThemeConfig {
  colors: {
    primary: string;
    secondary: string;
    success: string;
    warning: string;
    danger: string;
    info: string;
    background: string;
    surface: string;
    text: string;
  };
  fonts: {
    family: string;
    sizes: Record<string, string>;
  };
  spacing: Record<string, string>;
  breakpoints: Record<string, string>;
}

// Component State Types - FIXED
export interface ComponentState {
  loading: boolean;
  error: string | null;
'':any;
}

// Route Types
export interface RouteConfig {
  path: string;
  component: React.ComponentType;
  exact?: boolean;
  protected?: boolean;
  roles?: string[];
}

// Export commonly used types as union types
export type ItemType = Report | Widget;
export type NavigationItem = View | ViewGroup;
export type FormData = ReportFormData | WidgetFormData | ViewFormData | ViewGroupFormData;
export type UserRole = 'admin' | 'user' | 'viewer';
export type NotificationType = 'success' | 'info' | 'warning' | 'error';
export type DragType = 'view' | 'viewgroup' | 'report' | 'widget';
