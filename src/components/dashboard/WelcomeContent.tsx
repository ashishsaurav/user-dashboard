import React from "react";
import { View } from "../../types";
import { PlusIcon } from "../ui";

const DashboardIcon = () => (
  <svg
    width="32"
    height="32"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
  >
    <rect x="3" y="3" width="7" height="9" />
    <rect x="14" y="3" width="7" height="5" />
    <rect x="14" y="12" width="7" height="9" />
    <rect x="3" y="16" width="7" height="5" />
  </svg>
);

const ReportsIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14,2 14,8 20,8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10,9 9,9 8,9" />
  </svg>
);

const WidgetsIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <rect x="3" y="3" width="7" height="7" />
    <rect x="14" y="3" width="7" height="7" />
    <rect x="14" y="14" width="7" height="7" />
    <rect x="3" y="14" width="7" height="7" />
  </svg>
);

interface WelcomeContentProps {
  selectedView?: View | null;
  onReopenReports?: () => void;
  onReopenWidgets?: () => void;
  onAddReport?: () => void; // NEW: Handler to open Add Report modal
  onAddWidget?: () => void; // NEW: Handler to open Add Widget modal
  hasReports?: boolean; // NEW: Does the view have reports?
  hasWidgets?: boolean; // NEW: Does the view have widgets?
}

const WelcomeContent: React.FC<WelcomeContentProps> = ({
  selectedView,
  onReopenReports,
  onReopenWidgets,
  onAddReport,
  onAddWidget,
  hasReports = false,
  hasWidgets = false,
}) => {
  // View selected but sections closed
  if (selectedView && (onReopenReports || onReopenWidgets)) {
    // Determine which buttons to show
    const showReportsButton = hasReports && onReopenReports;
    const showWidgetsButton = hasWidgets && onReopenWidgets;
    const hasAnyContent = hasReports || hasWidgets;

    return (
      <div className="welcome-dock-section">
        <div className="welcome-content">
          <div className="welcome-icon-large">
            <DashboardIcon />
          </div>
          <h2>"{selectedView.name}" Selected</h2>

          {hasAnyContent ? (
            <>
              <p>
                {showReportsButton && showWidgetsButton
                  ? "All sections are closed. Open Reports or Widgets to view content."
                  : showReportsButton
                  ? "Reports section is closed. Click below to open it."
                  : "Widgets section is closed. Click below to open it."}
              </p>
              <div className="welcome-actions">
                {showReportsButton && (
                  <button
                    className="welcome-action-btn reports-btn"
                    onClick={onReopenReports}
                  >
                    <ReportsIcon />
                    <span>Open Reports</span>
                  </button>
                )}
                {showWidgetsButton && (
                  <button
                    className="welcome-action-btn widgets-btn"
                    onClick={onReopenWidgets}
                  >
                    <WidgetsIcon />
                    <span>Open Widgets</span>
                  </button>
                )}
              </div>
            </>
          ) : (
            <>
              <p>This view has no reports or widgets configured yet.</p>
              <div className="welcome-actions">
                <button
                  className="welcome-action-btn reports-btn"
                  onClick={onAddReport}
                >
                  <PlusIcon />
                  <span>Add Reports</span>
                </button>

                <button
                  className="welcome-action-btn widgets-btn"
                  onClick={onAddWidget}
                >
                  <PlusIcon />
                  <span>Add Widgets</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  // No view selected
  return (
    <div className="welcome-dock-section">
      <div className="welcome-content">
        <div className="welcome-icon-large">
          <DashboardIcon />
        </div>
        <h2>Welcome to Dashboard</h2>
        <p>
          Select a view from the Navigation panel to load reports and widgets.
        </p>
        <div className="welcome-features">
          <div className="feature-item">
            <ReportsIcon />
            <span>View Reports</span>
          </div>
          <div className="feature-item">
            <WidgetsIcon />
            <span>Interactive Widgets</span>
          </div>
        </div>
        <div className="welcome-hint">
          <small>👈 Choose a view to get started</small>
        </div>
      </div>
    </div>
  );
};

export default WelcomeContent;
