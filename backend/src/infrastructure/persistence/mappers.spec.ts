import { toCustomer, toDelivery, toProduct, toTransaction } from './mappers';

describe('persistence mappers', () => {
  it('maps prisma rows to domain entities', () => {
    expect(
      toProduct({
        id: 'p',
        name: 'n',
        description: 'd',
        priceInCents: 1,
        imageUrl: 'u',
        stock: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    ).toMatchObject({ id: 'p', stock: 2 });
    expect(
      toCustomer({
        id: 'c',
        name: 'Ana',
        email: 'a@a.com',
        phone: '1',
        documentType: 'CC',
        documentNumber: '1',
        createdAt: new Date(),
        updatedAt: new Date(),
      }).email,
    ).toBe('a@a.com');
    expect(
      toDelivery({
        id: 'd',
        customerId: 'c',
        address: 'a',
        city: 'b',
        region: 'c',
        postalCode: '1',
        status: 'PENDING',
        createdAt: new Date(),
        updatedAt: new Date(),
      }).status,
    ).toBe('PENDING');
    expect(
      toTransaction({
        id: 't',
        reference: 'r',
        productId: 'p',
        customerId: 'c',
        deliveryId: 'd',
        quantity: 1,
        productAmount: 1,
        baseFee: 1,
        deliveryFee: 1,
        totalAmount: 3,
        status: 'PENDING',
        providerId: null,
        providerStatus: null,
        last4: '4242',
        cardBrand: 'visa',
        stockReserved: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }).stockReserved,
    ).toBe(true);
  });
});
