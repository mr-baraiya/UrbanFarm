/**
 * Centralized Validation Rules & Helpers for UrbanFarm
 * Provides consistent validation across all frontend forms and user inputs.
 */

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const PHONE_REGEX = /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]{6,15}$/;
export const URL_REGEX = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;

// ==========================================
// 1. Primitive Boolean Field Validators
// ==========================================

export const validateEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  return EMAIL_REGEX.test(email.trim());
};

export const validatePassword = (password, minLength = 6) => {
  if (!password || typeof password !== 'string') return false;
  return password.length >= minLength;
};

export const validateRequired = (value) => {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  return true;
};

export const validateMinLength = (value, min) => {
  if (!value) return false;
  return String(value).trim().length >= min;
};

export const validateMaxLength = (value, max) => {
  if (!value) return true;
  return String(value).trim().length <= max;
};

export const validateNumber = (value, { min, max, positive = false, nonNegative = false } = {}) => {
  const num = Number(value);
  if (isNaN(num)) return false;
  if (positive && num <= 0) return false;
  if (nonNegative && num < 0) return false;
  if (min !== undefined && num < min) return false;
  if (max !== undefined && num > max) return false;
  return true;
};

export const validatePositiveNumber = (value) => {
  const num = Number(value);
  return !isNaN(num) && num > 0;
};

export const validateNonNegativeNumber = (value) => {
  const num = Number(value);
  return !isNaN(num) && num >= 0;
};

export const validatePhone = (phone) => {
  if (!phone) return true; // Optional phone
  return PHONE_REGEX.test(phone.trim());
};

// ==========================================
// 2. Centralized Rule Definitions
// ==========================================

export const VALIDATION_RULES = {
  // Authentication & Users
  name: {
    required: true,
    minLength: 2,
    maxLength: 60,
    label: 'Full name',
  },
  email: {
    required: true,
    isEmail: true,
    label: 'Email address',
  },
  password: {
    required: true,
    minLength: 6,
    label: 'Password',
  },
  role: {
    required: true,
    label: 'User role',
  },

  // Gardens
  gardenName: {
    required: true,
    minLength: 2,
    maxLength: 80,
    label: 'Garden name',
  },
  gardenSize: {
    nonNegative: true,
    label: 'Garden size',
  },
  gardenLocation: {
    maxLength: 100,
    label: 'Location',
  },

  // Plants
  plantName: {
    required: true,
    minLength: 2,
    maxLength: 80,
    label: 'Plant name',
  },
  gardenId: {
    required: true,
    label: 'Garden selection',
  },
  waterFrequency: {
    required: true,
    min: 1,
    label: 'Watering frequency',
  },

  // Schedule & Tasks
  taskTitle: {
    required: true,
    minLength: 2,
    maxLength: 100,
    label: 'Task title',
  },
  dueDate: {
    required: true,
    label: 'Due date',
  },

  // Community Posts
  postTitle: {
    required: true,
    minLength: 3,
    maxLength: 150,
    label: 'Post title',
  },
  postContent: {
    required: true,
    minLength: 5,
    maxLength: 5000,
    label: 'Post content',
  },
  commentContent: {
    required: true,
    minLength: 1,
    maxLength: 1000,
    label: 'Comment content',
  },

  // Harvest Tracker
  harvestAmount: {
    required: true,
    isPositive: true,
    label: 'Harvest amount',
  },

  // Contact & Guest Leads
  contactName: {
    required: true,
    minLength: 2,
    maxLength: 60,
    label: 'Full name',
  },
  contactEmail: {
    required: true,
    isEmail: true,
    label: 'Email address',
  },
  contactPhone: {
    isPhone: true,
    label: 'Phone number',
  },
  contactSubject: {
    required: true,
    minLength: 2,
    label: 'Subject',
  },
  contactMessage: {
    required: true,
    minLength: 10,
    maxLength: 3000,
    label: 'Message',
  },
  leadMessage: {
    required: true,
    minLength: 5,
    maxLength: 3000,
    label: 'Inquiry message',
  },
};

// ==========================================
// 3. Field Validator Engine
// ==========================================

