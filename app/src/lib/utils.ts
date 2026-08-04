import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Date formatting
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// Currency formatting (INR)
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

// Number formatting
export function formatNumber(num: number, decimals = 0): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num);
}

// Format large numbers (K, M)
export function formatCompact(num: number): string {
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    compactDisplay: 'short',
  }).format(num);
}

// Status color helpers
export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    // Vehicle statuses
    available: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    on_trip: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    in_shop: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    retired: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
    
    // Driver statuses
    on_duty: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    off_duty: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
    suspended: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
    
    // Trip statuses
    draft: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
    dispatched: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    in_progress_trip: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    completed: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    cancelled: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
    
    // Maintenance statuses
    scheduled: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    in_progress_maint: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    completed_maint: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  };
  
  return colors[status] || 'bg-slate-500/20 text-slate-400 border-slate-500/30';
}

// Status label helpers
export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    available: 'Available',
    on_trip: 'On Trip',
    in_shop: 'In Shop',
    retired: 'Retired',
    on_duty: 'On Duty',
    off_duty: 'Off Duty',
    suspended: 'Suspended',
    draft: 'Draft',
    dispatched: 'Dispatched',
    in_progress: 'In Progress',
    completed: 'Completed',
    cancelled: 'Cancelled',
    scheduled: 'Scheduled',
  };
  
  return labels[status] || status;
}

// Vehicle type icon helper
export function getVehicleTypeIcon(type: string): string {
  const icons: Record<string, string> = {
    truck: 'Truck',
    van: 'Van',
    bike: 'Bike',
  };
  return icons[type] || 'Vehicle';
}

// Generate unique ID
export function generateId(prefix: string = ''): string {
  return `${prefix}${Date.now().toString(36)}${Math.random().toString(36).substr(2, 5)}`;
}

// Validation helpers
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidLicensePlate(plate: string): boolean {
  return plate.length >= 3 && plate.length <= 10;
}

// Calculate days until expiry
export function daysUntilExpiry(expiryDate: string): number {
  const today = new Date();
  const expiry = new Date(expiryDate);
  const diffTime = expiry.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

// Check if date is expired
export function isExpired(dateString: string): boolean {
  const today = new Date();
  const date = new Date(dateString);
  return date < today;
}

// Calculate percentage
export function calculatePercentage(value: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
}

// Debounce function
export function debounce<T extends (...args: any[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Local storage helpers
export function setLocalStorage(key: string, value: any): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('Error saving to localStorage:', e);
  }
}

export function getLocalStorage<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (e) {
    console.error('Error reading from localStorage:', e);
    return defaultValue;
  }
}

export function removeLocalStorage(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (e) {
    console.error('Error removing from localStorage:', e);
  }
}
