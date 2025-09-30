import React, { useState } from "react";
import { Report } from "../types";
import "./ViewContentPanel.css";

interface AddReportModalProps {
  onAddReports: (reports: Report[]) => void; // CHANGED: Now accepts multiple reports
  onClose: () => void;
  availableReports: Report[];
}

const AddReportModal: React.FC<AddReportModalProps> = ({
  onAddReports, // CHANGED: Multiple reports
  onClose,
  availableReports,
}) => {
  const [selectedReports, setSelectedReports] = useState<Report[]>([]); // CHANGED: Array of reports
  const [searchTerm, setSearchTerm] = useState("");

  const filteredReports = availableReports.filter((report) =>
    report.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // CHANGED: Toggle selection instead of single selection
  const handleToggleSelection = (report: Report) => {
    setSelectedReports((prevSelected) => {
      const isAlreadySelected = prevSelected.some((r) => r.id === report.id);

      if (isAlreadySelected) {
        // Remove from selection
        return prevSelected.filter((r) => r.id !== report.id);
      } else {
        // Add to selection
        return [...prevSelected, report];
      }
    });
  };

  // NEW: Select all filtered reports
  const handleSelectAll = () => {
    const allCurrentlySelected = filteredReports.every((report) =>
      selectedReports.some((sr) => sr.id === report.id)
    );

    if (allCurrentlySelected) {
      // Deselect all filtered reports
      setSelectedReports((prevSelected) =>
        prevSelected.filter(
          (sr) => !filteredReports.some((fr) => fr.id === sr.id)
        )
      );
    } else {
      // Select all filtered reports
      const newSelections = filteredReports.filter(
        (report) => !selectedReports.some((sr) => sr.id === report.id)
      );
      setSelectedReports((prevSelected) => [...prevSelected, ...newSelections]);
    }
  };

  // NEW: Clear all selections
  const handleClearAll = () => {
    setSelectedReports([]);
  };

  const handleAdd = () => {
    if (selectedReports.length > 0) {
      onAddReports(selectedReports); // CHANGED: Pass array of reports
    }
  };

  const isReportSelected = (report: Report) => {
    return selectedReports.some((r) => r.id === report.id);
  };

  const allFilteredSelected =
    filteredReports.length > 0 &&
    filteredReports.every((report) =>
      selectedReports.some((sr) => sr.id === report.id)
    );

  return (
    <div className="modern-modal-overlay">
      <div className="modern-modal-container add-item-modal">
        <div className="modern-modal-header">
          <div className="modal-header-content">
            <div className="header-icon-container">
              <ReportsIcon />
            </div>
            <div className="modal-header-text">
              <h2>Add Reports to View</h2>
              <p>Select one or more reports to add to the current view</p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <CloseIcon />
          </button>
        </div>

        <div className="modern-modal-content">
          <div className="search-container">
            <SearchIcon />
            <input
              type="text"
              placeholder="Search reports..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          {/* NEW: Selection controls */}
          {filteredReports.length > 0 && (
            <div className="selection-controls">
              <div className="selection-info">
                <span className="selection-count">
                  {selectedReports.length} selected
                  {filteredReports.length !== availableReports.length &&
                    ` of ${filteredReports.length} shown`}
                </span>
              </div>
              <div className="selection-actions">
                <button
                  type="button"
                  className="selection-action-btn"
                  onClick={handleSelectAll}
                >
                  {allFilteredSelected ? "Deselect All" : "Select All"}
                </button>
                {selectedReports.length > 0 && (
                  <button
                    type="button"
                    className="selection-action-btn clear-btn"
                    onClick={handleClearAll}
                  >
                    Clear All
                  </button>
                )}
              </div>
            </div>
          )}

          {filteredReports.length === 0 ? (
            <div className="no-items-message">
              <p>
                {searchTerm
                  ? `No reports found matching "${searchTerm}"`
                  : "No more reports available to add to this view."}
              </p>
            </div>
          ) : (
            <div className="items-selection-list">
              {filteredReports.map((report) => {
                const isSelected = isReportSelected(report);

                return (
                  <div
                    key={report.id}
                    className={`selection-item ${isSelected ? "selected" : ""}`}
                    onClick={() => handleToggleSelection(report)}
                  >
                    <div className="selection-checkbox">
                      <div
                        className={`checkbox ${isSelected ? "checked" : ""}`}
                      >
                        {isSelected && <CheckIcon />}
                      </div>
                    </div>
                    <div className="item-icon">
                      <ReportsIcon />
                    </div>
                    <div className="item-content">
                      <h4>{report.name}</h4>
                      <p>Type: {report.type}</p>
                      <div className="item-meta">
                        <span className="roles-badge">
                          Roles: {report.userRoles.join(", ")}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="modern-modal-footer">
          <button
            type="button"
            className="modal-btn modal-btn-secondary"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="button"
            className="modal-btn modal-btn-primary"
            onClick={handleAdd}
            disabled={selectedReports.length === 0}
          >
            Add {selectedReports.length} Report
            {selectedReports.length !== 1 ? "s" : ""}
          </button>
        </div>
      </div>
    </div>
  );

  function ReportsIcon() {
    return (
      <svg
        width="20"
        height="20"
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
  }

  function CloseIcon() {
    return (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    );
  }

  function SearchIcon() {
    return (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.35-4.35" />
      </svg>
    );
  }

  function CheckIcon() {
    return (
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <polyline points="20,6 9,17 4,12" />
      </svg>
    );
  }
};

export default AddReportModal;
