import { Inject, Injectable } from '@nestjs/common';
import { Transaction } from '../../domain/entities/transaction';
import { DomainError, notFound } from '../../domain/errors/domain-error';
import { TRANSACTION_REPOSITORY } from '../../domain/ports/tokens';
import type { TransactionRepository } from '../../domain/ports/transaction.repository';
import { err, ok, Result } from '../result';

@Injectable()
export class GetTransactionUseCase {
  constructor(
    @Inject(TRANSACTION_REPOSITORY)
    private readonly transactions: TransactionRepository,
  ) {}

  async execute(id: string): Promise<Result<Transaction, DomainError>> {
    const transaction = await this.transactions.findById(id);
    if (!transaction) {
      return err(notFound('Transaction not found'));
    }
    return ok(transaction);
  }
}
