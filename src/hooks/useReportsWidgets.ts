import { useState, useEffect, useCallback } from "react";
import { Report, Widget } from "../types";
import { testReports, testWidgets } from "../data/testData";

export const useReportsWidgets = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [widgets, setWidgets] = useState<Widget[]>([]);

  useEffect(() => {
    const savedReports = sessionStorage.getItem("reports");
    const savedWidgets = sessionStorage.getItem("widgets");

    if (savedReports && savedWidgets) {
      setReports(JSON.parse(savedReports));
      setWidgets(JSON.parse(savedWidgets));
    } else {
      setReports(testReports);
      setWidgets(testWidgets);
      sessionStorage.setItem("reports", JSON.stringify(testReports));
      sessionStorage.setItem("widgets", JSON.stringify(testWidgets));
    }
  }, []);

  useEffect(() => {
    if (reports.length > 0) {
      sessionStorage.setItem("reports", JSON.stringify(reports));
    }
  }, [reports]);

  useEffect(() => {
    if (widgets.length > 0) {
      sessionStorage.setItem("widgets", JSON.stringify(widgets));
    }
  }, [widgets]);

  const updateReports = useCallback((updatedReports: Report[]) => {
    setReports(updatedReports);
  }, []);

  const updateWidgets = useCallback((updatedWidgets: Widget[]) => {
    setWidgets(updatedWidgets);
  }, []);

  return {
    reports,
    widgets,
    updateReports,
    updateWidgets,
  };
};
