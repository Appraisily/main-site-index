/**
 * Shared formatting utilities for all Appraisily applications
 */

/**
 * Formats a number as a currency string
 * @param value The number to format
 * @param currency The currency code (default: USD)
 * @param locale The locale to use for formatting (default: en-US)
 * @returns Formatted currency string
 */
export function formatCurrency(
  value: number, 
  currency: string = 'USD', 
  locale: string = 'en-US'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Formats a date object or ISO string into a readable date string
 * @param date Date object or ISO date string
 * @param format The format to use ('short', 'medium', 'long', 'full')
 * @param locale The locale to use for formatting (default: en-US)
 * @returns Formatted date string
 */
export function formatDate(
  date: Date | string,
  format: 'short' | 'medium' | 'long' | 'full' = 'medium',
  locale: string = 'en-US'
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: format === 'short' ? 'numeric' : format === 'medium' ? 'short' : 'long',
    day: 'numeric',
  };
  
  if (format === 'full') {
    options.weekday = 'long';
  }
  
  return new Intl.DateTimeFormat(locale, options).format(dateObj);
}

/**
 * Truncates a string to a maximum length and adds an ellipsis
 * @param text The text to truncate
 * @param maxLength Maximum length before truncation
 * @param ellipsis The ellipsis string to append (default: '...')
 * @returns Truncated string
 */
export function truncateText(
  text: string,
  maxLength: number,
  ellipsis: string = '...'
): string {
  if (text.length <= maxLength) {
    return text;
  }
  
  return text.slice(0, maxLength - ellipsis.length) + ellipsis;
}

/**
 * Converts a string to title case
 * @param text The text to convert
 * @returns Text in title case
 */
export function toTitleCase(text: string): string {
  return text
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Formats a number with thousands separators
 * @param value The number to format
 * @param locale The locale to use for formatting (default: en-US)
 * @returns Formatted number string
 */
export function formatNumber(
  value: number,
  locale: string = 'en-US'
): string {
  return new Intl.NumberFormat(locale).format(value);
}

/**
 * Converts a string to a URL-friendly slug
 * @param text The text to convert
 * @returns URL-friendly slug
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove non-word characters
    .replace(/[\s_-]+/g, '-') // Replace spaces, underscores and hyphens with a single hyphen
    .replace(/^-+|-+$/g, ''); // Remove leading and trailing hyphens
} 