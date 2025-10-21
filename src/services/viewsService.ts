/**
 * Views Service
 * Handles all view-related API calls
 */

import { apiClient } from './apiClient';
import { API_ENDPOINTS } from '../config/api.config';
import { View, Report, Widget } from '../types';

interface ReportDto {
  reportId: string;
  reportName: string;
  reportUrl?: string;
  isActive: boolean;
  orderIndex?: number;
}

interface WidgetDto {
  widgetId: string;
  widgetName: string;
  widgetUrl?: string;
  widgetType?: string;
  isActive: boolean;
  orderIndex?: number;
}

interface ViewDto {
  viewId: string;
  userId: string;
  name: string;
  isVisible: boolean;
  orderIndex: number;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
  reports: ReportDto[];
  widgets: WidgetDto[];
}

export class ViewsService {
  /**
   * Get all views for a user
   */
  async getUserViews(userId: string): Promise<View[]> {
    const views = await apiClient.get<ViewDto[]>(
      API_ENDPOINTS.VIEWS.BY_USER(userId)
    );
    return views.map(this.transformToFrontend.bind(this));
  }

  /**
   * Get view by ID
   */
  async getView(id: string, userId: string): Promise<View> {
    const view = await apiClient.get<ViewDto>(
      API_ENDPOINTS.VIEWS.GET(id, userId)
    );
    return this.transformToFrontend(view);
  }

  /**
   * Create view
   */
  async createView(userId: string, data: {
    name: string;
    isVisible?: boolean;
    orderIndex?: number;
    reportIds?: string[];
    widgetIds?: string[];
  }): Promise<View> {
    const view = await apiClient.post<ViewDto>(API_ENDPOINTS.VIEWS.CREATE, {
      userId,
      data: {
        name: data.name,
        isVisible: data.isVisible ?? true,
        orderIndex: data.orderIndex ?? 0,
        reportIds: data.reportIds || [],
        widgetIds: data.widgetIds || [],
      },
    });
    return this.transformToFrontend(view);
  }

  /**
   * Update view
   */
  async updateView(
    id: string,
    userId: string,
    data: {
      name: string;
      isVisible: boolean;
      orderIndex: number;
      reportIds?: string[];
      widgetIds?: string[];
    }
  ): Promise<View> {
    // First update the basic view properties
    const view = await apiClient.put<ViewDto>(API_ENDPOINTS.VIEWS.UPDATE(id), {
      userId,
      data: {
        name: data.name,
        isVisible: data.isVisible,
        orderIndex: data.orderIndex,
      },
    });

    // If reportIds or widgetIds are provided, update them separately
    if (data.reportIds !== undefined || data.widgetIds !== undefined) {
      // Get current view to compare with new data
      const currentView = await this.getView(id, userId);
      
      // Update reports if provided
      if (data.reportIds !== undefined) {
        const currentReportIds = currentView.reportIds || [];
        const newReportIds = data.reportIds || [];
        
        // Remove reports that are no longer selected
        for (const reportId of currentReportIds) {
          if (!newReportIds.includes(reportId)) {
            await this.removeReportFromView(id, reportId, userId);
          }
        }
        
        // Add new reports
        const reportsToAdd = newReportIds.filter(id => !currentReportIds.includes(id));
        if (reportsToAdd.length > 0) {
          await this.addReportsToView(id, userId, reportsToAdd);
        }
      }
      
      // Update widgets if provided
      if (data.widgetIds !== undefined) {
        const currentWidgetIds = currentView.widgetIds || [];
        const newWidgetIds = data.widgetIds || [];
        
        // Remove widgets that are no longer selected
        for (const widgetId of currentWidgetIds) {
          if (!newWidgetIds.includes(widgetId)) {
            await this.removeWidgetFromView(id, widgetId, userId);
          }
        }
        
        // Add new widgets
        const widgetsToAdd = newWidgetIds.filter(id => !currentWidgetIds.includes(id));
        if (widgetsToAdd.length > 0) {
          await this.addWidgetsToView(id, userId, widgetsToAdd);
        }
      }
      
      // Return the updated view
      return await this.getView(id, userId);
    }

    return this.transformToFrontend(view);
  }

  /**
   * Delete view
   */
  async deleteView(id: string, userId: string): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.VIEWS.DELETE(id, userId));
  }

  /**
   * Add reports to view
   */
  async addReportsToView(
    viewId: string,
    userId: string,
    reportIds: string[]
  ): Promise<void> {
    await apiClient.post(API_ENDPOINTS.VIEWS.ADD_REPORTS(viewId), {
      userId,
      reportIds,
    });
  }

  /**
   * Remove report from view
   */
  async removeReportFromView(
    viewId: string,
    reportId: string,
    userId: string
  ): Promise<void> {
    await apiClient.delete(
      API_ENDPOINTS.VIEWS.REMOVE_REPORT(viewId, reportId, userId)
    );
  }

  /**
   * Add widgets to view
   */
  async addWidgetsToView(
    viewId: string,
    userId: string,
    widgetIds: string[]
  ): Promise<void> {
    await apiClient.post(API_ENDPOINTS.VIEWS.ADD_WIDGETS(viewId), {
      userId,
      widgetIds,
    });
  }

  /**
   * Remove widget from view
   */
  async removeWidgetFromView(
    viewId: string,
    widgetId: string,
    userId: string
  ): Promise<void> {
    await apiClient.delete(
      API_ENDPOINTS.VIEWS.REMOVE_WIDGET(viewId, widgetId, userId)
    );
  }

  /**
   * Reorder reports in view
   */
  async reorderReports(
    viewId: string,
    userId: string,
    items: Array<{ id: string; orderIndex: number }>
  ): Promise<void> {
    await apiClient.post(API_ENDPOINTS.VIEWS.REORDER_REPORTS(viewId), {
      userId,
      items,
    });
  }

  /**
   * Reorder widgets in view
   */
  async reorderWidgets(
    viewId: string,
    userId: string,
    items: Array<{ id: string; orderIndex: number }>
  ): Promise<void> {
    await apiClient.post(API_ENDPOINTS.VIEWS.REORDER_WIDGETS(viewId), {
      userId,
      items,
    });
  }

  /**
   * Transform backend DTO to frontend type
   * Note: Backend returns ALL reports/widgets in the view,
   * but frontend will filter by role-accessible ones
   */
  private transformToFrontend(dto: ViewDto): View {
    return {
      id: dto.viewId,
      name: dto.name,
      reportIds: dto.reports?.map((r) => r.reportId) || [],
      widgetIds: dto.widgets?.map((w) => w.widgetId) || [],
      isVisible: dto.isVisible,
      order: dto.orderIndex,
      createdBy: dto.createdBy || dto.userId,
    };
  }
}

export const viewsService = new ViewsService();
export default viewsService;
