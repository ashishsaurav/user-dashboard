import React from "react";

interface DeleteConfirmModalProps {
  itemName: string;
  itemType: "report" | "widget";
  onConfirm: () => void;
  onCancel: () => void;
}

const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  itemName,
  itemType,
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
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );

  return (
    <div className="delete-modal-overlay">
      <div className="delete-modal">
        <div className="delete-modal-content">
          <div className="warning-icon">
            <WarningIcon />
          </div>

          <div className="delete-text">
            <h3>Delete {itemType === "report" ? "Report" : "Widget"}?</h3>
            <p>
              Are you sure you want to delete <strong>"{itemName}"</strong>?
              This action cannot be undone.
            </p>
          </div>

          <div className="delete-actions">
            <button className="cancel-btn" onClick={onCancel}>
              Cancel
            </button>
            <button className="confirm-delete-btn" onClick={onConfirm}>
              Delete {itemType === "report" ? "Report" : "Widget"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;
