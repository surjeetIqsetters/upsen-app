import { format, parseISO, isValid, differenceInMinutes, differenceInHours } from 'date-fns';
import { Colors, DateFormats } from './constants';

// Date utilities
export const formatDate = (date: string | Date | null | undefined, formatStr?: string): string => {
  if (!date) return '-';
  const parsedDate = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(parsedDate)) return '-';
  return format(parsedDate, formatStr || DateFormats.display);
};

export const formatTime = (date: string | Date | null | undefined): string => {
  if (!date) return '-';
  const parsedDate = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(parsedDate)) return '-';
  return format(parsedDate, DateFormats.displayTime);
};

export const formatDateTime = (date: string | Date | null | undefined): string => {
  if (!date) return '-';
  const parsedDate = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(parsedDate)) return '-';
  return format(parsedDate, DateFormats.displayDateTime);
};

export const formatMonthYear = (date: string | Date | null | undefined): string => {
  if (!date) return '-';
  const parsedDate = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(parsedDate)) return '-';
  return format(parsedDate, DateFormats.monthYear);
};

export const getRelativeTime = (date: string | Date): string => {
  const parsedDate = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(parsedDate)) return '';
  
  const now = new Date();
  const diffInMinutes = differenceInMinutes(now, parsedDate);
  
  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  
  const diffInHours = differenceInHours(now, parsedDate);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  
  return formatDate(parsedDate);
};

export const calculateDuration = (start: string | Date, end: string | Date): string => {
  const startDate = typeof start === 'string' ? parseISO(start) : start;
  const endDate = typeof end === 'string' ? parseISO(end) : end;
  
  if (!isValid(startDate) || !isValid(endDate)) return '-';
  
  const diffInMinutes = differenceInMinutes(endDate, startDate);
  const hours = Math.floor(diffInMinutes / 60);
  const minutes = diffInMinutes % 60;
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
};

// String utilities
export const capitalize = (str: string): string => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const capitalizeWords = (str: string): string => {
  if (!str) return '';
  return str.replace(/\b\w/g, (char) => char.toUpperCase());
};

export const truncate = (str: string, maxLength: number): string => {
  if (!str || str.length <= maxLength) return str;
  return str.substring(0, maxLength) + '...';
};

export const maskCardNumber = (cardNumber: string): string => {
  if (!cardNumber || cardNumber.length < 4) return '';
  const last4 = cardNumber.slice(-4);
  return `**** **** **** ${last4}`;
};

export const formatPhoneNumber = (phone: string, countryCode?: string): string => {
  if (!phone) return '';
  const cleanPhone = phone.replace(/\D/g, '');
  if (countryCode) {
    return `${countryCode} ${cleanPhone}`;
  }
  return cleanPhone;
};

export const formatCurrency = (amount: number, currency = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
};

export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('en-US').format(num);
};

// Validation utilities
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^\+?[\d\s-]{10,}$/;
  return phoneRegex.test(phone);
};

export const isValidPassword = (password: string): boolean => {
  // At least 8 characters, 1 uppercase, 1 number
  const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
  return passwordRegex.test(password);
};

// Color utilities
export const getStatusColor = (status: string): string => {
  const statusMap: Record<string, string> = {
    attending: Colors.primary,
    late: Colors.warning,
    absent: Colors.error,
    on_leave: Colors.info,
    sick_leave: Colors.error,
    waiting: Colors.warning,
    approved: Colors.success,
    rejected: Colors.error,
    cancelled: Colors.gray500,
    pending: Colors.warning,
    in_progress: Colors.info,
    completed: Colors.success,
    casual: Colors.primary,
    sick: Colors.error,
    annual: Colors.success,
    unpaid: Colors.gray500,
    low: Colors.info,
    medium: Colors.warning,
    high: Colors.error,
  };
  return statusMap[status.toLowerCase()] || Colors.gray500;
};

export const getStatusBgColor = (status: string): string => {
  const statusMap: Record<string, string> = {
    waiting: Colors.warningLight,
    approved: Colors.successLight,
    rejected: Colors.errorLight,
    cancelled: Colors.gray100,
    pending: Colors.warningLight,
    completed: Colors.successLight,
  };
  return statusMap[status.toLowerCase()] || Colors.gray100;
};

// Array utilities
export const groupBy = <T>(array: T[], key: keyof T): Record<string, T[]> => {
  return array.reduce((result, item) => {
    const groupKey = String(item[key]);
    if (!result[groupKey]) {
      result[groupKey] = [];
    }
    result[groupKey].push(item);
    return result;
  }, {} as Record<string, T[]>);
};

export const uniqueBy = <T>(array: T[], key: keyof T): T[] => {
  const seen = new Set();
  return array.filter((item) => {
    const val = item[key];
    if (seen.has(val)) return false;
    seen.add(val);
    return true;
  });
};

export const sortBy = <T>(array: T[], key: keyof T, order: 'asc' | 'desc' = 'asc'): T[] => {
  return [...array].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];
    if (aVal < bVal) return order === 'asc' ? -1 : 1;
    if (aVal > bVal) return order === 'asc' ? 1 : -1;
    return 0;
  });
};

// Object utilities
export const pick = <T extends Record<string, unknown>, K extends keyof T>(
  obj: T,
  keys: K[]
): Pick<T, K> => {
  const result = {} as Pick<T, K>;
  keys.forEach((key) => {
    if (key in obj) {
      result[key] = obj[key];
    }
  });
  return result;
};

export const omit = <T extends Record<string, unknown>, K extends keyof T>(
  obj: T,
  keys: K[]
): Omit<T, K> => {
  const result = { ...obj };
  keys.forEach((key) => {
    delete result[key];
  });
  return result;
};

export const isEmpty = (obj: Record<string, unknown> | null | undefined): boolean => {
  if (!obj) return true;
  return Object.keys(obj).length === 0;
};

// Debounce utility
export const debounce = <T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Throttle utility
export const throttle = <T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle = false;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

// Generate initials from name
export const getInitials = (name: string): string => {
  if (!name) return '';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

// Generate random color based on string
export const getColorFromString = (str: string): string => {
  const colors = [
    Colors.primary,
    Colors.secondary,
    Colors.accent,
    Colors.info,
    Colors.success,
    Colors.warning,
  ];
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

// File utilities
export const getFileExtension = (filename: string): string => {
  return filename.slice(((filename.lastIndexOf('.') - 1) >>> 0) + 2);
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Deep clone
export const deepClone = <T>(obj: T): T => {
  return JSON.parse(JSON.stringify(obj));
};

// Sleep utility
export const sleep = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

// Retry utility
export const retry = async <T>(
  fn: () => Promise<T>,
  attempts: number,
  delay: number
): Promise<T> => {
  try {
    return await fn();
  } catch (error) {
    if (attempts <= 1) throw error;
    await sleep(delay);
    return retry(fn, attempts - 1, delay);
  }
};
