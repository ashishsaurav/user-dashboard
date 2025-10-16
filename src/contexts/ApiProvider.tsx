/**
 * API Provider Context
 * Provides API configuration and helpers throughout the app
 */

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { apiClient } from '../services/apiClient';
import { authService } from '../services/authService';
import { User } from '../types';

interface ApiContextValue {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
}

const ApiContext = createContext<ApiContextValue | undefined>(undefined);

export function useApi() {
  const context = useContext(ApiContext);
  if (!context) {
    throw new Error('useApi must be used within ApiProvider');
  }
  return context;
}

interface ApiProviderProps {
  children: ReactNode;
}

export function ApiProvider({ children }: ApiProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize authentication on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        const currentUser = authService.getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error('Failed to initialize auth:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const value: ApiContextValue = {
    user,
    isLoading,
    isAuthenticated: !!user,
    setUser,
  };

  return <ApiContext.Provider value={value}>{children}</ApiContext.Provider>;
}
