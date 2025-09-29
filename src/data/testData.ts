import { User, Report, Widget, View, ViewGroup, UserNavigationSettings, UserNavigationData } from '../types';

// Test Users
export const testUsers: User[] = [
  { 
    name: 'admin', 
    username: 'admin',
    password: 'admin123',
    role: 'admin' 
  },
  { 
    name: 'user', 
    username: 'user',
    password: 'user123',
    role: 'user' 
  },
  { 
    name: 'viewer', 
    username: 'viewer',
    password: 'viewer123',
    role: 'viewer' 
  }
];

// Test Reports
export const testReports: Report[] = [
  {
    id: 'report-1',
    name: 'Sales Dashboard',
    url: 'https://example.com/sales-dashboard',
    type: 'Report',
    userRoles: ['admin', 'user', 'viewer']
  },
  {
    id: 'report-2',
    name: 'Financial Report',
    url: 'https://example.com/financial-report',
    type: 'Report',
    userRoles: ['admin', 'user']
  },
  {
    id: 'report-3',
    name: 'Customer Analytics',
    url: 'https://example.com/customer-analytics',
    type: 'Report',
    userRoles: ['admin', 'user', 'viewer']
  },
  {
    id: 'report-4',
    name: 'Executive Summary',
    url: 'https://example.com/executive-summary',
    type: 'Report',
    userRoles: ['admin']
  },
  {
    id: 'report-5',
    name: 'Marketing Metrics',
    url: 'https://example.com/marketing-metrics',
    type: 'Report',
    userRoles: ['admin', 'user']
  },
  {
    id: 'report-6',
    name: 'Operations Overview',
    url: 'https://example.com/operations-overview',
    type: 'Report',
    userRoles: ['admin', 'user', 'viewer']
  },
  {
    id: 'report-7',
    name: 'Inventory Management',
    url: 'https://example.com/inventory-management',
    type: 'Report',
    userRoles: ['admin', 'user']
  },
  {
    id: 'report-8',
    name: 'HR Analytics',
    url: 'https://example.com/hr-analytics',
    type: 'Report',
    userRoles: ['admin']
  }
];

// Test Widgets
export const testWidgets: Widget[] = [
  {
    id: 'widget-1',
    name: 'Revenue Chart',
    url: 'https://example.com/revenue-widget',
    type: 'Widget',
    userRoles: ['admin', 'user', 'viewer']
  },
  {
    id: 'widget-2',
    name: 'User Growth',
    url: 'https://example.com/user-growth-widget',
    type: 'Widget',
    userRoles: ['admin', 'user']
  },
  {
    id: 'widget-3',
    name: 'Performance KPIs',
    url: 'https://example.com/kpi-widget',
    type: 'Widget',
    userRoles: ['admin', 'user', 'viewer']
  },
  {
    id: 'widget-4',
    name: 'Financial Summary',
    url: 'https://example.com/financial-widget',
    type: 'Widget',
    userRoles: ['admin']
  },
  {
    id: 'widget-5',
    name: 'Team Productivity',
    url: 'https://example.com/productivity-widget',
    type: 'Widget',
    userRoles: ['admin', 'user']
  },
  {
    id: 'widget-6',
    name: 'Customer Satisfaction',
    url: 'https://example.com/satisfaction-widget',
    type: 'Widget',
    userRoles: ['admin', 'user', 'viewer']
  },
  {
    id: 'widget-7',
    name: 'Conversion Rates',
    url: 'https://example.com/conversion-widget',
    type: 'Widget',
    userRoles: ['admin', 'user']
  },
  {
    id: 'widget-8',
    name: 'Real-time Alerts',
    url: 'https://example.com/alerts-widget',
    type: 'Widget',
    userRoles: ['admin']
  }
];

