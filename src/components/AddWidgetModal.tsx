import React, { useState } from "react";
import { Widget } from "../types";
import "./ViewContentPanel.css";

interface AddWidgetModalProps {
  onAddWidgets: (widgets: Widget[]) => void; // CHANGED: Now accepts multiple widgets
  onClose: () => void;
  availableWidgets: Widget[];
}

const AddWidgetModal: React.FC<AddWidgetModalProps> = ({
  onAddWidgets, // CHANGED: Multiple widgets
  onClose,
  availableWidgets,
}) => {
  const [selectedWidgets, setSelectedWidgets] = useState<Widget[]>([]); // CHANGED: Array of widgets
  const [searchTerm, setSearchTerm] = useState("");

  const filteredWidgets = availableWidgets.filter((widget) =>
    widget.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // CHANGED: Toggle selection instead of single selection
  const handleToggleSelection = (widget: Widget) => {
    setSelectedWidgets((prevSelected) => {
      const isAlreadySelected = prevSelected.some((w) => w.id === widget.id);

      if (isAlreadySelected) {
        // Remove from selection
        return prevSelected.filter((w) => w.id !== widget.id);
      } else {
        // Add to selection
        return [...prevSelected, widget];
      }
    });
  };

  // NEW: Select all filtered widgets
  const handleSelectAll = () => {
    const allCurrentlySelected = filteredWidgets.every((widget) =>
      selectedWidgets.some((sw) => sw.id === widget.id)
    );

    if (allCurrentlySelected) {
      // Deselect all filtered widgets
      setSelectedWidgets((prevSelected) =>
        prevSelected.filter(
          (sw) => !filteredWidgets.some((fw) => fw.id === sw.id)
        )
      );
    } else {
      // Select all filtered widgets
      const newSelections = filteredWidgets.filter(
        (widget) => !selectedWidgets.some((sw) => sw.id === widget.id)
      );
      setSelectedWidgets((prevSelected) => [...prevSelected, ...newSelections]);
    }
  };

  // NEW: Clear all selections
  const handleClearAll = () => {
    setSelectedWidgets([]);
  };

  const handleAdd = () => {
    if (selectedWidgets.length > 0) {
      onAddWidgets(selectedWidgets); // CHANGED: Pass array of widgets
    }
  };

  const isWidgetSelected = (widget: Widget) => {
    return selectedWidgets.some((w) => w.id === widget.id);
  };

  const allFilteredSelected =
    filteredWidgets.length > 0 &&
    filteredWidgets.every((widget) =>
      selectedWidgets.some((sw) => sw.id === widget.id)
    );

  return (
    <div className="modern-modal-overlay">
      <div className="modern-modal-container add-item-modal">
        <div className="modern-modal-header">
          <div className="modal-header-content">
            <div className="header-icon-container">
              <WidgetsIcon />
            </div>
            <div className="modal-header-text">
              <h2>Add Widgets to View</h2>
              <p>Select one or more widgets to add to the current view</p>
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
              placeholder="Search widgets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          {/* NEW: Selection controls */}
          {filteredWidgets.length > 0 && (
            <div className="selection-controls">
              <div className="selection-info">
                <span className="selection-count">
                  {selectedWidgets.length} selected
                  {filteredWidgets.length !== availableWidgets.length &&
                    ` of ${filteredWidgets.length} shown`}
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
                {selectedWidgets.length > 0 && (
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

          {filteredWidgets.length === 0 ? (
            <div className="no-items-message">
              <p>
                {searchTerm
                  ? `No widgets found matching "${searchTerm}"`
                  : "No more widgets available to add to this view."}
              </p>
            </div>
          ) : (
            <div className="items-selection-list">
              {filteredWidgets.map((widget) => {
                const isSelected = isWidgetSelected(widget);

                return (
                  <div
                    key={widget.id}
                    className={`selection-item ${isSelected ? "selected" : ""}`}
                    onClick={() => handleToggleSelection(widget)}
                  >
                    <div className="selection-checkbox">
                      <div
                        className={`checkbox ${isSelected ? "checked" : ""}`}
                      >
                        {isSelected && <CheckIcon />}
                      </div>
                    </div>
                    <div className="item-icon">
                      <WidgetsIcon />
                    </div>
                    <div className="item-content">
                      <h4>{widget.name}</h4>
                      <p>Type: {widget.type}</p>
                      <div className="item-meta">
                        <span className="roles-badge">
                          Roles: {widget.userRoles.join(", ")}
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
            disabled={selectedWidgets.length === 0}
          >
            Add {selectedWidgets.length} Widget
            {selectedWidgets.length !== 1 ? "s" : ""}
          </button>
        </div>
      </div>
    </div>
  );

  function WidgetsIcon() {
    return (
      <svg
        width="20"
        height="20"
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

export default AddWidgetModal;
