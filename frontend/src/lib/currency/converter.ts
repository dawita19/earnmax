interface ExchangeRates {
  [key: string]: number;
}

let exchangeRates: ExchangeRates = {};

export const setExchangeRates = (rates: ExchangeRates): void => {
  exchangeRates = rates;
};

export const convertCurrency = (
  amount: number,
  fromCurrency: string,
  toCurrency: string
): number => {
  if (fromCurrency === toCurrency) return amount;
  
  if (!exchangeRates[fromCurrency] || !exchangeRates[toCurrency]) {
    throw new Error('Missing exchange rate data');
  }
  
  // Convert to USD first (assuming rates are USD-based)
  const usdAmount = amount / exchangeRates[fromCurrency];
  return usdAmount * exchangeRates[toCurrency];
};

export const getSupportedCurrencies = (): string[] => {
  return Object.keys(exchangeRates);
};