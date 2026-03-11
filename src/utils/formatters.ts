export const formatPrice = (value: number | null | undefined): string => {
  if (value == null) return '—';
  return `GHS ${Number(value).toFixed(2)}`;
};

export const formatPriceShort = (value: number | null | undefined): string => {
  if (value == null) return '—';
  return `₵${Number(value).toFixed(2)}`;
};

export const formatPercentage = (value: number | null | undefined): string => {
  if (value == null) return '—';
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(1)}%`;
};

export const formatDate = (isoString: string | null | undefined): string => {
  if (!isoString) return '—';
  return new Date(isoString).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
};

export const formatDateShort = (isoString: string | null | undefined): string => {
  if (!isoString) return '—';
  return new Date(isoString).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
};

export const formatNumber = (value: number | null | undefined): string => {
  if (value == null) return '—';
  return Number(value).toLocaleString('en-US');
};
