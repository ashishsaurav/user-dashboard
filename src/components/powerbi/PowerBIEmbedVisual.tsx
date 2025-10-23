import React, { useEffect } from "react";
import { models } from "powerbi-client";
import { usePowerBIEmbed } from "../../hooks/usePowerBIEmbed";
import "./PowerBIEmbed.css";

interface PowerBIEmbedVisualProps {
  workspaceId: string;
  reportId: string;
  pageName: string;
  visualName: string;
  widgetName: string;
}

const PowerBIEmbedVisual: React.FC<PowerBIEmbedVisualProps> = ({
  workspaceId,
  reportId,
  pageName,
  visualName,
  widgetName,
}) => {
  const { loading, error, containerRef, instance } = usePowerBIEmbed({
    workspaceId,
    reportId,
    pageName,
    visualName,
    type: "visual",
  });

  // Handle responsive resize
  useEffect(() => {
    const debounce = (func: () => void, delay: number) => {
      let timer: ReturnType<typeof setTimeout>;
      return () => {
        clearTimeout(timer);
        timer = setTimeout(func, delay);
      };
    };

    const handleResize = async () => {
      // Only resize if visual is loaded and ref exists
      if (!containerRef.current || !instance) {
        return;
      }

      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;

      try {
        instance?.powerBiEmbed?.resizeActivePage(
          models.PageSizeType.Custom,
          width,
          height
        );
        instance?.powerBiEmbed?.resizeVisual(
          pageName,
          visualName,
          width,
          height
        );
        console.log("📐 Visual container resized to", width, "x", height);
      } catch (e) {
        // Resize may fail if visual not fully loaded yet - this is normal
        console.debug("Visual resize not ready yet:", e);
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
  }, [containerRef, instance, pageName, visualName]);

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
          <h3>Failed to Load Visual</h3>
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
          <p>Loading {widgetName}...</p>
        </div>
      )}
      <div
        ref={containerRef}
        className="powerbi-visual"
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
};

export default PowerBIEmbedVisual;
