import { CreateTransactionUseCase } from './create-transaction.use-case';

const product = {
  id: 'p1',
  name: 'Nova',
  description: 'desc',
  priceInCents: 1000,
  imageUrl: 'http://img',
  stock: 3,
};

const customer = {
  id: 'c1',
  name: 'Ana',
  email: 'ana@test.com',
  phone: '300',
  documentType: 'CC',
  documentNumber: '1',
};

const delivery = {
  id: 'd1',
  customerId: 'c1',
  address: 'Cra 1',
  city: 'Bogotá',
  region: 'Cundinamarca',
  postalCode: '110111',
  status: 'PENDING' as const,
};

const pendingTx = {
  id: 't1',
  reference: 'CHK-1',
  productId: 'p1',
  customerId: 'c1',
  deliveryId: 'd1',
  quantity: 1,
  productAmount: 1000,
  baseFee: 100,
  deliveryFee: 200,
  totalAmount: 1300,
  status: 'PENDING' as const,
  stockReserved: true,
};

const input = {
  productId: 'p1',
  customerId: 'c1',
  deliveryId: 'd1',
  quantity: 1,
  cardToken: 'tok',
  last4: '4242',
  cardBrand: 'visa',
  acceptanceToken: 'acc',
  acceptPersonalAuth: 'per',
};

const build = (overrides?: {
  stock?: number;
  paymentStatus?: string;
  paymentError?: boolean;
  reserveError?: boolean;
}) => {
  const transactions = {
    createPendingAndReserveStock: jest.fn(async () => {
      if (overrides?.reserveError) {
        throw new Error('INSUFFICIENT_STOCK');
      }
      return pendingTx;
    }),
    findById: jest.fn(),
    findByReference: jest.fn(),
    findByProviderId: jest.fn(),
    applyProviderResult: jest.fn(async (_id, patch) => ({
      ...pendingTx,
      status: patch.status,
      providerId: patch.providerId,
      providerStatus: patch.providerStatus,
    })),
  };
  const payment = {
    createCardTransaction: jest.fn(async () => {
      if (overrides?.paymentError) {
        throw new Error('provider down');
      }
      return {
        id: 'prov-1',
        status: overrides?.paymentStatus ?? 'APPROVED',
        reference: 'CHK-1',
      };
    }),
    getTransaction: jest.fn(),
    waitForSettlement: jest.fn(async () => ({
      id: 'prov-1',
      status: 'APPROVED',
      reference: 'CHK-1',
    })),
  };
  return {
    transactions,
    payment,
    useCase: new CreateTransactionUseCase(
      {
        findAll: async () => [],
        findById: async () => ({
          ...product,
          stock: overrides?.stock ?? product.stock,
        }),
        getStock: async () => overrides?.stock ?? product.stock,
      },
      {
        findById: async () => customer,
        upsertByEmail: async () => customer,
      },
      {
        findById: async () => delivery,
        create: async () => delivery,
      },
      transactions,
      payment,
      { baseFeeCents: 100, deliveryFeeCents: 200 },
    ),
  };
};

describe('CreateTransactionUseCase', () => {
  it('rejects invalid payloads and missing stock', async () => {
    const { useCase } = build({ stock: 0 });
    expect((await useCase.execute({ ...input, cardToken: '' })).ok).toBe(false);
    expect((await useCase.execute({ ...input, quantity: 0 })).ok).toBe(false);
    expect((await useCase.execute(input)).ok).toBe(false);
  });

  it('creates an approved payment after reserving stock', async () => {
    const { useCase, payment } = build();
    const result = await useCase.execute(input);
    expect(result.ok).toBe(true);
    expect(payment.createCardTransaction).toHaveBeenCalled();
    if (result.ok) {
      expect(result.value.status).toBe('APPROVED');
      expect(result.value.totalAmount).toBe(1300);
    }
  });

  it('polls when the provider stays pending and maps declines', async () => {
    const pending = build({ paymentStatus: 'PENDING' });
    const declined = build({ paymentStatus: 'DECLINED' });
    expect((await pending.useCase.execute(input)).ok).toBe(true);
    expect(pending.payment.waitForSettlement).toHaveBeenCalled();
    const declinedResult = await declined.useCase.execute(input);
    expect(declinedResult.ok && declinedResult.value.status).toBe('DECLINED');
  });

  it('returns a payment failure when the provider throws', async () => {
    const { useCase } = build({ paymentError: true });
    const result = await useCase.execute(input);
    expect(result.ok).toBe(false);
  });

  it('maps reserve races to insufficient stock', async () => {
    const { useCase } = build({ reserveError: true });
    const result = await useCase.execute(input);
    expect(result.ok).toBe(false);
  });

  it('rejects missing related records and acceptance tokens', async () => {
    const missingProduct = new CreateTransactionUseCase(
      {
        findAll: async () => [],
        findById: async () => null,
        getStock: async () => null,
      },
      { findById: async () => customer, upsertByEmail: async () => customer },
      { findById: async () => delivery, create: async () => delivery },
      build().transactions,
      build().payment,
      { baseFeeCents: 100, deliveryFeeCents: 200 },
    );
    expect((await missingProduct.execute(input)).ok).toBe(false);
    expect(
      (await build().useCase.execute({ ...input, acceptanceToken: '' })).ok,
    ).toBe(false);

    const missingCustomer = new CreateTransactionUseCase(
      {
        findAll: async () => [],
        findById: async () => product,
        getStock: async () => 3,
      },
      { findById: async () => null, upsertByEmail: async () => customer },
      { findById: async () => delivery, create: async () => delivery },
      build().transactions,
      build().payment,
      { baseFeeCents: 100, deliveryFeeCents: 200 },
    );
    expect((await missingCustomer.execute(input)).ok).toBe(false);

    const missingDelivery = new CreateTransactionUseCase(
      {
        findAll: async () => [],
        findById: async () => product,
        getStock: async () => 3,
      },
      { findById: async () => customer, upsertByEmail: async () => customer },
      { findById: async () => null, create: async () => delivery },
      build().transactions,
      build().payment,
      { baseFeeCents: 100, deliveryFeeCents: 200 },
    );
    expect((await missingDelivery.execute(input)).ok).toBe(false);

    const mismatch = new CreateTransactionUseCase(
      {
        findAll: async () => [],
        findById: async () => product,
        getStock: async () => 3,
      },
      { findById: async () => customer, upsertByEmail: async () => customer },
      {
        findById: async () => ({ ...delivery, customerId: 'other' }),
        create: async () => delivery,
      },
      build().transactions,
      build().payment,
      { baseFeeCents: 100, deliveryFeeCents: 200 },
    );
    expect((await mismatch.execute(input)).ok).toBe(false);
  });
});
