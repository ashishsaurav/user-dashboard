import React, { useEffect, useRef, memo } from "react";
import * as powerbi from "powerbi-client";
import { models } from "powerbi-client";
import { usePowerBIEmbed } from "../../hooks/usePowerBIEmbed";
import "./PowerBIEmbed.css";

interface PowerBIEmbedReportProps {
  workspaceId: string;
  reportId: string;
  reportName: string;
  pageName?: string; // Optional specific page to show
}

const PowerBIEmbedReport: React.FC<PowerBIEmbedReportProps> = memo(({
  workspaceId,
  reportId,
  reportName,
  pageName,
}) => {
  console.log("🔵 PowerBIEmbedReport RENDER:", reportName);
  
  const { loading, error, containerRef, instance } = usePowerBIEmbed({
    workspaceId,
    reportId,
    pageName,
    type: "report",
  });

  // Handle specific page selection when report is loaded
  useEffect(() => {
    const setActivePage = async () => {
      if (instance && pageName) {
        try {
          await (instance as powerbi.Report).setPage(pageName);
          console.log("📄 Set active page to:", pageName);
        } catch (e) {
          console.warn("Could not set page:", e);
        }
      }
    };

    if (instance) {
      setActivePage();
    }
  }, [instance, pageName]);

  // Handle responsive resize with debouncing
  useEffect(() => {
    const debounce = (func: () => void, delay: number) => {
      let timer: ReturnType<typeof setTimeout>;
      return () => {
        clearTimeout(timer);
        timer = setTimeout(func, delay);
      };
    };

    const handleResize = async () => {
      // Only resize if report is loaded and ref exists
      if (!containerRef.current || !instance) {
        return;
      }

      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      
      // Skip resize if container is hidden or has zero dimensions
      // This happens when the tab is inactive (display: none)
      if (width === 0 || height === 0) {
        console.debug("Skipping resize - container is hidden");
        return;
      }

      try {
        // Resize the active page
        // if (pageName && typeof instance.resizePage === "function") {
        //   await instance.resizePage(
        //     models.PageSizeType.Custom,
        //     width,
        //     height
        //   );
        // } else if (typeof instance.resizeActivePage === "function") {
        //   await instance.resizeActivePage(
        //     models.PageSizeType.Custom,
        //     width,
        //     height
        //   );
        // }
        console.log("📐 Resized PowerBI report to", width, "x", height);
      } catch (e) {
        // Resize may fail if report not fully loaded yet - this is normal
        console.debug("Report resize not ready yet:", e);
      }
    };

    const debouncedResize = debounce(handleResize, 150);
    const resizeObserver = new ResizeObserver(debouncedResize);

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [containerRef, instance, pageName]);

  if (error) {
    return (
      <div className="powerbi-error">
        <div className="error-content">
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <h3>Failed to Load Report</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="powerbi-embed-container">
      {loading && (
        <div className="powerbi-loading">
          <div className="loading-spinner"></div>
          <p>Loading {reportName}...</p>
        </div>
      )}
      <div
        ref={containerRef}
        className="powerbi-report"
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function - only re-render if these props actually change
  return (
    prevProps.workspaceId === nextProps.workspaceId &&
    prevProps.reportId === nextProps.reportId &&
    prevProps.reportName === nextProps.reportName &&
    prevProps.pageName === nextProps.pageName
  );
});

PowerBIEmbedReport.displayName = 'PowerBIEmbedReport';

export default PowerBIEmbedReport;
