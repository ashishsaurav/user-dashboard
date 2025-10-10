import { useState, useEffect, useRef, useCallback } from "react";
import { View } from "../../types";
import {
  generateLayoutSignature,
  LayoutSignature,
} from "../../services/layoutPersistenceService";

interface UseLayoutSignatureOptions {
  selectedView: View | null;
  reportsVisible: boolean;
  widgetsVisible: boolean;
  layoutMode: "horizontal" | "vertical";
  isDockCollapsed: boolean;
}

/**
 * Custom hook to manage layout signature computation and tracking
 */
export function useLayoutSignature({
  selectedView,
  reportsVisible,
  widgetsVisible,
  layoutMode,
  isDockCollapsed,
}: UseLayoutSignatureOptions) {
  const [currentSignature, setCurrentSignature] = useState<LayoutSignature>("");
  const previousSignatureRef = useRef<LayoutSignature>("");

  // Compute current signature
  const computeCurrentSignature = useCallback((): LayoutSignature => {
    const hasReports = selectedView ? selectedView.reportIds.length > 0 : false;
    const hasWidgets = selectedView ? selectedView.widgetIds.length > 0 : false;

    return generateLayoutSignature({
      selectedView: !!selectedView,
      hasReports,
      hasWidgets,
      reportsVisible,
      widgetsVisible,
      layoutMode,
      isDockCollapsed,
    });
  }, [selectedView, reportsVisible, widgetsVisible, layoutMode, isDockCollapsed]);

  // Update signature when dependencies change
  useEffect(() => {
    const newSignature = computeCurrentSignature();
    setCurrentSignature(newSignature);
  }, [computeCurrentSignature]);

  // Check if signature has changed
  const hasSignatureChanged = useCallback((): boolean => {
    return currentSignature !== previousSignatureRef.current;
  }, [currentSignature]);

  // Update previous signature
  const updatePreviousSignature = useCallback(() => {
    previousSignatureRef.current = currentSignature;
  }, [currentSignature]);

  return {
    currentSignature,
    previousSignature: previousSignatureRef.current,
    computeCurrentSignature,
    hasSignatureChanged,
    updatePreviousSignature,
  };
}