// User-specific Navigation Test Data
export const userNavigationTestData: UserNavigationData[] = [
  // Admin User Navigation
  {
    userId: 'admin',
    viewGroups: [
      {
        id: 'admin-viewgroup-default',
        name: 'Default',
        viewIds: ['admin-view-1', 'admin-view-2'],
        isVisible: true,
        order: 1,
        isDefault: true,
        createdBy: 'admin'
      },
      {
        id: 'admin-viewgroup-1',
        name: 'Executive Dashboard',
        viewIds: ['admin-view-3', 'admin-view-4'],
        isVisible: true,
        order: 2,
        isDefault: false,
        createdBy: 'admin'
      },
      {
        id: 'admin-viewgroup-2',
        name: 'Analytics Hub',
        viewIds: ['admin-view-5', 'admin-view-6'],
        isVisible: true,
        order: 3,
        isDefault: false,
        createdBy: 'admin'
      },
      {
        id: 'admin-viewgroup-3',
        name: 'Operations Center',
        viewIds: ['admin-view-7', 'admin-view-8'],
        isVisible: true,
        order: 4,
        isDefault: false,
        createdBy: 'admin'
      }
    ],
    views: [
      {
        id: 'admin-view-1',
        name: 'Sales Overview',
        reportIds: ['report-1', 'report-2'],
        widgetIds: ['widget-1', 'widget-2'],
        isVisible: true,
        order: 1,
        createdBy: 'admin'
      },
      {
        id: 'admin-view-2',
        name: 'Quick Stats',
        reportIds: ['report-3'],
        widgetIds: ['widget-3'],
        isVisible: true,
        order: 2,
        createdBy: 'admin'
      },
      {
        id: 'admin-view-3',
        name: 'Executive Metrics',
        reportIds: ['report-4', 'report-1'],
        widgetIds: ['widget-4', 'widget-1'],
        isVisible: true,
        order: 1,
        createdBy: 'admin'
      },
      {
        id: 'admin-view-4',
        name: 'Financial Dashboard',
        reportIds: ['report-2', 'report-4'],
        widgetIds: ['widget-4', 'widget-2'],
        isVisible: true,
        order: 2,
        createdBy: 'admin'
      },
      {
        id: 'admin-view-5',
        name: 'Customer Insights',
        reportIds: ['report-3'],
        widgetIds: ['widget-6', 'widget-3'],
        isVisible: true,
        order: 1,
        createdBy: 'admin'
      },
      {
        id: 'admin-view-6',
        name: 'Marketing Analytics',
        reportIds: ['report-5'],
        widgetIds: ['widget-2', 'widget-5', 'widget-7'],
        isVisible: true,
        order: 2,
        createdBy: 'admin'
      },
      {
        id: 'admin-view-7',
        name: 'Operations Monitor',
        reportIds: ['report-6', 'report-7'],
        widgetIds: ['widget-5', 'widget-3'],
        isVisible: true,
        order: 1,
        createdBy: 'admin'
      },
      {
        id: 'admin-view-8',
        name: 'System Health',
        reportIds: ['report-8'],
        widgetIds: ['widget-8', 'widget-4'],
        isVisible: true,
        order: 2,
        createdBy: 'admin'
      }
    ],
    navigationSettings: {
      userId: 'admin',
      viewGroupOrder: ['admin-viewgroup-default', 'admin-viewgroup-1', 'admin-viewgroup-2', 'admin-viewgroup-3'],
      viewOrders: {
        'admin-viewgroup-default': ['admin-view-1', 'admin-view-2'],
        'admin-viewgroup-1': ['admin-view-3', 'admin-view-4'],
        'admin-viewgroup-2': ['admin-view-5', 'admin-view-6'],
        'admin-viewgroup-3': ['admin-view-7', 'admin-view-8']
      },
      hiddenViewGroups: [],
      hiddenViews: []
    }
  },

  // Regular User Navigation
  {
    userId: 'user',
    viewGroups: [
      {
        id: 'user-viewgroup-default',
        name: 'Default',
        viewIds: ['user-view-1', 'user-view-2'],
        isVisible: true,
        order: 1,
        isDefault: true,
        createdBy: 'user'
      },
      {
        id: 'user-viewgroup-1',
        name: 'My Reports',
        viewIds: ['user-view-3', 'user-view-4'],
        isVisible: true,
        order: 2,
        isDefault: false,
        createdBy: 'user'
      },
      {
        id: 'user-viewgroup-2',
        name: 'Team Dashboard',
        viewIds: ['user-view-5'],
        isVisible: true,
        order: 3,
        isDefault: false,
        createdBy: 'user'
      },
      {
        id: 'user-viewgroup-3',
        name: 'Performance Tracking',
        viewIds: ['user-view-6'],
        isVisible: true,
        order: 4,
        isDefault: false,
        createdBy: 'user'
      }
    ],
    views: [
      {
        id: 'user-view-1',
        name: 'Daily Reports',
        reportIds: ['report-1', 'report-3'],
        widgetIds: ['widget-1', 'widget-3'],
        isVisible: true,
        order: 1,
        createdBy: 'user'
      },
      {
        id: 'user-view-2',
        name: 'Weekly Summary',
        reportIds: ['report-2'],
        widgetIds: ['widget-2'],
        isVisible: true,
        order: 2,
        createdBy: 'user'
      },
      {
        id: 'user-view-3',
        name: 'Personal Dashboard',
        reportIds: ['report-1', 'report-2'],
        widgetIds: ['widget-1', 'widget-2'],
        isVisible: true,
        order: 1,
        createdBy: 'user'
      },
      {
        id: 'user-view-4',
        name: 'Sales Analytics',
        reportIds: ['report-1', 'report-5'],
        widgetIds: ['widget-1', 'widget-5'],
        isVisible: true,
        order: 2,
        createdBy: 'user'
      },
      {
        id: 'user-view-5',
        name: 'Team Performance',
        reportIds: ['report-6'],
        widgetIds: ['widget-5', 'widget-3'],
        isVisible: true,
        order: 1,
        createdBy: 'user'
      },
      {
        id: 'user-view-6',
        name: 'Customer Metrics',
        reportIds: ['report-3'],
        widgetIds: ['widget-6', 'widget-7'],
        isVisible: true,
        order: 1,
        createdBy: 'user'
      }
    ],
    navigationSettings: {
      userId: 'user',
      viewGroupOrder: ['user-viewgroup-default', 'user-viewgroup-1', 'user-viewgroup-2', 'user-viewgroup-3'],
      viewOrders: {
        'user-viewgroup-default': ['user-view-1', 'user-view-2'],
        'user-viewgroup-1': ['user-view-3', 'user-view-4'],
        'user-viewgroup-2': ['user-view-5'],
        'user-viewgroup-3': ['user-view-6']
      },
      hiddenViewGroups: [],
      hiddenViews: []
    }
  },

  // Viewer User Navigation
  {
    userId: 'viewer',
    viewGroups: [
      {
        id: 'viewer-viewgroup-default',
        name: 'Default',
        viewIds: ['viewer-view-1', 'viewer-view-2'],
        isVisible: true,
        order: 1,
        isDefault: true,
        createdBy: 'viewer'
      },
      {
        id: 'viewer-viewgroup-1',
        name: 'My Views',
        viewIds: ['viewer-view-3'],
        isVisible: true,
        order: 2,
        isDefault: false,
        createdBy: 'viewer'
      },
      {
        id: 'viewer-viewgroup-2',
        name: 'Summary Reports',
        viewIds: ['viewer-view-4'],
        isVisible: true,
        order: 3,
        isDefault: false,
        createdBy: 'viewer'
      }
    ],
    views: [
      {
        id: 'viewer-view-1',
        name: 'Basic Reports',
        reportIds: ['report-1', 'report-3'],
        widgetIds: ['widget-1', 'widget-3'],
        isVisible: true,
        order: 1,
        createdBy: 'viewer'
      },
      {
        id: 'viewer-view-2',
        name: 'Overview Dashboard',
        reportIds: ['report-6'],
        widgetIds: ['widget-6'],
        isVisible: true,
        order: 2,
        createdBy: 'viewer'
      },
      {
        id: 'viewer-view-3',
        name: 'Quick View',
        reportIds: ['report-1'],
        widgetIds: ['widget-1'],
        isVisible: true,
        order: 1,
        createdBy: 'viewer'
      },
      {
        id: 'viewer-view-4',
        name: 'Summary Statistics',
        reportIds: ['report-3', 'report-6'],
        widgetIds: ['widget-3', 'widget-6'],
        isVisible: true,
        order: 1,
        createdBy: 'viewer'
      }
    ],
    navigationSettings: {
      userId: 'viewer',
      viewGroupOrder: ['viewer-viewgroup-default', 'viewer-viewgroup-1', 'viewer-viewgroup-2'],
      viewOrders: {
        'viewer-viewgroup-default': ['viewer-view-1', 'viewer-view-2'],
        'viewer-viewgroup-1': ['viewer-view-3'],
        'viewer-viewgroup-2': ['viewer-view-4']
      },
      hiddenViewGroups: [],
      hiddenViews: []
    }
  }
];

