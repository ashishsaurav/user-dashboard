// Authentication Components
export { default as Login } from "./auth/Login";

// Dashboard Components
export { default as DashboardDock } from "./dashboard/DashboardDock";
export { default as WelcomeContent } from "./dashboard/WelcomeContent";
export { default as ThemeToggle } from "./dashboard/ThemeToggle";

// Navigation Components
export { default as NavigationPanel } from "./navigation/NavigationPanel";
export { default as GmailNavigationPanel } from "./navigation/GmailNavigationPanel";
export { default as CollapsedNavigationPanel } from "./navigation/CollapsedNavigationPanel";
export { default as NavigationHeader } from "./navigation/NavigationHeader";
export { default as NavigationViewItem } from "./navigation/NavigationViewItem";
export { default as ViewGroupHoverPopup } from "./navigation/ViewGroupHoverPopup";

// Panel Components
export { default as ViewContentPanel } from "./panels/ViewContentPanel";

// Modal Components
export { default as ManageModal } from "./modals/ManageModal";
export { default as NavigationManageModal } from "./modals/NavigationManageModal";
export { default as AddReportModal } from "./modals/AddReportModal";
export { default as AddWidgetModal } from "./modals/AddWidgetModal";

// Content Components
export { default as EmptyState } from "./content/EmptyState";
export { default as ReportTabItem } from "./content/ReportTabItem";
export { default as WidgetCard } from "./content/WidgetCard";

// Shared Components
export { AddItemModal } from "./shared/AddItemModal";

// UI Components
export * from "./ui";

// Notification Components
export { default as NotificationProvider } from "./NotificationProvider";
export { default as SuccessNotification } from "./SuccessNotification";

// Hooks
export { useDragAndDropList } from "./shared/useDragAndDropList";
export { useGmailNavigation } from "./navigation/useGmailNavigation";

// Legacy exports (for backward compatibility)
export { default as AllReportsWidgets } from "./AllReportsWidgets";
export { default as AllViewGroupsViews } from "./AllViewGroupsViews";
export { default as CreateView } from "./CreateView";
export { default as CreateViewGroup } from "./CreateViewGroup";
export { default as UserRolePermissions } from "./UserRolePermissions";
export { default as EditViewModal } from "./EditViewModal";
export { default as EditViewGroupModal } from "./EditViewGroupModal";
export { default as EditReportModal } from "./EditReportModal";
export { default as EditWidgetModal } from "./EditWidgetModal";
export { default as DeleteConfirmationModal } from "./DeleteConfirmationModal";
export { default as DeleteConfirmModal } from "./DeleteConfirmModal";
export { default as AddReportWidget } from "./AddReportWidget";