/**
 * Date utility functions to ensure consistent date formatting
 * across all platforms, especially for iOS devices with Hijri calendar settings.
 * 
 * All functions explicitly use the Gregorian calendar with 'en-US' locale
 * to prevent automatic conversion to Hijri dates on iOS.
 */

/**
 * Formats a date object to MM/DD/YYYY format using Gregorian calendar
 * @param {Date} date - The date to format
 * @returns {string} Formatted date string in MM/DD/YYYY format
 */
export const formatDate = (date) => {
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
        return '';
    }

    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        calendar: 'gregory'
    });
};

/**
 * Formats a date object to include both date and time using Gregorian calendar
 * @param {Date} date - The date to format
 * @returns {string} Formatted date and time string
 */
export const formatDateTime = (date) => {
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
        return '';
    }

    const dateStr = date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        calendar: 'gregory'
    });

    const timeStr = date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    });

    return `${dateStr} ${timeStr}`;
};

/**
 * Formats a date object to time only
 * @param {Date} date - The date to format
 * @returns {string} Formatted time string
 */
export const formatTime = (date) => {
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
        return '';
    }

    return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    });
};

/**
 * Parses a date string in MM/DD/YYYY format to a Date object
 * @param {string} dateString - The date string to parse
 * @returns {Date|null} Parsed date object or null if invalid
 */
export const parseDate = (dateString) => {
    if (!dateString || typeof dateString !== 'string') {
        return null;
    }

    const dateParts = dateString.split('/');
    if (dateParts.length !== 3) {
        return null;
    }

    const month = parseInt(dateParts[0], 10) - 1; // Month is 0-indexed
    const day = parseInt(dateParts[1], 10);
    const year = parseInt(dateParts[2], 10);

    const date = new Date(year, month, day);

    // Validate the date
    if (isNaN(date.getTime())) {
        return null;
    }

    return date;
};
