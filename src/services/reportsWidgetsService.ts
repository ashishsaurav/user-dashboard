import { Report, Widget } from "../types";
import { storageService } from "./storageService";

export const reportsWidgetsService = {
  getReports: (): Report[] => {
    return storageService.get<Report[]>("reports") || [];
  },

  saveReports: (reports: Report[]): void => {
    storageService.set("reports", reports);
  },

  getWidgets: (): Widget[] => {
    return storageService.get<Widget[]>("widgets") || [];
  },

  saveWidgets: (widgets: Widget[]): void => {
    storageService.set("widgets", widgets);
  },

  addReport: (report: Report): void => {
    const reports = reportsWidgetsService.getReports();
    reportsWidgetsService.saveReports([...reports, report]);
  },

  updateReport: (updatedReport: Report): void => {
    const reports = reportsWidgetsService.getReports();
    const updatedReports = reports.map((r) =>
      r.id === updatedReport.id ? updatedReport : r
    );
    reportsWidgetsService.saveReports(updatedReports);
  },

  deleteReport: (reportId: string): void => {
    const reports = reportsWidgetsService.getReports();
    const filteredReports = reports.filter((r) => r.id !== reportId);
    reportsWidgetsService.saveReports(filteredReports);
  },

  addWidget: (widget: Widget): void => {
    const widgets = reportsWidgetsService.getWidgets();
    reportsWidgetsService.saveWidgets([...widgets, widget]);
  },

  updateWidget: (updatedWidget: Widget): void => {
    const widgets = reportsWidgetsService.getWidgets();
    const updatedWidgets = widgets.map((w) =>
      w.id === updatedWidget.id ? updatedWidget : w
    );
    reportsWidgetsService.saveWidgets(updatedWidgets);
  },

  deleteWidget: (widgetId: string): void => {
    const widgets = reportsWidgetsService.getWidgets();
    const filteredWidgets = widgets.filter((w) => w.id !== widgetId);
    reportsWidgetsService.saveWidgets(filteredWidgets);
  },

  filterByRole: <T extends Report | Widget>(
    items: T[],
    userRole: string
  ): T[] => {
    if (userRole === "admin") {
      return items;
    }
    return items.filter((item) => item.userRoles.includes(userRole));
  },
};
