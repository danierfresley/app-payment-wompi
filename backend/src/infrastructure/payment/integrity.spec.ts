import { buildIntegritySignature, buildWebhookChecksum } from './integrity';

describe('integrity helpers', () => {
  it('hashes reference, amount, currency and secret', () => {
    const first = buildIntegritySignature('ref', 1000, 'COP', 'secret');
    const second = buildIntegritySignature('ref', 1000, 'COP', 'secret');
    const other = buildIntegritySignature('ref', 1001, 'COP', 'secret');
    expect(first).toBe(second);
    expect(first).not.toBe(other);
    expect(first).toHaveLength(64);
  });

  it('builds webhook checksums', () => {
    expect(buildWebhookChecksum('abc', '1', 'k')).toHaveLength(64);
  });
});
