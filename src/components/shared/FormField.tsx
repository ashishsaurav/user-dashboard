import React from "react";

interface FormFieldProps {
  label: string;
  type?: "text" | "url" | "email" | "password" | "number";
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
  helpText?: string;
  className?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  required = false,
  error,
  helpText,
  className = "",
}) => {
  return (
    <div className={`form-row ${className}`}>
      <div className="input-group">
        <label className="modern-label">
          {label}
          {required && <span className="required-marker">*</span>}
        </label>
        <input
          type={type}
          className={`modern-input ${error ? "error" : ""}`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
        />
        {error && <span className="field-error">{error}</span>}
        {helpText && !error && <span className="field-help">{helpText}</span>}
      </div>
    </div>
  );
};

interface CheckboxGroupProps {
  label: string;
  options: Array<{
    value: string;
    label: string;
    disabled?: boolean;
    locked?: boolean;
  }>;
  selectedValues: string[];
  onChange: (value: string, checked: boolean) => void;
  helpText?: string;
  className?: string;
}

export const CheckboxGroup: React.FC<CheckboxGroupProps> = ({
  label,
  options,
  selectedValues,
  onChange,
  helpText,
  className = "",
}) => {
  return (
    <div className={`permission-section ${className}`}>
      <label className="modern-label">{label}</label>
      {helpText && <p className="admin-notice">{helpText}</p>}
      <div className="checkbox-grid">
        {options.map((option) => (
          <label
            key={option.value}
            className={`modern-checkbox ${
              option.disabled ? "admin-locked disabled" : ""
            }`}
          >
            <input
              type="checkbox"
              checked={selectedValues.includes(option.value)}
              onChange={(e) => onChange(option.value, e.target.checked)}
              disabled={option.disabled}
            />
            <span className="checkmark"></span>
            <span className="checkbox-label">
              {option.label}
              {option.locked && <span className="locked-indicator">🔒</span>}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
};

interface FormSectionProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

export const FormSection: React.FC<FormSectionProps> = ({
  title,
  children,
  className = "",
}) => {
  return (
    <div className={`form-section ${className}`}>
      <h3 className="section-title">{title}</h3>
      {children}
    </div>
  );
};
