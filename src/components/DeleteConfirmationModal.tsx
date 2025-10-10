import React from "react";
import { View, ViewGroup } from "../types";
import { ConfirmDialog, ConfirmDialogWithOptions } from "./ui/ConfirmDialog";

interface DeleteConfirmationModalProps {
  type: "view" | "viewgroup";
  item: View | ViewGroup;
  onConfirm: (action?: "group-only" | "group-and-views") => void;
  onCancel: () => void;
}

/**
 * Unified confirmation modal for deleting views and view groups
 */
const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  type,
  item,
  onConfirm,
  onCancel,
}) => {
  if (type === "view") {
    return (
      <ConfirmDialog
        isOpen={true}
        type="danger"
        title="Delete View"
        message={`Are you sure you want to delete "<strong>${item.name}</strong>"? This action cannot be undone and the view will be removed from all view groups.`}
        confirmLabel="Delete View"
        cancelLabel="Cancel"
        onConfirm={() => onConfirm()}
        onCancel={onCancel}
      />
    );
  }

  // View Group deletion with options
  const viewGroup = item as ViewGroup;
  const viewCount = "viewIds" in viewGroup ? viewGroup.viewIds.length : 0;

  return (
    <ConfirmDialogWithOptions
      isOpen={true}
      title="Delete View Group"
      message={`You are about to delete the view group "<strong>${viewGroup.name}</strong>" which contains <strong>${viewCount}</strong> view${viewCount !== 1 ? "s" : ""}. What would you like to do with the views in this group?`}
      options={[
        {
          label: "Delete Group Only",
          description: "Move all views to the Default group",
          value: "group-only",
          variant: "primary",
        },
        {
          label: "Delete Group & Views",
          description: "Permanently delete the group and all its views",
          value: "group-and-views",
          variant: "danger",
        },
      ]}
      onSelect={(value) => onConfirm(value as "group-only" | "group-and-views")}
      onCancel={onCancel}
    />
  );
};

export default DeleteConfirmationModal;
