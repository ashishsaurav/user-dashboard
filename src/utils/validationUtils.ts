export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isNotEmpty = (value: string): boolean => {
  return value.trim().length > 0;
};

export const hasMinLength = (value: string, minLength: number): boolean => {
  return value.length >= minLength;
};

export const hasMaxLength = (value: string, maxLength: number): boolean => {
  return value.length <= maxLength;
};

export const validateRequired = (value: string, fieldName: string): string | null => {
  if (!isNotEmpty(value)) {
    return `${fieldName} is required`;
  }
  return null;
};

export const validateUrl = (url: string): string | null => {
  if (!isValidUrl(url)) {
    return "Please enter a valid URL";
  }
  return null;
};

export const validateForm = (
  values: Record<string, any>,
  rules: Record<string, (value: any) => string | null>
): Record<string, string> => {
  const errors: Record<string, string> = {};

  Object.keys(rules).forEach((field) => {
    const error = rules[field](values[field]);
    if (error) {
      errors[field] = error;
    }
  });

  return errors;
};
