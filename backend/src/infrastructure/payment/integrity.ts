import { createHash } from 'crypto';

export const buildIntegritySignature = (
  reference: string,
  amountInCents: number,
  currency: string,
  integrityKey: string,
): string => {
  const raw = `${reference}${amountInCents}${currency}${integrityKey}`;
  return createHash('sha256').update(raw).digest('hex');
};

export const buildWebhookChecksum = (
  concatenatedProperties: string,
  timestamp: string,
  eventsSecret: string,
): string => {
  return createHash('sha256')
    .update(`${concatenatedProperties}${timestamp}${eventsSecret}`)
    .digest('hex');
};
