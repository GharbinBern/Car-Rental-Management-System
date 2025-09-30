/**
 * Currency formatting utilities
 * Ensures consistent Euro (€) formatting throughout the application
 */

/**
 * Format a number as Euro currency
 * @param {number|string} amount - The amount to format
 * @param {number} decimals - Number of decimal places (default: 2)
 * @returns {string} Formatted currency string (e.g., "€123.45")
 */
export const formatEuro = (amount, decimals = 2) => {
  const num = parseFloat(amount) || 0;
  return `€${num.toFixed(decimals)}`;
};

/**
 * Format a number as Euro currency with locale formatting
 * @param {number|string} amount - The amount to format
 * @param {string} locale - Locale for number formatting (default: 'en-EU')
 * @returns {string} Formatted currency string with locale formatting
 */
export const formatEuroLocale = (amount, locale = 'en-EU') => {
  const num = parseFloat(amount) || 0;
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'EUR',
  }).format(num);
};

/**
 * Parse currency string to number
 * @param {string} currencyString - Currency string (e.g., "€123.45" or "123.45")
 * @returns {number} Parsed number
 */
export const parseCurrency = (currencyString) => {
  if (typeof currencyString === 'number') return currencyString;
  const cleaned = String(currencyString).replace(/[€$,]/g, '');
  return parseFloat(cleaned) || 0;
};

export default {
  formatEuro,
  formatEuroLocale,
  parseCurrency,
};