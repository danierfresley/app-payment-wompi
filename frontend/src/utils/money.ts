export const formatCop = (amountInCents: number): string => {
  const pesos = amountInCents / 100;
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(pesos);
};

export const computeTotals = (
  productAmount: number,
  baseFee: number,
  deliveryFee: number,
) => ({
  productAmount,
  baseFee,
  deliveryFee,
  total: productAmount + baseFee + deliveryFee,
});
