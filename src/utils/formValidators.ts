/**
 * Reusable form field validators
 * Returns error message string or undefined if valid
 */

export const validators = {
  required: (fieldName: string = "This field") => (value: any): string | undefined => {
    if (!value || (typeof value === "string" && !value.trim())) {
      return `${fieldName} is required`;
    }
    return undefined;
  },

  email: (value: string): string | undefined => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (value && !emailRegex.test(value)) {
      return "Please enter a valid email address";
    }
    return undefined;
  },

  url: (value: string): string | undefined => {
    if (!value) return undefined;
    try {
      new URL(value);
      return undefined;
    } catch {
      return "Please enter a valid URL";
    }
  },

  minLength: (min: number) => (value: string): string | undefined => {
    if (value && value.length < min) {
      return `Must be at least ${min} characters`;
    }
    return undefined;
  },

  maxLength: (max: number) => (value: string): string | undefined => {
    if (value && value.length > max) {
      return `Must be at most ${max} characters`;
    }
    return undefined;
  },

  pattern: (regex: RegExp, message: string) => (value: string): string | undefined => {
    if (value && !regex.test(value)) {
      return message;
    }
    return undefined;
  },

  minValue: (min: number) => (value: number): string | undefined => {
    if (value !== undefined && value < min) {
      return `Must be at least ${min}`;
    }
    return undefined;
  },

  maxValue: (max: number) => (value: number): string | undefined => {
    if (value !== undefined && value > max) {
      return `Must be at most ${max}`;
    }
    return undefined;
  },

  oneOf: (options: any[], fieldName: string = "Value") => (value: any): string | undefined => {
    if (value && !options.includes(value)) {
      return `${fieldName} must be one of: ${options.join(", ")}`;
    }
    return undefined;
  },

  custom: (validator: (value: any) => boolean, message: string) => (value: any): string | undefined => {
    if (!validator(value)) {
      return message;
    }
    return undefined;
  },
};

/**
 * Combine multiple validators
 */
export const combineValidators = (...validators: Array<(value: any) => string | undefined>) => {
  return (value: any): string | undefined => {
    for (const validator of validators) {
      const error = validator(value);
      if (error) return error;
    }
    return undefined;
  };
};

/**
 * Common validation combinations
 */
export const commonValidations = {
  requiredEmail: combineValidators(
    validators.required("Email"),
    validators.email
  ),

  requiredUrl: combineValidators(
    validators.required("URL"),
    validators.url
  ),

  requiredString: (fieldName: string, min?: number, max?: number) => {
    const validatorsList = [validators.required(fieldName)];
    if (min) validatorsList.push(validators.minLength(min));
    if (max) validatorsList.push(validators.maxLength(max));
    return combineValidators(...validatorsList);
  },

  requiredNumber: (fieldName: string, min?: number, max?: number) => {
    const validatorsList = [validators.required(fieldName)];
    if (min !== undefined) validatorsList.push(validators.minValue(min));
    if (max !== undefined) validatorsList.push(validators.maxValue(max));
    return combineValidators(...validatorsList);
  },
};

/**
 * Example usage:
 * 
 * const { values, errors, handleSubmit } = useForm({
 *   initialValues: { name: "", email: "", url: "" },
 *   validations: {
 *     name: validators.required("Name"),
 *     email: commonValidations.requiredEmail,
 *     url: validators.url,
 *   },
 *   onSubmit: handleSave,
 * });
 */
