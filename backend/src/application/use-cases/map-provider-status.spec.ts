import { isFinalStatus, mapProviderStatus } from './map-provider-status';

describe('mapProviderStatus', () => {
  it('normalizes provider statuses', () => {
    expect(mapProviderStatus('approved')).toBe('APPROVED');
    expect(mapProviderStatus('DECLINED')).toBe('DECLINED');
    expect(mapProviderStatus('VOIDED')).toBe('DECLINED');
    expect(mapProviderStatus('ERROR')).toBe('ERROR');
    expect(mapProviderStatus('PENDING')).toBe('PENDING');
  });

  it('detects final statuses', () => {
    expect(isFinalStatus('APPROVED')).toBe(true);
    expect(isFinalStatus('PENDING')).toBe(false);
  });
});
