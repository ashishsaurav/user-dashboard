import React, { useState } from "react";
import { Report, Widget } from "../../types";

interface AddItemModalProps<T> {
  title: string;
  items: T[];
  selectedItems: T[];
  onToggleSelection: (item: T) => void;
  onSelectAll: () => void;
  onClearAll: () => void;
  onConfirm: () => void;
  onClose: () => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  getItemId: (item: T) => string;
  getItemName: (item: T) => string;
  getItemUrl?: (item: T) => string;
  renderItemExtra?: (item: T) => React.ReactNode;
}

export function AddItemModal<T>({
  title,
  items,
  selectedItems,
  onToggleSelection,
  onSelectAll,
  onClearAll,
  onConfirm,
  onClose,
  searchTerm,
  onSearchChange,
  getItemId,
  getItemName,
  getItemUrl,
  renderItemExtra,
}: AddItemModalProps<T>) {
  const isSelected = (item: T) =>
    selectedItems.some((selected) => getItemId(selected) === getItemId(item));

  const allSelected = items.length > 0 && items.every(isSelected);
  const someSelected = items.some(isSelected);

  return (
    <div className="modal-overlay">
      <div className="modal-content add-item-modal">
        <div className="modal-header">
          <h2>{title}</h2>
          <button className="modal-close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="modal-body">
          {/* Search Section */}
          <div className="search-section">
            <input
              type="text"
              placeholder={`Search ${title.toLowerCase()}...`}
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="search-input"
            />
          </div>

          {/* Bulk Actions */}
          <div className="bulk-actions">
            <button
              className="bulk-action-btn"
              onClick={allSelected ? onClearAll : onSelectAll}
              disabled={items.length === 0}
            >
              {allSelected ? "Deselect All" : "Select All"}
            </button>
            <span className="selection-count">
              {selectedItems.length} of {items.length} selected
            </span>
          </div>

          {/* Items List */}
          <div className="items-list">
            {items.length === 0 ? (
              <div className="no-items">
                <p>No {title.toLowerCase()} available</p>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={getItemId(item)}
                  className={`item-card ${isSelected(item) ? "selected" : ""}`}
                  onClick={() => onToggleSelection(item)}
                >
                  <div className="item-checkbox">
                    <input
                      type="checkbox"
                      checked={isSelected(item)}
                      onChange={() => onToggleSelection(item)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                  <div className="item-info">
                    <h4 className="item-name">{getItemName(item)}</h4>
                    {getItemUrl && (
                      <p className="item-url">{getItemUrl(item)}</p>
                    )}
                    {renderItemExtra && renderItemExtra(item)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn btn-primary"
            onClick={onConfirm}
            disabled={selectedItems.length === 0}
          >
            Add {selectedItems.length} {title}
            {selectedItems.length !== 1 ? "s" : ""}
          </button>
        </div>
      </div>
    </div>
  );
}