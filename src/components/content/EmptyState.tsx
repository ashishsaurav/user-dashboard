import React from "react";

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  message: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  message,
}) => {
  return (
    <div className="content-empty">
      <div className="empty-state">
        {icon}
        <h3>{title}</h3>
        <p>{message}</p>
      </div>
    </div>
  );
};
