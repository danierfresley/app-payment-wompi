import { api } from './api';

describe('api client', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('returns json on success and throws on error', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => [{ id: 'p1' }],
    });
    await expect(api.listProducts()).resolves.toEqual([{ id: 'p1' }]);

    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 404,
      json: async () => ({ message: 'missing' }),
    });
    await expect(api.getProduct('x')).rejects.toThrow('missing');
  });

  it('posts checkout resources', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ id: 'ok' }),
    });
    await api.upsertCustomer({
      name: 'Ana',
      email: 'a@a.com',
      phone: '1',
      documentType: 'CC',
      documentNumber: '1',
    });
    await api.createDelivery({
      customerId: 'c1',
      address: 'a',
      city: 'b',
      region: 'c',
      postalCode: '1',
    });
    await api.createTransaction({
      productId: 'p',
      customerId: 'c',
      deliveryId: 'd',
      quantity: 1,
      cardToken: 'tok',
      acceptanceToken: 'a',
      acceptPersonalAuth: 'b',
    });
    await api.getStock('p');
    await api.getTransaction('t');
    await api.syncTransaction('t');
    expect(global.fetch).toHaveBeenCalledTimes(6);
  });
});
