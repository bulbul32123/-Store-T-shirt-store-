export const formatCurrency = (value, currency = 'USD', locale = 'en-US') => {
  if (value === undefined || value === null) return '';
  
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
};

export const formatDate = (date, options = {}) => {
  if (!date) return '';

  const defaultOptions = { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric'
  };
  
  const mergedOptions = { ...defaultOptions, ...options };
  
  return new Date(date).toLocaleDateString(undefined, mergedOptions);
}; 