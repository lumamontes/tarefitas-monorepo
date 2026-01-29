/**
 * Time utilities for calm, non-judgmental date handling
 * No urgency language or countdowns
 */

import { format, isToday, isTomorrow, isYesterday, differenceInDays, startOfDay, parseISO } from 'date-fns';

export type TimeDistance = 'today' | 'soon' | 'later' | 'far' | 'past';

/**
 * Format a Date object to YYYY-MM-DD string (local time, not UTC)
 */
export function formatDateLocal(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Parse a YYYY-MM-DD string to a Date object (local time, not UTC)
 */
export function parseDateLocal(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/**
 * Get today's date as YYYY-MM-DD string
 */
export function getTodayString(): string {
  return formatDateLocal(new Date());
}

/**
 * Check if two date strings represent the same day
 */
export function isSameDay(dateStr1: string, dateStr2: string): boolean {
  return dateStr1 === dateStr2;
}

/**
 * Format duration in minutes to human-readable string
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) {
    return `${hours}h`;
  }
  
  return `${hours}h ${remainingMinutes}m`;
}

/**
 * Format relative time (e.g., "2 hours ago", "Yesterday")
 */
export function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) {
    return 'just now';
  }
  
  if (diffMins < 60) {
    return `${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'} ago`;
  }
  
  if (diffHours < 24) {
    return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
  }
  
  if (diffDays === 1) {
    return 'yesterday';
  }
  
  if (diffDays < 7) {
    return `${diffDays} days ago`;
  }
  
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
}

/**
 * Format time estimate with "about" prefix for gentler presentation
 */
export function formatTimeEstimate(minutes: number): string {
  if (minutes < 5) {
    return 'a few minutes';
  }
  
  if (minutes < 60) {
    return `about ${minutes} minutes`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) {
    return `about ${hours} ${hours === 1 ? 'hour' : 'hours'}`;
  }
  
  return `about ${hours}h ${remainingMinutes}m`;
}

/**
 * Get visual distance indicator (not numeric countdown)
 */
export function getTimeDistance(date: Date | string | null | undefined): TimeDistance | null {
  if (!date) return null;
  
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  const today = startOfDay(new Date());
  const targetDate = startOfDay(dateObj);
  const daysDiff = differenceInDays(targetDate, today);

  if (daysDiff < 0) return 'past';
  if (daysDiff === 0) return 'today';
  if (daysDiff <= 3) return 'soon';
  if (daysDiff <= 14) return 'later';
  return 'far';
}

/**
 * Format date for display (calm, neutral language)
 */
export function formatDateDisplay(date: Date | string | null | undefined): string {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  
  if (isToday(dateObj)) return 'Today';
  if (isTomorrow(dateObj)) return 'Tomorrow';
  if (isYesterday(dateObj)) return 'Yesterday';
  
  return format(dateObj, 'MMM d, yyyy');
}

/**
 * Format date for calendar display
 */
export function formatCalendarDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, 'yyyy-MM-dd');
}

/**
 * Parse date string to Date object
 */
export function parseDate(dateString: string): Date {
  return parseISO(dateString);
}

/**
 * Check if date is in the past
 */
export function isPastDate(date: Date | string | null | undefined): boolean {
  if (!date) return false;
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return dateObj < startOfDay(new Date());
}
