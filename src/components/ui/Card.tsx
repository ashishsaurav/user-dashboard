import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = "" }) => {
  return <div className={`card ${className}`}>{children}</div>;
};

interface CardHeaderProps {
  children: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}

export const CardHeader: React.FC<CardHeaderProps> = ({
  children,
  icon,
  className = "",
}) => {
  return (
    <div className={`card-header ${className}`}>
      {icon && <div className="header-icon">{icon}</div>}
      <div className="header-content">{children}</div>
    </div>
  );
};

interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

export const CardContent: React.FC<CardContentProps> = ({
  children,
  className = "",
}) => {
  return <div className={`card-content ${className}`}>{children}</div>;
};
