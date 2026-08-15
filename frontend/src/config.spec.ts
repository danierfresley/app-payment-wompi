import { appEnv } from './config';

describe('appEnv', () => {
  it('exposes local defaults', () => {
    expect(appEnv.apiUrl).toContain('http');
    expect(appEnv.baseFeeCents).toBeGreaterThan(0);
    expect(appEnv.deliveryFeeCents).toBeGreaterThan(0);
  });
});
