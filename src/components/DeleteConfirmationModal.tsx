import React from "react";
import { View, ViewGroup } from "../types";

interface DeleteConfirmationModalProps {
  type: "view" | "viewgroup";
  item: View | ViewGroup;
  onConfirm: (action?: "group-only" | "group-and-views") => void; // Made action optional
  onCancel: () => void;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  type,
  item,
  onConfirm,
  onCancel,
}) => {
  const WarningIcon = () => (
    <svg
      width="48"
      height="48"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );

  const CloseIcon = () => (
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

  if (type === "view") {
    return (
      <div className="delete-modal-overlay">
        <div className="delete-modal">
          <div className="delete-modal-content">
            <div className="warning-icon">
              <WarningIcon />
            </div>
            <div className="delete-text">
              <h3>Delete View</h3>
              <p>
                Are you sure you want to delete "<strong>{item.name}</strong>"?
                This action cannot be undone and the view will be removed from
                all view groups.
              </p>
            </div>
            <div className="delete-actions">
              <button className="cancel-btn" onClick={onCancel}>
                Cancel
              </button>
              <button
                className="confirm-delete-btn"
                onClick={() => onConfirm()}
              >
                Delete View
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // View Group deletion with options
  const viewGroup = item as ViewGroup;
  const viewCount = "viewIds" in viewGroup ? viewGroup.viewIds.length : 0;

  return (
    <div className="delete-modal-overlay">
      <div className="delete-modal delete-modal-large">
        <div className="delete-modal-header">
          <h3>Delete View Group</h3>
          <button className="close-btn" onClick={onCancel}>
            <CloseIcon />
          </button>
        </div>

        <div className="delete-modal-content">
          <div className="warning-icon">
            <WarningIcon />
          </div>
          <div className="delete-text">
            <p>
              You are about to delete the view group "
              <strong>{viewGroup.name}</strong>" which contains{" "}
              <strong>{viewCount}</strong> view{viewCount !== 1 ? "s" : ""}.
            </p>
            <p>What would you like to do with the views in this group?</p>
          </div>

          <div className="delete-options">
            <div className="delete-option">
              <button
                className="option-btn group-only-btn"
                onClick={() => onConfirm("group-only")}
              >
                <div className="option-content">
                  <div className="option-title">Delete Group Only</div>
                  <div className="option-description">
                    Move all views to the Default group
                  </div>
                </div>
              </button>
            </div>

            <div className="delete-option">
              <button
                className="option-btn group-and-views-btn"
                onClick={() => onConfirm("group-and-views")}
              >
                <div className="option-content">
                  <div className="option-title">Delete Group & Views</div>
                  <div className="option-description">
                    Permanently delete the group and all its views
                  </div>
                </div>
              </button>
            </div>
          </div>

          <div className="delete-actions">
            <button className="cancel-btn" onClick={onCancel}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;