export const validateField = (value, rule = {}) => {
  const label = rule.label || 'This field';

  // 1. Required Check
  if (rule.required) {
    if (value === null || value === undefined || (typeof value === 'string' && !value.trim()) || (Array.isArray(value) && value.length === 0)) {
      return rule.requiredMessage || `${label} is required`;
    }
  }

  // If value is empty and not required, skip format checks
  if (value === null || value === undefined || (typeof value === 'string' && value.trim() === '')) {
    return null;
  }

  const strVal = String(value).trim();

  // 2. Email Check
  if (rule.isEmail && !validateEmail(strVal)) {
    return rule.emailMessage || 'Please enter a valid email address';
  }

  // 3. Phone Check
  if (rule.isPhone && !validatePhone(strVal)) {
    return rule.phoneMessage || 'Please enter a valid phone number';
  }

  // 4. Min Length Check
  if (rule.minLength !== undefined && strVal.length < rule.minLength) {
    return rule.minLengthMessage || `${label} must be at least ${rule.minLength} characters`;
  }

  // 5. Max Length Check
  if (rule.maxLength !== undefined && strVal.length > rule.maxLength) {
    return rule.maxLengthMessage || `${label} cannot exceed ${rule.maxLength} characters`;
  }

  // 6. Positive Number Check
  if (rule.isPositive) {
    const num = Number(value);
    if (isNaN(num) || num <= 0) {
      return `${label} must be greater than 0`;
    }
  }

  // 7. Non-Negative Number Check
  if (rule.nonNegative) {
    const num = Number(value);
    if (isNaN(num) || num < 0) {
      return `${label} cannot be negative`;
    }
  }

  // 8. Range checks (min / max)
  if (rule.min !== undefined) {
    const num = Number(value);
    if (isNaN(num) || num < rule.min) {
      return `${label} must be at least ${rule.min}`;
    }
  }

  if (rule.max !== undefined) {
    const num = Number(value);
    if (isNaN(num) || num > rule.max) {
      return `${label} cannot exceed ${rule.max}`;
    }
  }

  // 9. Custom Validator
  if (typeof rule.validate === 'function') {
    const customErr = rule.validate(value);
    if (customErr) return customErr;
  }

  return null;
};

// ==========================================
// 4. Generic Form Validator
// ==========================================

export const validateForm = (formData, rules) => {
  const errors = {};
  let firstError = null;

  for (const [field, rule] of Object.entries(rules)) {
    const value = formData ? formData[field] : undefined;
    const error = validateField(value, rule);
    if (error) {
      errors[field] = error;
      if (!firstError) {
        firstError = error;
      }
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    firstError,
  };
};

// ==========================================
// 5. Pre-configured Form Schemas & Validations
// ==========================================

export const validateLoginForm = (data) => {
  return validateForm(data, {
    email: VALIDATION_RULES.email,
    password: { required: true, label: 'Password' },
  });
};

export const validateRegisterForm = (data) => {
  return validateForm(data, {
    name: VALIDATION_RULES.name,
    email: VALIDATION_RULES.email,
    password: VALIDATION_RULES.password,
  });
};

export const validateContactForm = (data) => {
  return validateForm(data, {
    name: VALIDATION_RULES.contactName,
    email: VALIDATION_RULES.contactEmail,
    phone: VALIDATION_RULES.contactPhone,
    subject: VALIDATION_RULES.contactSubject,
    message: VALIDATION_RULES.contactMessage,
  });
};

export const validateGardenForm = (data) => {
  return validateForm(data, {
    name: VALIDATION_RULES.gardenName,
    size: VALIDATION_RULES.gardenSize,
  });
};

export const validatePlantForm = (data) => {
  return validateForm(data, {
    name: VALIDATION_RULES.plantName,
    gardenId: VALIDATION_RULES.gardenId,
    waterFrequency: VALIDATION_RULES.waterFrequency,
  });
};

export const validateTaskForm = (data) => {
  return validateForm(data, {
    title: VALIDATION_RULES.taskTitle,
    dueDate: VALIDATION_RULES.dueDate,
  });
};

export const validatePostForm = (data, isContentModeration = false) => {
  return validateForm(data, {
    title: VALIDATION_RULES.postTitle,
    content: isContentModeration
      ? { ...VALIDATION_RULES.postContent, minLength: 10 }
      : VALIDATION_RULES.postContent,
  });
};

export const validateHarvestForm = (data) => {
  return validateForm(data, {
    amount: VALIDATION_RULES.harvestAmount,
  });
};

export const validateUserForm = (data) => {
  return validateForm(data, {
    name: VALIDATION_RULES.name,
    email: VALIDATION_RULES.email,
  });
};

export const validateLeadForm = (data) => {
  return validateForm(data, {
    name: VALIDATION_RULES.contactName,
    email: VALIDATION_RULES.contactEmail,
    phone: VALIDATION_RULES.contactPhone,
    subject: { required: true, label: 'Subject' },
    message: VALIDATION_RULES.leadMessage,
  });
};