// Legacy navigation data (for backward compatibility)
export const testViews: View[] = [
  {
    id: 'view-1',
    name: 'Sales Dashboard',
    reportIds: ['report-1', 'report-2'],
    widgetIds: ['widget-1'],
    isVisible: true,
    order: 1,
    createdBy: 'admin'
  },
  {
    id: 'view-2',
    name: 'Analytics Overview',
    reportIds: ['report-3'],
    widgetIds: ['widget-2', 'widget-3'],
    isVisible: true,
    order: 2,
    createdBy: 'admin'
  },
  {
    id: 'view-3',
    name: 'Financial Reports',
    reportIds: ['report-4'],
    widgetIds: ['widget-4'],
    isVisible: true,
    order: 3,
    createdBy: 'admin'
  },
  {
    id: 'view-4',
    name: 'User Custom View',
    reportIds: ['report-1'],
    widgetIds: ['widget-1', 'widget-2'],
    isVisible: true,
    order: 4,
    createdBy: 'user'
  }
];

export const testViewGroups: ViewGroup[] = [
  {
    id: 'viewgroup-default',
    name: 'Default',
    viewIds: ['view-1', 'view-2'],
    isVisible: true,
    order: 1,
    isDefault: true,
    createdBy: 'system'
  },
  {
    id: 'viewgroup-1',
    name: 'Executive Dashboard',
    viewIds: ['view-3'],
    isVisible: true,
    order: 2,
    isDefault: false,
    createdBy: 'admin'
  },
  {
    id: 'viewgroup-2',
    name: 'Operations',
    viewIds: ['view-2', 'view-4'],
    isVisible: true,
    order: 3,
    isDefault: false,
    createdBy: 'admin'
  }
];

