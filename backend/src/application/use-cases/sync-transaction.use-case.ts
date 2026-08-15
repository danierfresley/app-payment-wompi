import { Inject, Injectable } from '@nestjs/common';
import { Transaction } from '../../domain/entities/transaction';
import { DomainError, notFound, validation } from '../../domain/errors/domain-error';
import { PAYMENT_GATEWAY, TRANSACTION_REPOSITORY } from '../../domain/ports/tokens';
import type { PaymentGateway } from '../../domain/ports/payment.gateway';
import type { TransactionRepository } from '../../domain/ports/transaction.repository';
import { err, ok, Result } from '../result';
import { isFinalStatus, mapProviderStatus } from './map-provider-status';

@Injectable()
export class SyncTransactionUseCase {
  constructor(
    @Inject(TRANSACTION_REPOSITORY)
    private readonly transactions: TransactionRepository,
    @Inject(PAYMENT_GATEWAY)
    private readonly payment: PaymentGateway,
  ) {}

  async execute(id: string): Promise<Result<Transaction, DomainError>> {
    const current = await this.transactions.findById(id);
    if (!current) {
      return err(notFound('Transaction not found'));
    }
    if (isFinalStatus(current.status)) {
      return ok(current);
    }
    if (!current.providerId) {
      return err(validation('Transaction has no provider id to sync'));
    }

    const provider = await this.payment.getTransaction(current.providerId);
    const localStatus = mapProviderStatus(provider.status);
    if (localStatus === 'PENDING') {
      return ok(current);
    }

    const updated = await this.transactions.applyProviderResult(current.id, {
      status: localStatus,
      providerId: provider.id,
      providerStatus: provider.status,
    });
    return ok(updated);
  }
}
