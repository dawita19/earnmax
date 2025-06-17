export class CurrencyFormatter {
  private static locale = 'en-US';
  private static currency = 'ETB';

  /**
   * Format amount to currency string
   */
  static format(amount: number): string {
    return new Intl.NumberFormat(this.locale, {
      style: 'currency',
      currency: this.currency,
      minimumFractionDigits: 2
    }).format(amount);
  }

  /**
   * Parse currency string to number
   */
  static parse(currencyString: string): number {
    const numericValue = currencyString.replace(/[^0-9.-]+/g, '');
    return parseFloat(numericValue);
  }

  /**
   * Validate amount meets VIP minimum requirements
   */
  static validateAmount(amount: number, vipLevel: VipLevel): boolean {
    return amount >= vipLevel.investmentAmount;
  }
}