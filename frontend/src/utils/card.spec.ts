import {
  detectCardBrand,
  digitsOnly,
  formatCardNumber,
  isSupportedBrand,
  isValidCvc,
  isValidExpiry,
  luhnValid,
} from './card';

describe('card utils', () => {
  it('keeps digits and formats groups of four', () => {
    expect(digitsOnly('4242-4242')).toBe('42424242');
    expect(formatCardNumber('4242424242424242')).toBe('4242 4242 4242 4242');
  });

  it('detects visa and mastercard bins', () => {
    expect(detectCardBrand('4111111111111111')).toBe('visa');
    expect(detectCardBrand('5500000000000004')).toBe('mastercard');
    expect(detectCardBrand('2221000000000009')).toBe('mastercard');
    expect(detectCardBrand('6011000000000004')).toBe('unknown');
  });

  it('validates luhn checksums', () => {
    expect(luhnValid('4242424242424242')).toBe(true);
    expect(luhnValid('4242424242424241')).toBe(false);
    expect(luhnValid('123')).toBe(false);
  });

  it('validates expiry, cvc and supported brands', () => {
    expect(isValidExpiry('12', '29')).toBe(true);
    expect(isValidExpiry('13', '29')).toBe(false);
    expect(isValidExpiry('01', '2000')).toBe(false);
    expect(isValidCvc('123')).toBe(true);
    expect(isValidCvc('12')).toBe(false);
    expect(isSupportedBrand('visa')).toBe(true);
    expect(isSupportedBrand('unknown')).toBe(false);
  });
});
