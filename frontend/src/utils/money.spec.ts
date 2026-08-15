import { computeTotals, formatCop } from './money';

describe('money utils', () => {
  it('formats COP without decimals', () => {
    expect(formatCop(18990000)).toContain('189.900');
  });

  it('adds product, base and delivery fees', () => {
    expect(computeTotals(1000, 200, 300)).toEqual({
      productAmount: 1000,
      baseFee: 200,
      deliveryFee: 300,
      total: 1500,
    });
  });
});
