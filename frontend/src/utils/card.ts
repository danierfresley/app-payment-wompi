export type CardBrand = 'visa' | 'mastercard' | 'unknown';

export const digitsOnly = (value: string): string => value.replace(/\D/g, '');

export const formatCardNumber = (value: string): string => {
  const digits = digitsOnly(value).slice(0, 19);
  return digits.replace(/(.{4})/g, '$1 ').trim();
};

export const detectCardBrand = (value: string): CardBrand => {
  const digits = digitsOnly(value);
  if (/^4\d{0,18}$/.test(digits)) {
    return 'visa';
  }
  const prefix2 = Number(digits.slice(0, 2));
  const prefix4 = Number(digits.slice(0, 4));
  if (
    (prefix2 >= 51 && prefix2 <= 55) ||
    (prefix4 >= 2221 && prefix4 <= 2720)
  ) {
    return 'mastercard';
  }
  return 'unknown';
};

export const luhnValid = (value: string): boolean => {
  const digits = digitsOnly(value);
  if (digits.length < 13 || digits.length > 19) {
    return false;
  }
  let sum = 0;
  let shouldDouble = false;
  for (let i = digits.length - 1; i >= 0; i -= 1) {
    let digit = Number(digits[i]);
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }
    sum += digit;
    shouldDouble = !shouldDouble;
  }
  return sum % 10 === 0;
};

export const isSupportedBrand = (brand: CardBrand): boolean =>
  brand === 'visa' || brand === 'mastercard';

export const isValidExpiry = (month: string, year: string): boolean => {
  const mm = Number(month);
  const yy = Number(year.length === 2 ? `20${year}` : year);
  if (!Number.isInteger(mm) || mm < 1 || mm > 12) {
    return false;
  }
  if (!Number.isInteger(yy) || yy < 2000) {
    return false;
  }
  const now = new Date();
  const exp = new Date(yy, mm, 0, 23, 59, 59);
  return exp >= now;
};

export const isValidCvc = (cvc: string): boolean => /^\d{3,4}$/.test(cvc);
