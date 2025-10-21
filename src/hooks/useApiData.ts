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

        console.log('✅ API Data loaded successfully', {
          reports: reports.length,
          widgets: widgets.length,
          views: views.length,
          viewGroups: viewGroups.length,
        });
        
        // Debug: Show first view details
        if (views.length > 0) {
          const firstView = views[0];
          console.log('🔍 Sample View Data:', {
            name: firstView.name,
            reportIds: firstView.reportIds,
            widgetIds: firstView.widgetIds,
            totalReports: firstView.reportIds.length,
            totalWidgets: firstView.widgetIds.length
          });
          
          console.log('🔍 Available Reports:', reports.map(r => ({ id: r.id, name: r.name })));
          console.log('🔍 Available Widgets:', widgets.map(w => ({ id: w.id, name: w.name })));
          
          // Check which IDs are missing
          const missingReports = firstView.reportIds.filter(id => !reports.find(r => r.id === id));
          const missingWidgets = firstView.widgetIds.filter(id => !widgets.find(w => w.id === id));
          
          if (missingReports.length > 0 || missingWidgets.length > 0) {
            console.warn('⚠️ View has items user cannot access:', {
              view: firstView.name,
              missingReports,
              missingWidgets
            });
          }
        }
      } catch (error: any) {
        console.error('❌ Error loading API data:', error);
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
      console.log('🔄 Refetching view groups for user:', user.name);
      const viewGroups = await viewGroupsService.getUserViewGroups(user.name);
      console.log('✅ View groups refetched:', viewGroups.length);
      setState(prev => ({ ...prev, viewGroups }));
    } catch (error) {
      console.error('❌ Error refetching view groups:', error);
    }
  }, [user]);

  const refetchNavSettings = useCallback(async () => {
    if (!user) return;
    try {
      console.log('🔄 Refetching navigation settings for user:', user.name);
      const navSettings = await navigationService.getNavigationSettings(user.name);
      console.log('✅ Navigation settings refetched');
      setState(prev => ({ ...prev, navSettings }));
    } catch (error) {
      console.error('❌ Error refetching navigation settings:', error);
    }
  }, [user]);

  return {
    ...state,
    refetchViews,
    refetchViewGroups,
    refetchNavSettings,
  };
}
