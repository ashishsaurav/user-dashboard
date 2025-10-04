import { useState, useCallback, useEffect, useRef } from "react";

export interface NavigationState {
  isCollapsed: boolean;
  isHorizontal: boolean;
  hoveredViewGroup: string | null;
  hoverPosition: { x: number; y: number } | null;
}

export interface UseGmailNavigationProps {
  minWidth?: number;
  maxWidth?: number;
  collapseThreshold?: number;
  horizontalThreshold?: number;
}

export function useGmailNavigation({
  minWidth = 60,
  maxWidth = 300,
  collapseThreshold = 180,
  horizontalThreshold = 2, // aspect ratio
}: UseGmailNavigationProps = {}) {
  const [navState, setNavState] = useState<NavigationState>({
    isCollapsed: false,
    isHorizontal: false,
    hoveredViewGroup: null,
    hoverPosition: null,
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  // Toggle collapsed state
  const toggleCollapsed = useCallback(() => {
    setNavState(prev => ({
      ...prev,
      isCollapsed: !prev.isCollapsed,
      hoveredViewGroup: null,
      hoverPosition: null,
    }));
  }, []);

  // Set hover state for view groups
  const setHoveredViewGroup = useCallback((viewGroupId: string | null, position?: { x: number; y: number }) => {
    setNavState(prev => ({
      ...prev,
      hoveredViewGroup: viewGroupId,
      hoverPosition: position || null,
    }));
  }, []);

  // Detect layout changes (horizontal/vertical and size)
  const detectLayout = useCallback(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const rect = container.getBoundingClientRect();
    const aspectRatio = rect.width / rect.height;

    // Detect if navigation is in horizontal layout (like when docked to top/bottom)
    const newIsHorizontal = aspectRatio > horizontalThreshold;

    // Auto-expand if width is increased beyond collapse threshold
    const shouldAutoExpand = rect.width > collapseThreshold && navState.isCollapsed;

    setNavState(prev => ({
      ...prev,
      isHorizontal: newIsHorizontal,
      isCollapsed: shouldAutoExpand ? false : prev.isCollapsed,
    }));
  }, [collapseThreshold, horizontalThreshold, navState.isCollapsed]);

  // Setup resize observer
  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    
    // Initial detection
    detectLayout();

    // Setup resize observer
    resizeObserverRef.current = new ResizeObserver(detectLayout);
    resizeObserverRef.current.observe(container);

    return () => {
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
      }
    };
  }, [detectLayout]);

  // Clear hover when collapsed state changes
  useEffect(() => {
    if (!navState.isCollapsed) {
      setNavState(prev => ({
        ...prev,
        hoveredViewGroup: null,
        hoverPosition: null,
      }));
    }
  }, [navState.isCollapsed]);

  return {
    navState,
    containerRef,
    toggleCollapsed,
    setHoveredViewGroup,
    detectLayout,
  };
}