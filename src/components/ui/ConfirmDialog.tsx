import React from "react";
import { WarningIcon, AlertIcon, CloseIcon } from "./Icons";

interface ConfirmDialogProps {
  isOpen: boolean;
  type?: "warning" | "danger" | "info";
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  children?: React.ReactNode;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  type = "warning",
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
  children,
}) => {
  if (!isOpen) return null;

  const Icon = type === "danger" ? WarningIcon : AlertIcon;

  return (
    <div className="delete-modal-overlay">
      <div className="delete-modal">
        <div className="delete-modal-content">
          <div className="warning-icon">
            <Icon />
          </div>

          <div className="delete-text">
            <h3>{title}</h3>
            <p dangerouslySetInnerHTML={{ __html: message }} />
          </div>

          {children}

          <div className="delete-actions">
            <button className="cancel-btn" onClick={onCancel}>
              {cancelLabel}
            </button>
            <button className="confirm-delete-btn" onClick={onConfirm}>
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

interface ConfirmDialogWithOptionsProps {
  isOpen: boolean;
  title: string;
  message: string;
  options: Array<{
    label: string;
    description: string;
    value: string;
    variant?: "primary" | "danger";
  }>;
  onSelect: (value: string) => void;
  onCancel: () => void;
}

export const ConfirmDialogWithOptions: React.FC<ConfirmDialogWithOptionsProps> = ({
  isOpen,
  title,
  message,
  options,
  onSelect,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="delete-modal-overlay">
      <div className="delete-modal delete-modal-large">
        <div className="delete-modal-header">
          <h3>{title}</h3>
          <button className="close-btn" onClick={onCancel}>
            <CloseIcon />
          </button>
        </div>

        <div className="delete-modal-content">
          <div className="warning-icon">
            <WarningIcon />
          </div>
          <div className="delete-text">
            <p dangerouslySetInnerHTML={{ __html: message }} />
          </div>

          <div className="delete-options">
            {options.map((option) => (
              <div key={option.value} className="delete-option">
                <button
                  className={`option-btn ${
                    option.variant === "danger"
                      ? "group-and-views-btn"
                      : "group-only-btn"
                  }`}
                  onClick={() => onSelect(option.value)}
                >
                  <div className="option-content">
                    <div className="option-title">{option.label}</div>
                    <div className="option-description">{option.description}</div>
                  </div>
                </button>
              </div>
            ))}
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