export const testUserNavigationSettings: UserNavigationSettings[] = [
  {
    userId: 'admin',
    viewGroupOrder: ['viewgroup-default', 'viewgroup-1', 'viewgroup-2'],
    viewOrders: {
      'viewgroup-default': ['view-1', 'view-2'],
      'viewgroup-1': ['view-3'],
      'viewgroup-2': ['view-2', 'view-4']
    },
    hiddenViewGroups: [],
    hiddenViews: []
  },
  {
    userId: 'user',
    viewGroupOrder: ['viewgroup-default', 'viewgroup-2'],
    viewOrders: {
      'viewgroup-default': ['view-1', 'view-2'],
      'viewgroup-2': ['view-4', 'view-2']
    },
    hiddenViewGroups: [],
    hiddenViews: []
  },
  {
    userId: 'viewer',
    viewGroupOrder: ['viewgroup-default'],
    viewOrders: {
      'viewgroup-default': ['view-1', 'view-2']
    },
    hiddenViewGroups: [],
    hiddenViews: []
  }
];

// Helper functions
export const getUserNavigationData = (userId: string): UserNavigationData | null => {
  return userNavigationTestData.find(data => data.userId === userId) || null;
};

export const initializeUserNavigationData = (userId: string): UserNavigationData => {
  const existingData = getUserNavigationData(userId);
  if (existingData) {
    return existingData;
  }

  // Create default navigation data for new user
  const defaultViewGroupId = `${userId}-viewgroup-default`;
  const defaultViewId = `${userId}-view-default`;

  return {
    userId,
    viewGroups: [
      {
        id: defaultViewGroupId,
        name: 'Default',
        viewIds: [defaultViewId],
        isVisible: true,
        order: 1,
        isDefault: true,
        createdBy: userId
      }
    ],
    views: [
      {
        id: defaultViewId,
        name: 'My Dashboard',
        reportIds: [],
        widgetIds: [],
        isVisible: true,
        order: 1,
        createdBy: userId
      }
    ],
    navigationSettings: {
      userId,
      viewGroupOrder: [defaultViewGroupId],
      viewOrders: {
        [defaultViewGroupId]: [defaultViewId]
      },
      hiddenViewGroups: [],
      hiddenViews: []
    }
  };
};

// Get user-specific reports based on role
export const getUserReports = (userRole: string): Report[] => {
  return testReports.filter(report => report.userRoles.includes(userRole));
};

// Get user-specific widgets based on role
export const getUserWidgets = (userRole: string): Widget[] => {
  return testWidgets.filter(widget => widget.userRoles.includes(userRole));
};

// Get all available roles
export const getAllRoles = (): string[] => {
  return ['admin', 'user', 'viewer'];
};

// Search functions
export const searchReports = (query: string, userRole?: string): Report[] => {
  let reports = userRole ? getUserReports(userRole) : testReports;
  if (!query.trim()) return reports;
  
  return reports.filter(report => 
    report.name.toLowerCase().includes(query.toLowerCase()) ||
    report.url.toLowerCase().includes(query.toLowerCase())
  );
};

