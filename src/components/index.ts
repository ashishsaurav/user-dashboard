/**
 * Component Exports - Organized by Category
 */

// UI Components (Primitives)
export * from "./ui";

// Navigation Components
export { default as NavigationPanel } from "./navigation/NavigationPanel";
export { default as CollapsedNavigationPanel } from "./navigation/CollapsedNavigationPanel";
export { default as GmailNavigationPanel } from "./navigation/GmailNavigationPanel";
export { default as NavigationHeader } from "./navigation/NavigationHeader";
export { default as NavigationViewItem } from "./navigation/NavigationViewItem";
export { default as ViewGroupHoverPopup } from "./navigation/ViewGroupHoverPopup";

// Dashboard Components
export { default as DashboardDock } from "./dashboard/DashboardDock";
export { default as ThemeToggle } from "./dashboard/ThemeToggle";
export { default as WelcomeContent } from "./dashboard/WelcomeContent";
export { default as LayoutResetButton } from "./dashboard/LayoutResetButton";

// Modal Components
export * from "./modals";

// Form Components
export * from "./forms";

// Feature Components (Complex Features)
export * from "./features";

// Common Components (Shared UI)
export * from "./common";

// Auth Components
export { default as Login } from "./auth/Login";

// Panel Components
export { default as ViewContentPanel } from "./panels/ViewContentPanel";

// Content Components
export { default as EmptyState } from "./content/EmptyState";
export { default as ReportTabItem } from "./content/ReportTabItem";
export { default as WidgetCard } from "./content/WidgetCard";

// Shared Components
export { AddItemModal } from "./shared/AddItemModal";
export { EditItemModal } from "./shared/EditItemModal";
export * from "./shared/FormField";
