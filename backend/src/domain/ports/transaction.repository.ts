import { NewTransaction, Transaction, TransactionStatus } from '../entities/transaction';

export interface TransactionStatusPatch {
  status: TransactionStatus;
  providerId?: string | null;
  providerStatus?: string | null;
}

export interface TransactionRepository {
  createPendingAndReserveStock(input: NewTransaction): Promise<Transaction>;
  findById(id: string): Promise<Transaction | null>;
  findByReference(reference: string): Promise<Transaction | null>;
  findByProviderId(providerId: string): Promise<Transaction | null>;
  applyProviderResult(id: string, patch: TransactionStatusPatch): Promise<Transaction>;
}
