import React from "react";
import { Widget } from "../../types";
import { EditItemModal } from "../shared/EditItemModal";

interface EditWidgetModalProps {
  widget: Widget;
  onSave: (widget: Widget) => void;
  onClose: () => void;
}

/**
 * @deprecated Use EditItemModal from shared/EditItemModal instead
 */
const EditWidgetModal: React.FC<EditWidgetModalProps> = ({
  widget,
  onSave,
  onClose,
}) => {
  return (
    <EditItemModal
      item={widget}
      itemType="Widget"
      onSave={onSave}
      onClose={onClose}
    />
  );
};

export default EditWidgetModal;
