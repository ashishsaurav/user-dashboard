import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "small" | "medium" | "large";
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  size = "medium",
  className = "",
  children,
  ...props
}) => {
  const variantClass = `btn-${variant}`;
  const sizeClass = `btn-${size}`;

  return (
    <button
      className={`btn ${variantClass} ${sizeClass} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode;
  variant?: "default" | "danger" | "primary";
  size?: "small" | "medium";
}

export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  variant = "default",
  size = "medium",
  className = "",
  ...props
}) => {
  const variantClass = `icon-btn-${variant}`;
  const sizeClass = `icon-btn-${size}`;

  return (
    <button
      className={`icon-btn ${variantClass} ${sizeClass} ${className}`}
      {...props}
    >
      {icon}
    </button>
  );
};
