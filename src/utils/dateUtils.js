/**
 * Formats a date object into a readable string format
 * @param {Date} date - The date to format
 * @returns {string} Formatted date string (e.g., "Monday, July 30, 2025")
 */
export const formatDate = (date) => {
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  return date.toLocaleDateString('en-US', options);
};

/**
 * Formats a date object into a short date string
 * @param {Date} date - The date to format
 * @returns {string} Short formatted date string (e.g., "Jul 30")
 */
export const formatShortDate = (date) => {
  const options = { month: 'short', day: 'numeric' };
  return date.toLocaleDateString('en-US', options);
};

/**
 * Checks if two dates are the same day
 * @param {Date} date1 - First date to compare
 * @param {Date} date2 - Second date to compare
 * @returns {boolean} True if dates are the same day
 */
export const isSameDay = (date1, date2) => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

/**
 * Gets the start of the week (Sunday) for a given date
 * @param {Date} date - The date to get the start of the week for
 * @returns {Date} Date object representing the start of the week
 */
export const getStartOfWeek = (date) => {
  const result = new Date(date);
  const day = result.getDay();
  result.setDate(result.getDate() - day);
  return result;
};

/**
 * Gets an array of dates for the week containing the given date
 * @param {Date} date - The date to get the week for
 * @returns {Date[]} Array of 7 date objects representing the week
 */
export const getWeekDates = (date) => {
  const startOfWeek = getStartOfWeek(date);
  const weekDates = [];
  
  for (let i = 0; i < 7; i++) {
    const day = new Date(startOfWeek);
    day.setDate(day.getDate() + i);
    weekDates.push(day);
  }
  
  return weekDates;
};