import React, { useState } from "react";
import { layoutPersistenceService } from "../../services/layoutPersistenceService";
import { User } from "../../types";

interface LayoutResetButtonProps {
  user: User;
  onReset?: () => void;
}

/**
 * LayoutResetButton - Allows users to reset their layout customizations
 * 
 * This component provides a button that clears all saved layout customizations
 * for the current user, forcing all layouts to reset to their defaults.
 * 
 * Usage:
 * <LayoutResetButton user={currentUser} onReset={() => window.location.reload()} />
 */
const LayoutResetButton: React.FC<LayoutResetButtonProps> = ({
  user,
  onReset,
}) => {
  const [showConfirm, setShowConfirm] = useState(false);

  const handleReset = () => {
    layoutPersistenceService.clearAllLayouts(user.name);

    // Call onReset callback if provided
    if (onReset) {
      onReset();
    } else {
      // Default behavior: reload the page
      window.location.reload();
    }
  };

  if (!showConfirm) {
    return (
      <button
        onClick={() => setShowConfirm(true)}
        className="layout-reset-btn"
        title="Reset all layout customizations to default"
        style={{
          padding: "8px 12px",
          fontSize: "13px",
          backgroundColor: "var(--warning-light)",
          color: "var(--warning-color)",
          border: "1px solid var(--warning-border)",
          borderRadius: "4px",
          cursor: "pointer",
          fontWeight: 500,
          transition: "all 0.2s ease",
        }}
      >
        🔄 Reset Layout
      </button>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        gap: "8px",
        alignItems: "center",
        padding: "8px",
        backgroundColor: "var(--warning-light)",
        border: "1px solid var(--warning-border)",
        borderRadius: "4px",
      }}
    >
      <span style={{ fontSize: "13px", color: "var(--text-primary)" }}>
        Reset all layouts?
      </span>
      <button
        onClick={handleReset}
        style={{
          padding: "6px 10px",
          fontSize: "12px",
          backgroundColor: "var(--danger-color)",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
          fontWeight: 500,
        }}
      >
        Yes
      </button>
      <button
        onClick={() => setShowConfirm(false)}
        style={{
          padding: "6px 10px",
          fontSize: "12px",
          backgroundColor: "var(--bg-tertiary)",
          color: "var(--text-primary)",
          border: "1px solid var(--border-color)",
          borderRadius: "4px",
          cursor: "pointer",
          fontWeight: 500,
        }}
      >
        No
      </button>
    </div>
  );
};

export default LayoutResetButton;
