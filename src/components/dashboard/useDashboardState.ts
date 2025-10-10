import { useState, useCallback } from "react";
import { View } from "../../types";

/**
 * Custom hook to manage dashboard-specific state
 */
export function useDashboardState() {
  // Selected view state
  const [selectedView, setSelectedView] = useState<View | null>(null);

  // Section visibility states
  const [reportsVisible, setReportsVisible] = useState(true);
  const [widgetsVisible, setWidgetsVisible] = useState(true);

  // Navigation state - dock level collapse
  const [isDockCollapsed, setIsDockCollapsed] = useState(false);

  // Layout mode state - horizontal or vertical
  const [layoutMode, setLayoutMode] = useState<"horizontal" | "vertical">("horizontal");

  // Navigation panel position state
  const [navPanelPosition, setNavPanelPosition] = useState<"left" | "right">("left");

  // Navigation panel orientation state
  const [navPanelOrientation, setNavPanelOrientation] = useState<"vertical" | "horizontal">("vertical");

  // Force re-render trigger for NavigationPanel
  const [navigationUpdateTrigger, setNavigationUpdateTrigger] = useState(0);

  // Track layout structure
  const [layoutStructure, setLayoutStructure] = useState<string>("");

  // Helper to trigger navigation update
  const triggerNavigationUpdate = useCallback(() => {
    setNavigationUpdateTrigger((prev) => prev + 1);
  }, []);

  // Helper to toggle layout mode
  const toggleLayoutMode = useCallback(() => {
    setLayoutMode((prev) => (prev === "horizontal" ? "vertical" : "horizontal"));
  }, []);

  // Helper to toggle dock collapse
  const toggleDockCollapse = useCallback(() => {
    setIsDockCollapsed((prev) => !prev);
  }, []);

  // Helper to toggle reports visibility
  const toggleReportsVisibility = useCallback(() => {
    setReportsVisible((prev) => !prev);
  }, []);

  // Helper to toggle widgets visibility
  const toggleWidgetsVisibility = useCallback(() => {
    setWidgetsVisible((prev) => !prev);
  }, []);

  return {
    // State
    selectedView,
    reportsVisible,
    widgetsVisible,
    isDockCollapsed,
    layoutMode,
    navPanelPosition,
    navPanelOrientation,
    navigationUpdateTrigger,
    layoutStructure,

    // Setters
    setSelectedView,
    setReportsVisible,
    setWidgetsVisible,
    setIsDockCollapsed,
    setLayoutMode,
    setNavPanelPosition,
    setNavPanelOrientation,
    setNavigationUpdateTrigger,
    setLayoutStructure,

    // Helpers
    triggerNavigationUpdate,
    toggleLayoutMode,
    toggleDockCollapse,
    toggleReportsVisibility,
    toggleWidgetsVisibility,
  };
}
