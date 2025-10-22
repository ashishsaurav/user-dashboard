/**
 * useApiData Hook
 * Custom hook to load data from backend API
 */

import { useState, useEffect, useCallback } from 'react';
import { User, Report, Widget, View, ViewGroup, UserNavigationSettings } from '../types';
import { reportsService } from '../services/reportsService';
import { widgetsService } from '../services/widgetsService';
import { viewsService } from '../services/viewsService';
import { viewGroupsService } from '../services/viewGroupsService';
import { navigationService } from '../services/navigationService';

interface ApiDataState {
  reports: Report[];
  widgets: Widget[];
  views: View[];
  viewGroups: ViewGroup[];
  navSettings: UserNavigationSettings | null;
  loading: boolean;
  error: string | null;
}

export function useApiData(user: User | null) {
  const [state, setState] = useState<ApiDataState>({
    reports: [],
    widgets: [],
    views: [],
    viewGroups: [],
    navSettings: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (!user) {
      setState({
        reports: [],
        widgets: [],
        views: [],
        viewGroups: [],
        navSettings: null,
        loading: false,
        error: null,
      });
      return;
    }

    const loadData = async () => {
      setState(prev => ({ ...prev, loading: true, error: null }));

      try {
        // Load all data in parallel
        const [reports, widgets, views, viewGroups, navSettings] = await Promise.all([
          reportsService.getReportsByRole(user.role),
          widgetsService.getWidgetsByRole(user.role),
          viewsService.getUserViews(user.name), // user.name is userId
          viewGroupsService.getUserViewGroups(user.name),
          navigationService.getNavigationSettings(user.name),
        ]);

        setState({
          reports,
          widgets,
          views,
          viewGroups,
          navSettings,
          loading: false,
          error: null,
        });
      } catch (error: any) {
        setState(prev => ({
          ...prev,
          loading: false,
          error: error.message || 'Failed to load data',
        }));
      }
    };

    loadData();
  }, [user]);

  const refetchViews = useCallback(async () => {
    if (!user) return;
    try {
      console.log('🔄 Refetching views for user:', user.name);
      const views = await viewsService.getUserViews(user.name);
      console.log('✅ Views refetched:', views.length);
      setState(prev => ({ ...prev, views }));
    } catch (error) {
      console.error('❌ Error refetching views:', error);
    }
  }, [user]);

  const refetchViewGroups = useCallback(async () => {
    if (!user) return;
    try {
      const viewGroups = await viewGroupsService.getUserViewGroups(user.name);
      setState(prev => ({ ...prev, viewGroups }));
    } catch (error) {
      // Silent fail
    }
  }, [user]);

  const refetchNavSettings = useCallback(async () => {
    if (!user) return;
    try {
      const navSettings = await navigationService.getNavigationSettings(user.name);
      setState(prev => ({ ...prev, navSettings }));
    } catch (error) {
      // Silent fail
    }
  }, [user]);

  const refetchReports = useCallback(async () => {
    if (!user) return;
    try {
      console.log('🔄 Refetching reports for role:', user.role);
      const reports = await reportsService.getReportsByRole(user.role);
      console.log('✅ Reports refetched:', reports.length);
      setState(prev => ({ ...prev, reports }));
    } catch (error) {
      console.error('❌ Error refetching reports:', error);
    }
  }, [user]);

  const refetchWidgets = useCallback(async () => {
    if (!user) return;
    try {
      console.log('🔄 Refetching widgets for role:', user.role);
      const widgets = await widgetsService.getWidgetsByRole(user.role);
      console.log('✅ Widgets refetched:', widgets.length);
      setState(prev => ({ ...prev, widgets }));
    } catch (error) {
      console.error('❌ Error refetching widgets:', error);
    }
  }, [user]);

  return {
    ...state,
    refetchViews,
    refetchViewGroups,
    refetchNavSettings,
    refetchReports,
    refetchWidgets,
  };
}
