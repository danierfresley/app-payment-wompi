import { GetTransactionUseCase } from './get-transaction.use-case';
import { HandlePaymentWebhookUseCase } from './handle-payment-webhook.use-case';
import { SyncTransactionUseCase } from './sync-transaction.use-case';
import { buildWebhookChecksum } from '../../infrastructure/payment/integrity';

const tx = {
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
  providerId: 'prov-1',
  stockReserved: true,
};

describe('sync and webhook use cases', () => {
  it('gets a transaction or not found', async () => {
    const found = new GetTransactionUseCase({
      createPendingAndReserveStock: async () => tx,
      findById: async () => tx,
      findByReference: async () => tx,
      findByProviderId: async () => tx,
      applyProviderResult: async () => tx,
    });
    const missing = new GetTransactionUseCase({
      createPendingAndReserveStock: async () => tx,
      findById: async () => null,
      findByReference: async () => null,
      findByProviderId: async () => null,
      applyProviderResult: async () => tx,
    });
    expect((await found.execute('t1')).ok).toBe(true);
    expect((await missing.execute('x')).ok).toBe(false);
  });

  it('syncs pending transactions and skips finals', async () => {
    const apply = jest.fn(async () => ({ ...tx, status: 'APPROVED' as const }));
    const useCase = new SyncTransactionUseCase(
      {
        createPendingAndReserveStock: async () => tx,
        findById: async () => tx,
        findByReference: async () => tx,
        findByProviderId: async () => tx,
        applyProviderResult: apply,
      },
      {
        createCardTransaction: async () => ({
          id: 'prov-1',
          status: 'APPROVED',
          reference: 'CHK-1',
        }),
        getTransaction: async () => ({
          id: 'prov-1',
          status: 'APPROVED',
          reference: 'CHK-1',
        }),
        waitForSettlement: async () => ({
          id: 'prov-1',
          status: 'APPROVED',
          reference: 'CHK-1',
        }),
      },
    );
    expect((await useCase.execute('t1')).ok).toBe(true);
    expect(apply).toHaveBeenCalled();

    const finalized = new SyncTransactionUseCase(
      {
        createPendingAndReserveStock: async () => tx,
        findById: async () => ({ ...tx, status: 'APPROVED' }),
        findByReference: async () => tx,
        findByProviderId: async () => tx,
        applyProviderResult: apply,
      },
      {
        createCardTransaction: async () => ({
          id: 'p',
          status: 'APPROVED',
          reference: 'r',
        }),
        getTransaction: async () => ({
          id: 'p',
          status: 'APPROVED',
          reference: 'r',
        }),
        waitForSettlement: async () => ({
          id: 'p',
          status: 'APPROVED',
          reference: 'r',
        }),
      },
    );
    expect((await finalized.execute('t1')).ok).toBe(true);
  });

  it('accepts signed webhooks and ignores unknown events', async () => {
    const apply = jest.fn(async () => ({ ...tx, status: 'APPROVED' as const }));
    const useCase = new HandlePaymentWebhookUseCase(
      {
        createPendingAndReserveStock: async () => tx,
        findById: async () => tx,
        findByReference: async () => tx,
        findByProviderId: async () => tx,
        applyProviderResult: apply,
      },
      'secret',
    );
    const payload = {
      event: 'transaction.updated',
      data: { transaction: { id: 'prov-1', reference: 'CHK-1', status: 'APPROVED' } },
      signature: { properties: ['data.transaction.id'] },
      timestamp: 1,
    };
    const checksum = buildWebhookChecksum('prov-1', '1', 'secret');
    const result = await useCase.execute(payload, checksum);
    expect(result.ok).toBe(true);
    const invalid = await useCase.execute(payload, 'bad');
    expect(invalid.ok).toBe(false);
    const ignored = await useCase.execute({
      data: { transaction: { status: 'PENDING' } },
    });
    expect(ignored.ok).toBe(true);
    const missingPayload = await useCase.execute({});
    expect(missingPayload.ok).toBe(false);
    const unknown = new HandlePaymentWebhookUseCase(
      {
        createPendingAndReserveStock: async () => tx,
        findById: async () => tx,
        findByReference: async () => null,
        findByProviderId: async () => null,
        applyProviderResult: apply,
      },
      'secret',
    );
    expect(
      (
        await unknown.execute({
          data: { transaction: { id: 'x', status: 'APPROVED' } },
        })
      ).ok,
    ).toBe(true);
    const alreadyFinal = new HandlePaymentWebhookUseCase(
      {
        createPendingAndReserveStock: async () => tx,
        findById: async () => tx,
        findByReference: async () => ({ ...tx, status: 'APPROVED' }),
        findByProviderId: async () => tx,
        applyProviderResult: apply,
      },
      'secret',
    );
    expect(
      (
        await alreadyFinal.execute({
          data: { transaction: { reference: 'CHK-1', status: 'APPROVED' } },
        })
      ).ok,
    ).toBe(true);
  });

  it('rejects sync when the transaction is missing or has no provider id', async () => {
    const missing = new SyncTransactionUseCase(
      {
        createPendingAndReserveStock: async () => tx,
        findById: async () => null,
        findByReference: async () => null,
        findByProviderId: async () => null,
        applyProviderResult: async () => tx,
      },
      {
        createCardTransaction: async () => ({
          id: 'p',
          status: 'PENDING',
          reference: 'r',
        }),
        getTransaction: async () => ({
          id: 'p',
          status: 'PENDING',
          reference: 'r',
        }),
        waitForSettlement: async () => ({
          id: 'p',
          status: 'PENDING',
          reference: 'r',
        }),
      },
    );
    expect((await missing.execute('x')).ok).toBe(false);

    const noProvider = new SyncTransactionUseCase(
      {
        createPendingAndReserveStock: async () => tx,
        findById: async () => ({ ...tx, providerId: null }),
        findByReference: async () => tx,
        findByProviderId: async () => tx,
        applyProviderResult: async () => tx,
      },
      {
        createCardTransaction: async () => ({
          id: 'p',
          status: 'PENDING',
          reference: 'r',
        }),
        getTransaction: async () => ({
          id: 'p',
          status: 'PENDING',
          reference: 'r',
        }),
        waitForSettlement: async () => ({
          id: 'p',
          status: 'PENDING',
          reference: 'r',
        }),
      },
    );
    expect((await noProvider.execute('t1')).ok).toBe(false);

    const stillPending = new SyncTransactionUseCase(
      {
        createPendingAndReserveStock: async () => tx,
        findById: async () => tx,
        findByReference: async () => tx,
        findByProviderId: async () => tx,
        applyProviderResult: async () => tx,
      },
      {
        createCardTransaction: async () => ({
          id: 'p',
          status: 'PENDING',
          reference: 'r',
        }),
        getTransaction: async () => ({
          id: 'prov-1',
          status: 'PENDING',
          reference: 'CHK-1',
        }),
        waitForSettlement: async () => ({
          id: 'p',
          status: 'PENDING',
          reference: 'r',
        }),
      },
    );
    expect((await stillPending.execute('t1')).ok).toBe(true);
  });
});
