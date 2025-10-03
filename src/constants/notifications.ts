export const NOTIFICATION_TYPES = {
  SUCCESS: "success",
  ERROR: "error",
  WARNING: "warning",
  INFO: "info",
} as const;

export type NotificationType =
  (typeof NOTIFICATION_TYPES)[keyof typeof NOTIFICATION_TYPES];

export const NOTIFICATION_DURATIONS = {
  SHORT: 2000,
  NORMAL: 3000,
  LONG: 5000,
} as const;

export const NOTIFICATION_MESSAGES = {
  VIEW_CREATED: "View created successfully",
  VIEW_UPDATED: "View updated successfully",
  VIEW_DELETED: "View deleted successfully",
  VIEW_GROUP_CREATED: "View group created successfully",
  VIEW_GROUP_UPDATED: "View group updated successfully",
  VIEW_GROUP_DELETED: "View group deleted successfully",
  REPORT_ADDED: "Report added successfully",
  REPORT_UPDATED: "Report updated successfully",
  REPORT_DELETED: "Report deleted successfully",
  WIDGET_ADDED: "Widget added successfully",
  WIDGET_UPDATED: "Widget updated successfully",
  WIDGET_DELETED: "Widget deleted successfully",
  SETTINGS_SAVED: "Settings saved successfully",
  GENERIC_ERROR: "An error occurred",
  UNAUTHORIZED: "You don't have permission to perform this action",
} as const;
