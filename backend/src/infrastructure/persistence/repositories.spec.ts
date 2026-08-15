import { PrismaCustomerRepository } from './prisma-customer.repository';
import { PrismaDeliveryRepository } from './prisma-delivery.repository';
import { PrismaProductRepository } from './prisma-product.repository';
import { PrismaTransactionRepository } from './prisma-transaction.repository';

const productRow = {
  id: 'p1',
  name: 'Nova',
  description: 'd',
  priceInCents: 1,
  imageUrl: 'u',
  stock: 4,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('prisma repositories', () => {
  it('reads products and stock', async () => {
    const prisma = {
      product: {
        findMany: jest.fn(async () => [productRow]),
        findUnique: jest
          .fn()
          .mockResolvedValueOnce(productRow)
          .mockResolvedValueOnce({ stock: 4 }),
      },
    };
    const repo = new PrismaProductRepository(prisma as never);
    expect(await repo.findAll()).toHaveLength(1);
    expect(await repo.findById('p1')).toMatchObject({ id: 'p1' });
    expect(await repo.getStock('p1')).toBe(4);
  });

  it('upserts customers and creates deliveries', async () => {
    const customerRow = {
      id: 'c1',
      name: 'Ana',
      email: 'a@a.com',
      phone: '1',
      documentType: 'CC',
      documentNumber: '1',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const customers = new PrismaCustomerRepository({
      customer: {
        findUnique: jest.fn(async () => customerRow),
        upsert: jest.fn(async () => customerRow),
      },
    } as never);
    expect(await customers.findById('c1')).toMatchObject({ id: 'c1' });
    expect(
      await customers.upsertByEmail({
        name: 'Ana',
        email: 'a@a.com',
        phone: '1',
        documentType: 'CC',
        documentNumber: '1',
      }),
    ).toMatchObject({ email: 'a@a.com' });

    const deliveryRow = {
      id: 'd1',
      customerId: 'c1',
      address: 'a',
      city: 'b',
      region: 'c',
      postalCode: '1',
      status: 'PENDING',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const deliveries = new PrismaDeliveryRepository({
      delivery: {
        findUnique: jest.fn(async () => deliveryRow),
        create: jest.fn(async () => deliveryRow),
      },
    } as never);
    expect(await deliveries.findById('d1')).toMatchObject({ id: 'd1' });
    expect(
      await deliveries.create({
        customerId: 'c1',
        address: 'a',
        city: 'b',
        region: 'c',
        postalCode: '1',
      }),
    ).toMatchObject({ city: 'b' });
  });

  it('reserves stock and applies provider results', async () => {
    const txRow = {
      id: 't1',
      reference: 'r',
      productId: 'p1',
      customerId: 'c1',
      deliveryId: 'd1',
      quantity: 1,
      productAmount: 1,
      baseFee: 1,
      deliveryFee: 1,
      totalAmount: 3,
      status: 'PENDING',
      providerId: null,
      providerStatus: null,
      last4: null,
      cardBrand: null,
      stockReserved: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const inner = {
      product: {
        updateMany: jest.fn(async () => ({ count: 1 })),
        update: jest.fn(),
      },
      transaction: {
        create: jest.fn(async () => txRow),
        findUnique: jest.fn(async () => txRow),
        update: jest.fn(async () => ({ ...txRow, status: 'APPROVED' })),
      },
      delivery: { update: jest.fn() },
    };
    const prisma = {
      $transaction: jest.fn(async (fn: (tx: typeof inner) => unknown) => fn(inner)),
      transaction: {
        findUnique: jest.fn(async () => txRow),
        findFirst: jest.fn(async () => txRow),
      },
    };
    const repo = new PrismaTransactionRepository(prisma as never);
    await expect(
      repo.createPendingAndReserveStock({
        reference: 'r',
        productId: 'p1',
        customerId: 'c1',
        deliveryId: 'd1',
        quantity: 1,
        productAmount: 1,
        baseFee: 1,
        deliveryFee: 1,
        totalAmount: 3,
      }),
    ).resolves.toMatchObject({ id: 't1' });
    await expect(repo.findById('t1')).resolves.toMatchObject({ id: 't1' });
    await expect(repo.findByReference('r')).resolves.toMatchObject({ id: 't1' });
    await expect(repo.findByProviderId('p')).resolves.toMatchObject({ id: 't1' });
    await expect(
      repo.applyProviderResult('t1', { status: 'APPROVED', providerId: 'prov' }),
    ).resolves.toMatchObject({ status: 'APPROVED' });

    inner.product.updateMany = jest.fn(async () => ({ count: 0 }));
    await expect(
      repo.createPendingAndReserveStock({
        reference: 'r2',
        productId: 'p1',
        customerId: 'c1',
        deliveryId: 'd1',
        quantity: 1,
        productAmount: 1,
        baseFee: 1,
        deliveryFee: 1,
        totalAmount: 3,
      }),
    ).rejects.toThrow('INSUFFICIENT_STOCK');

    inner.transaction.findUnique = jest.fn(async () => null);
    await expect(
      repo.applyProviderResult('missing', { status: 'APPROVED' }),
    ).rejects.toThrow('TRANSACTION_NOT_FOUND');

    inner.transaction.findUnique = jest.fn(async () => ({
      ...txRow,
      status: 'APPROVED',
    }));
    await expect(
      repo.applyProviderResult('t1', { status: 'DECLINED' }),
    ).resolves.toMatchObject({ status: 'APPROVED' });

    inner.transaction.findUnique = jest.fn(async () => txRow);
    inner.transaction.update = jest.fn(async () => ({
      ...txRow,
      status: 'DECLINED',
      stockReserved: false,
    }));
    await expect(
      repo.applyProviderResult('t1', { status: 'DECLINED' }),
    ).resolves.toMatchObject({ status: 'DECLINED' });
  });
});
