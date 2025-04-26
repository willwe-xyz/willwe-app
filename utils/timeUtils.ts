import { formatDistanceToNow, format } from 'date-fns';

/**
 * Standardized time formatting utility functions
 */

/**
 * Converts a timestamp to a Date object, handling both numeric and string timestamps
 */
export const parseTimestamp = (timestamp: string | number): Date => {
  try {
    if (typeof timestamp === 'number' || !isNaN(Number(timestamp))) {
      const numericTimestamp = Number(timestamp);
      // If timestamp is in seconds (typically ~10 digits), convert to milliseconds
      const timestampMs = numericTimestamp < 10000000000 
        ? numericTimestamp * 1000 
        : numericTimestamp;
      return new Date(timestampMs);
    }
    return new Date(timestamp);
  } catch (e) {
    console.error("Error parsing timestamp:", timestamp, e);
    return new Date();
  }
};

/**
 * Formats a timestamp as a relative time (e.g. "2 hours ago")
 */
export const formatRelativeTime = (timestamp: string | number): string => {
  const date = parseTimestamp(timestamp);
  return formatDistanceToNow(date, { addSuffix: true });
};

/**
 * Formats a timestamp as a full date and time
 */
export const formatFullDateTime = (timestamp: string | number): string => {
  const date = parseTimestamp(timestamp);
  return format(date, 'MMM d, yyyy h:mm a');
}; 