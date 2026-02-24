// src/utils/formatters.js
export const formatCurrency = (value) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
};

export const formatPercentage = (value) => {
  return `${(value || 0).toFixed(1)}%`;
};

export const formatNumber = (value, decimals = 0) => {
  return Number(value || 0).toFixed(decimals);
};


export function formatHours(value) {
  const hours = Math.floor(Math.abs(value))
  const minutes = Math.round((Math.abs(value) - hours) * 60)
  return `${value < 0 ? '-' : ''}${hours}h ${minutes}m`
}