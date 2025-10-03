import React from "react";
import { View } from "../../types";

const DashboardIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="3" y="3" width="7" height="9" />
    <rect x="14" y="3" width="7" height="5" />
    <rect x="14" y="12" width="7" height="9" />
    <rect x="3" y="16" width="7" height="5" />
  </svg>
);

const ReportsIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14,2 14,8 20,8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10,9 9,9 8,9" />
  </svg>
);

const WidgetsIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
}

const WelcomeContent: React.FC<WelcomeContentProps> = ({
  selectedView,
  onReopenReports,
  onReopenWidgets,
}) => {
  if (selectedView && onReopenReports && onReopenWidgets) {
    // View selected but sections closed
    return (
      <div className="welcome-dock-section">
        <div className="welcome-content">
          <div className="welcome-icon-large">
            <DashboardIcon />
          </div>
          <h2>"{selectedView.name}" Selected</h2>
          <p>All sections are closed. Open Reports or Widgets to view content.</p>
          <div className="welcome-actions">
            <button
              className="welcome-action-btn reports-btn"
              onClick={onReopenReports}
            >
              <ReportsIcon />
              <span>Open Reports</span>
            </button>
            <button
              className="welcome-action-btn widgets-btn"
              onClick={onReopenWidgets}
            >
              <WidgetsIcon />
              <span>Open Widgets</span>
            </button>
          </div>
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
        <p>Select a view from the Navigation panel to load reports and widgets.</p>
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