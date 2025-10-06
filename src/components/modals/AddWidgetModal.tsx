import React, { useState } from "react";
import { Widget } from "../../types";
import { AddItemModal } from "../shared/AddItemModal";
import "../shared/styles/AddItemModal.css";
import "./styles/AddModals.css";

interface AddWidgetModalProps {
  onAddWidgets: (widgets: Widget[]) => void;
  onClose: () => void;
  availableWidgets: Widget[];
}

const AddWidgetModal: React.FC<AddWidgetModalProps> = ({
  onAddWidgets,
  onClose,
  availableWidgets,
}) => {
  const [selectedWidgets, setSelectedWidgets] = useState<Widget[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredWidgets = availableWidgets.filter((widget) =>
    widget.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleToggleSelection = (widget: Widget) => {
    setSelectedWidgets((prevSelected) => {
      const isAlreadySelected = prevSelected.some((w) => w.id === widget.id);

      if (isAlreadySelected) {
        return prevSelected.filter((w) => w.id !== widget.id);
      } else {
        return [...prevSelected, widget];
      }
    });
  };

  const handleSelectAll = () => {
    const allCurrentlySelected = filteredWidgets.every((widget) =>
      selectedWidgets.some((sw) => sw.id === widget.id)
    );

    if (allCurrentlySelected) {
      // Deselect all filtered widgets
      setSelectedWidgets((prevSelected) =>
        prevSelected.filter(
          (sw) => !filteredWidgets.some((fw) => fw.id === sw.id)
        )
      );
    } else {
      // Select all filtered widgets
      const newSelections = filteredWidgets.filter(
        (fw) => !selectedWidgets.some((sw) => sw.id === fw.id)
      );
      setSelectedWidgets((prevSelected) => [...prevSelected, ...newSelections]);
    }
  };

  const handleClearAll = () => {
    setSelectedWidgets([]);
  };

  const handleConfirm = () => {
    if (selectedWidgets.length > 0) {
      onAddWidgets(selectedWidgets);
    }
  };

  const renderWidgetExtra = (widget: Widget) => (
    <div className="widget-roles">
      <span className="roles-label">Roles: </span>
      {widget.userRoles.map((role, index) => (
        <span key={role} className={`role-badge role-${role}`}>
          {role}
          {index < widget.userRoles.length - 1 && ", "}
        </span>
      ))}
    </div>
  );

  return (
    <AddItemModal
      title="Widget"
      items={filteredWidgets}
      selectedItems={selectedWidgets}
      onToggleSelection={handleToggleSelection}
      onSelectAll={handleSelectAll}
      onClearAll={handleClearAll}
      onConfirm={handleConfirm}
      onClose={onClose}
      searchTerm={searchTerm}
      onSearchChange={setSearchTerm}
      getItemId={(widget) => widget.id}
      getItemName={(widget) => widget.name}
      getItemUrl={(widget) => widget.url}
      renderItemExtra={renderWidgetExtra}
    />
  );
};

export default AddWidgetModal;