export const searchWidgets = (query: string, userRole?: string): Widget[] => {
  let widgets = userRole ? getUserWidgets(userRole) : testWidgets;
  if (!query.trim()) return widgets;
  
  return widgets.filter(widget => 
    widget.name.toLowerCase().includes(query.toLowerCase()) ||
    widget.url.toLowerCase().includes(query.toLowerCase())
  );
};

// Statistics functions
export const getReportStats = () => ({
  total: testReports.length,
  adminOnly: testReports.filter(r => r.userRoles.length === 1 && r.userRoles[0] === 'admin').length,
  public: testReports.filter(r => r.userRoles.includes('viewer')).length,
  restricted: testReports.filter(r => !r.userRoles.includes('viewer')).length
});

export const getWidgetStats = () => ({
  total: testWidgets.length,
  adminOnly: testWidgets.filter(w => w.userRoles.length === 1 && w.userRoles[0] === 'admin').length,
  public: testWidgets.filter(w => w.userRoles.includes('viewer')).length,
  restricted: testWidgets.filter(w => !w.userRoles.includes('viewer')).length
});

export const getNavigationStats = () => {
  const totalViews = userNavigationTestData.reduce((sum, userData) => sum + userData.views.length, 0);
  const totalViewGroups = userNavigationTestData.reduce((sum, userData) => sum + userData.viewGroups.length, 0);
  
  return {
    totalUsers: userNavigationTestData.length,
    totalViews,
    totalViewGroups,
    avgViewsPerUser: Math.round(totalViews / userNavigationTestData.length),
    avgViewGroupsPerUser: Math.round(totalViewGroups / userNavigationTestData.length)
  };
};

// Validation functions
export const validateReport = (report: Partial<Report>): string[] => {
  const errors: string[] = [];
  
  if (!report.name?.trim()) {
    errors.push('Report name is required');
  }
  
  if (!report.url?.trim()) {
    errors.push('Report URL is required');
  } else if (!isValidUrl(report.url)) {
    errors.push('Report URL must be a valid URL');
  }
  
  if (!report.userRoles?.length) {
    errors.push('At least one user role must be selected');
  }
  
  return errors;
};

export const validateWidget = (widget: Partial<Widget>): string[] => {
  const errors: string[] = [];
  
  if (!widget.name?.trim()) {
    errors.push('Widget name is required');
  }
  
  if (!widget.url?.trim()) {
    errors.push('Widget URL is required');
  } else if (!isValidUrl(widget.url)) {
    errors.push('Widget URL must be a valid URL');
  }
  
  if (!widget.userRoles?.length) {
    errors.push('At least one user role must be selected');
  }
  
  return errors;
};

export const validateView = (view: Partial<View>): string[] => {
  const errors: string[] = [];
  
  if (!view.name?.trim()) {
    errors.push('View name is required');
  }
  
  if (!view.reportIds?.length && !view.widgetIds?.length) {
    errors.push('At least one report or widget must be selected');
  }
  
  return errors;
};

export const validateViewGroup = (viewGroup: Partial<ViewGroup>): string[] => {
  const errors: string[] = [];
  
  if (!viewGroup.name?.trim()) {
    errors.push('View group name is required');
  }
  
  return errors;
};

// Utility functions
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const generateId = (prefix: string): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 5);
  return `${prefix}-${timestamp}-${random}`;
};

export const formatDate = (date: Date): string => {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Get views for a specific view group and user
export const getViewsForGroup = (userId: string, viewGroupId: string): View[] => {
  const userData = getUserNavigationData(userId);
  if (!userData) return [];

  const viewGroup = userData.viewGroups.find(vg => vg.id === viewGroupId);
  if (!viewGroup) return [];

  return viewGroup.viewIds
    .map(viewId => userData.views.find(v => v.id === viewId))
    .filter(Boolean) as View[];
};

// Get ordered view groups for a user
export const getOrderedViewGroups = (userId: string): ViewGroup[] => {
  const userData = getUserNavigationData(userId);
  if (!userData) return [];

  return userData.viewGroups.sort((a, b) => (a.order || 0) - (b.order || 0));
};

// Get ordered views for a specific view group
export const getOrderedViews = (userId: string, viewGroupId: string): View[] => {
  const views = getViewsForGroup(userId, viewGroupId);
  return views.sort((a, b) => (a.order || 0) - (b.order || 0));
};

// Export default test data
export default {
  users: testUsers,
  reports: testReports,
  widgets: testWidgets,
  views: testViews,
  viewGroups: testViewGroups,
  userNavigationSettings: testUserNavigationSettings,
  userNavigationTestData
};
