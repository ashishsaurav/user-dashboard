import React from "react";
import { ConfirmDialog } from "./ui/ConfirmDialog";

interface DeleteConfirmModalProps {
  itemName: string;
  itemType: "report" | "widget";
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * @deprecated Use ConfirmDialog from ui/ConfirmDialog instead
 */
const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  itemName,
  itemType,
  onConfirm,
  onCancel,
}) => {
  return (
    <ConfirmDialog
      isOpen={true}
      type="danger"
      title={`Delete ${itemType === "report" ? "Report" : "Widget"}?`}
      message={`Are you sure you want to delete <strong>"${itemName}"</strong>? This action cannot be undone.`}
      confirmLabel={`Delete ${itemType === "report" ? "Report" : "Widget"}`}
      cancelLabel="Cancel"
      onConfirm={onConfirm}
      onCancel={onCancel}
    />
  );
};

export default DeleteConfirmModal;
