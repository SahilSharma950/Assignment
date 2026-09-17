/**
 * Frontend utility functions.
 * Domain-specific utilities are co-located with their feature modules.
 * This file contains general-purpose helpers.
 */

// ─── String Utilities ──────────────────────────────────────────────────────────

/**
 * Truncates a string to the given length, appending '...' if needed.
 */
export const truncate = (str: string, maxLength: number): string => {
  if (str.length <= maxLength) return str;
  return `${str.slice(0, maxLength - 3)}...`;
};

/**
 * Converts a string to title case.
 */
export const toTitleCase = (str: string): string =>
  str.replace(/\b\w/g, (char) => char.toUpperCase());

/**
 * Generates initials from a full name (e.g., "John Doe" → "JD").
 */
export const getInitials = (name: string, maxChars = 2): string =>
  name
    .split(' ')
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
    .slice(0, maxChars);

// ─── Date Utilities ────────────────────────────────────────────────────────────

/**
 * Formats a date as a relative time string (e.g., "2 hours ago").
 */
export const formatRelativeTime = (date: Date | string): string => {
  const now = new Date();
  const then = new Date(date);
  const diffMs = now.getTime() - then.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSeconds < 60) return 'just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return then.toLocaleDateString();
};

/**
 * Shared due-date badge styling — red if overdue or due within 24h, orange
 * otherwise. Kept in one place so every due-date badge in the app (task
 * cards, dashboard deadlines, etc.) looks the same instead of drifting.
 */
export const getDueDateBadge = (dueDate: string) => {
  const isUrgent = new Date(dueDate).getTime() - Date.now() < 24 * 60 * 60 * 1000;
  const label = new Date(dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  const colorClasses = isUrgent
    ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
    : 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';

  return { label, isUrgent, colorClasses };
};

// ─── Class Name Utilities ──────────────────────────────────────────────────────

/**
 * Merges class names, filtering out falsy values.
 * Lightweight alternative to `clsx`.
 */
export const cn = (...classes: (string | boolean | undefined | null)[]): string =>
  classes.filter(Boolean).join(' ');

// ─── Number Utilities ──────────────────────────────────────────────────────────

/**
 * Formats a number with K/M suffixes (e.g., 1500 → "1.5K").
 */
export const formatCount = (count: number): string => {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(1)}K`;
  return count.toString();
};

// ─── File Utilities ────────────────────────────────────────────────────────────

/**
 * Formats a file size in bytes to a human-readable string.
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

// ─── Async Utilities ───────────────────────────────────────────────────────────

/**
 * Delays execution for the given number of milliseconds.
 */
export const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));
