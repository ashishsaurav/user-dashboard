import React, { useEffect } from "react";
import { CloseIcon } from "./Icons";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: "small" | "medium" | "large";
  showCloseButton?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = "medium",
  showCloseButton = true,
}) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClass = `modal-${size}`;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className={`modal-container ${sizeClass}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2>{title}</h2>
          {showCloseButton && (
            <button className="close-btn" onClick={onClose}>
              <CloseIcon />
            </button>
          )}
        </div>
        <div className="modal-content">{children}</div>
      </div>
    </div>
  );
};

interface ModalFooterProps {
  children: React.ReactNode;
  className?: string;
}

export const ModalFooter: React.FC<ModalFooterProps> = ({
  children,
  className = "",
}) => {
  return <div className={`modal-footer ${className}`}>{children}</div>;
};
