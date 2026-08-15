import { WompiGateway } from './wompi.gateway';

describe('WompiGateway', () => {
  const originalFetch = global.fetch;
  const gateway = new WompiGateway({
    baseUrl: 'https://example.test/v1',
    privateKey: 'prv',
    integrityKey: 'int',
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('creates and reads provider transactions', async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: { id: 'prov-1', status: 'PENDING', reference: 'r1' },
        }),
      })
      .mockResolvedValue({
        ok: true,
        json: async () => ({
          data: { id: 'prov-1', status: 'APPROVED', reference: 'r1' },
        }),
      });

    const created = await gateway.createCardTransaction({
      amountInCents: 1000,
      currency: 'COP',
      customerEmail: 'a@a.com',
      reference: 'r1',
      cardToken: 'tok',
      installments: 1,
      acceptanceToken: 'a',
      acceptPersonalAuth: 'b',
    });
    expect(created.id).toBe('prov-1');
    const settled = await gateway.waitForSettlement('prov-1', 1, 0);
    expect(settled.status).toBe('APPROVED');
  });

  it('throws when a provider lookup fails and keeps waiting while pending', async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce({
        ok: false,
        json: async () => ({}),
      });
    await expect(gateway.getTransaction('x')).rejects.toThrow(
      'Unable to fetch provider transaction',
    );

    global.fetch = jest
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: { id: 'prov-1', status: 'PENDING', reference: 'r1' },
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: { id: 'prov-1', status: 'PENDING', reference: 'r1' },
        }),
      });
    const still = await gateway.waitForSettlement('prov-1', 1, 0);
    expect(still.status).toBe('PENDING');
  });

  it('throws when the provider rejects the charge', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 422,
      json: async () => ({ error: { reason: 'Duplicate reference' } }),
    });
    await expect(
      gateway.createCardTransaction({
        amountInCents: 1000,
        currency: 'COP',
        customerEmail: 'a@a.com',
        reference: 'r1',
        cardToken: 'tok',
        installments: 1,
        acceptanceToken: 'a',
        acceptPersonalAuth: 'b',
      }),
    ).rejects.toThrow('Duplicate reference');
  });
});
