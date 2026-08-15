import { fetchAcceptance, tokenizeCard } from './paymentClient';

describe('paymentClient', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('reads acceptance tokens from the merchant endpoint', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      json: async () => ({
        data: {
          presigned_acceptance: {
            acceptance_token: 'acc',
            permalink: 'http://t',
          },
          presigned_personal_data_auth: {
            acceptance_token: 'per',
            permalink: 'http://p',
          },
        },
      }),
    });
    await expect(fetchAcceptance()).resolves.toMatchObject({
      acceptanceToken: 'acc',
      acceptPersonalAuth: 'per',
    });

    global.fetch = jest.fn().mockResolvedValue({ json: async () => ({ data: {} }) });
    await expect(fetchAcceptance()).rejects.toThrow(/contratos/);
  });

  it('tokenizes a card and surfaces provider errors', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ data: { id: 'tok_1' } }),
    });
    await expect(
      tokenizeCard({
        number: '4242424242424242',
        cvc: '123',
        expMonth: '12',
        expYear: '29',
        cardHolder: 'ANA',
      }),
    ).resolves.toBe('tok_1');

    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ error: { reason: 'invalid' } }),
    });
    await expect(
      tokenizeCard({
        number: '1',
        cvc: '1',
        expMonth: '1',
        expYear: '20',
        cardHolder: 'A',
      }),
    ).rejects.toThrow('invalid');
  });
});
