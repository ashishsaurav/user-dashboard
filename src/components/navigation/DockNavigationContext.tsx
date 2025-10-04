import React, { createContext, useContext, useState, ReactNode, useCallback } from "react";

interface DockNavigationContextType {
  isCollapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  toggleCollapsed: () => void;
  onNavigationManage: () => void;
  onSystemSettings: () => void;
  setNavigationManageHandler: (handler: () => void) => void;
  setSystemSettingsHandler: (handler: () => void) => void;
}

const DockNavigationContext = createContext<DockNavigationContextType | undefined>(undefined);

interface DockNavigationProviderProps {
  children: ReactNode;
}

export function DockNavigationProvider({ children }: DockNavigationProviderProps) {
  const [isCollapsed, setCollapsed] = useState(false);
  const [navigationManageHandler, setNavigationManageHandler] = useState<() => void>(() => () => {});
  const [systemSettingsHandler, setSystemSettingsHandler] = useState<() => void>(() => () => {});

  const toggleCollapsed = useCallback(() => {
    setCollapsed(prev => !prev);
  }, []);

  const onNavigationManage = useCallback(() => {
    navigationManageHandler();
  }, [navigationManageHandler]);

  const onSystemSettings = useCallback(() => {
    systemSettingsHandler();
  }, [systemSettingsHandler]);

  const setNavigationManageHandlerCallback = useCallback((handler: () => void) => {
    setNavigationManageHandler(() => handler);
  }, []);

  const setSystemSettingsHandlerCallback = useCallback((handler: () => void) => {
    setSystemSettingsHandler(() => handler);
  }, []);

  return (
    <DockNavigationContext.Provider value={{
      isCollapsed,
      setCollapsed,
      toggleCollapsed,
      onNavigationManage,
      onSystemSettings,
      setNavigationManageHandler: setNavigationManageHandlerCallback,
      setSystemSettingsHandler: setSystemSettingsHandlerCallback,
    }}>
      {children}
    </DockNavigationContext.Provider>
  );
}

export function useDockNavigation() {
  const context = useContext(DockNavigationContext);
  if (context === undefined) {
    throw new Error('useDockNavigation must be used within a DockNavigationProvider');
  }
  return context;
}