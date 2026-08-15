import { TransactionStatus } from '../../domain/entities/transaction';

export const mapProviderStatus = (status: string): TransactionStatus => {
  const normalized = status.toUpperCase();
  if (normalized === 'APPROVED') {
    return 'APPROVED';
  }
  if (
    normalized === 'DECLINED' ||
    normalized === 'VOIDED' ||
    normalized === 'ERROR'
  ) {
    return normalized === 'ERROR' ? 'ERROR' : 'DECLINED';
  }
  return 'PENDING';
};

export const isFinalStatus = (status: TransactionStatus): boolean =>
  status === 'APPROVED' || status === 'DECLINED' || status === 'ERROR';
