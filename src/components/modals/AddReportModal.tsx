import React, { useState } from "react";
import { Report } from "../../types";
import { AddItemModal } from "../shared/AddItemModal";
import "../shared/styles/AddItemModal.css";
import "./styles/AddModals.css";

interface AddReportModalProps {
  onAddReports: (reports: Report[]) => void;
  onClose: () => void;
  availableReports: Report[];
}

const AddReportModal: React.FC<AddReportModalProps> = ({
  onAddReports,
  onClose,
  availableReports,
}) => {
  const [selectedReports, setSelectedReports] = useState<Report[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredReports = availableReports.filter((report) =>
    report.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleToggleSelection = (report: Report) => {
    setSelectedReports((prevSelected) => {
      const isAlreadySelected = prevSelected.some((r) => r.id === report.id);

      if (isAlreadySelected) {
        return prevSelected.filter((r) => r.id !== report.id);
      } else {
        return [...prevSelected, report];
      }
    });
  };

  const handleSelectAll = () => {
    const allCurrentlySelected = filteredReports.every((report) =>
      selectedReports.some((sr) => sr.id === report.id)
    );

    if (allCurrentlySelected) {
      // Deselect all filtered reports
      setSelectedReports((prevSelected) =>
        prevSelected.filter(
          (sr) => !filteredReports.some((fr) => fr.id === sr.id)
        )
      );
    } else {
      // Select all filtered reports
      const newSelections = filteredReports.filter(
        (fr) => !selectedReports.some((sr) => sr.id === fr.id)
      );
      setSelectedReports((prevSelected) => [...prevSelected, ...newSelections]);
    }
  };

  const handleClearAll = () => {
    setSelectedReports([]);
  };

  const handleConfirm = () => {
    if (selectedReports.length > 0) {
      onAddReports(selectedReports);
    }
  };

  const renderReportExtra = (report: Report) => (
    <div className="report-roles">
      <span className="roles-label">Roles: </span>
      {report.userRoles.map((role, index) => (
        <span key={role} className={`role-badge role-${role}`}>
          {role}
          {index < report.userRoles.length - 1 && ", "}
        </span>
      ))}
    </div>
  );

  return (
    <AddItemModal
      title="Reports"
      items={filteredReports}
      selectedItems={selectedReports}
      onToggleSelection={handleToggleSelection}
      onSelectAll={handleSelectAll}
      onClearAll={handleClearAll}
      onConfirm={handleConfirm}
      onClose={onClose}
      searchTerm={searchTerm}
      onSearchChange={setSearchTerm}
      getItemId={(report) => report.id}
      getItemName={(report) => report.name}
      getItemUrl={(report) => report.url}
      renderItemExtra={renderReportExtra}
    />
  );
};

export default AddReportModal;