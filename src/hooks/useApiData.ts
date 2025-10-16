/**
 * useApiData Hook
 * Custom hook to load data from backend API
 */

import { useState, useEffect } from 'react';
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
        console.log('👤 User details:', { id: user.name, email: user.email, role: user.role });
        console.log('🔑 Fetching reports for roleId:', user.role);
        console.log('🔑 Fetching widgets for roleId:', user.role);
        
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

  const refetchViews = async () => {
    if (!user) return;
    try {
      const views = await viewsService.getUserViews(user.name);
      setState(prev => ({ ...prev, views }));
    } catch (error) {
      console.error('Error refetching views:', error);
    }
  };

  const refetchViewGroups = async () => {
    if (!user) return;
    try {
      const viewGroups = await viewGroupsService.getUserViewGroups(user.name);
      setState(prev => ({ ...prev, viewGroups }));
    } catch (error) {
      console.error('Error refetching view groups:', error);
    }
  };

  const refetchNavSettings = async () => {
    if (!user) return;
    try {
      const navSettings = await navigationService.getNavigationSettings(user.name);
      setState(prev => ({ ...prev, navSettings }));
    } catch (error) {
      console.error('Error refetching navigation settings:', error);
    }
  };

  return {
    ...state,
    refetchViews,
    refetchViewGroups,
    refetchNavSettings,
  };
}
