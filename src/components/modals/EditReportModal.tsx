import React from "react";
import { Report } from "../../types";
import { EditItemModal } from "../shared/EditItemModal";

interface EditReportModalProps {
  report: Report;
  onSave: (report: Report) => void;
  onClose: () => void;
}

const EditReportModal: React.FC<EditReportModalProps> = ({
  report,
  onSave,
  onClose,
}) => {
  return (
    <EditItemModal
      item={report}
      itemType="Report"
      onSave={onSave}
      onClose={onClose}
    />
  );
};

export default EditReportModal;
