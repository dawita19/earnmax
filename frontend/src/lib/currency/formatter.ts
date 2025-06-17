export interface CurrencyFormatOptions {
  locale?: string;
  currency?: string;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
}

const DEFAULT_OPTIONS: CurrencyFormatOptions = {
  locale: 'en-US',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
};

export const formatCurrency = (
  value: number,
  options: CurrencyFormatOptions = {}
): string => {
  const mergedOptions = { ...DEFAULT_OPTIONS, ...options };
  
  return new Intl.NumberFormat(mergedOptions.locale, {
    style: 'currency',
    currency: mergedOptions.currency,
    minimumFractionDigits: mergedOptions.minimumFractionDigits,
    maximumFractionDigits: mergedOptions.maximumFractionDigits
  }).format(value);
};

export const formatEthiopianBirr = (value: number): string => {
  return formatCurrency(value, {
    locale: 'en-US', // Ethiopia doesn't have a standard locale code
    currency: 'ETB',
    minimumFractionDigits: 2
  });
};

export const parseCurrencyInput = (input: string): number => {
  // Remove all non-numeric characters except decimal point
  const numericString = input.replace(/[^0-9.]/g, '');
  return parseFloat(numericString) || 0;
};