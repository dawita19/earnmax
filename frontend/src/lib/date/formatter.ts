export interface DateFormatOptions {
  locale?: string;
  dateStyle?: 'full' | 'long' | 'medium' | 'short';
  timeStyle?: 'full' | 'long' | 'medium' | 'short';
  timeZone?: string;
}

const DEFAULT_OPTIONS: DateFormatOptions = {
  locale: 'en-US',
  dateStyle: 'medium',
  timeStyle: 'short'
};

export const formatDate = (
  date: Date | string | number,
  options: DateFormatOptions = {}
): string => {
  const mergedOptions = { ...DEFAULT_OPTIONS, ...options };
  const dateObj = typeof date === 'string' || typeof date === 'number' 
    ? new Date(date) 
    : date;
  
  return new Intl.DateTimeFormat(
    mergedOptions.locale,
    {
      dateStyle: mergedOptions.dateStyle,
      timeStyle: mergedOptions.timeStyle,
      timeZone: mergedOptions.timeZone
    }
  ).format(dateObj);
};

export const formatDateTimeLocal = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};