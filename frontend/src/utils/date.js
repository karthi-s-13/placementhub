import { formatDistanceToNow, format } from 'date-fns';

/**
 * Safely parse ISO date strings from backend.
 * Appends 'Z' if timezone offset is missing so JavaScript treats naive UTC strings as UTC.
 */
export function parseDate(dateStr) {
  if (!dateStr) return new Date();
  if (dateStr instanceof Date) return dateStr;
  let str = String(dateStr).trim();
  // If string has date & time but no timezone indicator (Z or +/- offset), treat as UTC
  if (str.includes('T') && !str.endsWith('Z') && !/[+-]\d{2}:\d{2}$/.test(str)) {
    return new Date(str + 'Z');
  }
  if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/.test(str)) {
    return new Date(str.replace(' ', 'T') + 'Z');
  }
  return new Date(str);
}

export function formatTimeAgo(dateStr) {
  try {
    return formatDistanceToNow(parseDate(dateStr), { addSuffix: true });
  } catch {
    return 'just now';
  }
}

export function formatDate(dateStr, formatStr = 'dd MMM yyyy') {
  try {
    return format(parseDate(dateStr), formatStr);
  } catch {
    return dateStr;
  }
}

export function formatMessageTime(dateStr) {
  try {
    const d = parseDate(dateStr);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  } catch {
    return '';
  }
}
