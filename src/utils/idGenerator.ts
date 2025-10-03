export const generateId = (prefix: string = ""): string => {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 9);
  return prefix ? `${prefix}_${timestamp}_${randomStr}` : `${timestamp}_${randomStr}`;
};

export const generateViewId = (): string => generateId("view");
export const generateViewGroupId = (): string => generateId("vg");
export const generateReportId = (): string => generateId("report");
export const generateWidgetId = (): string => generateId("widget");
