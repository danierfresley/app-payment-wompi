import { createHash } from 'crypto';
import { Inject, Injectable } from '@nestjs/common';
import { Transaction } from '../../domain/entities/transaction';
import { DomainError, unauthorized, validation } from '../../domain/errors/domain-error';
import { TRANSACTION_REPOSITORY } from '../../domain/ports/tokens';
import type { TransactionRepository } from '../../domain/ports/transaction.repository';
import { err, ok, Result } from '../result';
import { isFinalStatus, mapProviderStatus } from './map-provider-status';

export interface PaymentWebhookPayload {
  event?: string;
  data?: {
    transaction?: {
      id?: string;
      reference?: string;
      status?: string;
    };
  };
  signature?: {
    checksum?: string;
    properties?: string[];
  };
  timestamp?: number | string;
}

@Injectable()
export class HandlePaymentWebhookUseCase {
  constructor(
    @Inject(TRANSACTION_REPOSITORY)
    private readonly transactions: TransactionRepository,
    private readonly eventsSecret: string,
  ) {}

  async execute(
    payload: PaymentWebhookPayload,
    checksum?: string,
  ): Promise<Result<Transaction | { ignored: true }, DomainError>> {
    if (checksum && !this.isValidChecksum(payload, checksum)) {
      return err(unauthorized('Invalid webhook signature'));
    }

    const providerTx = payload.data?.transaction;
    if (!providerTx?.status) {
      return err(validation('Webhook payload is missing transaction data'));
    }

    const localStatus = mapProviderStatus(providerTx.status);
    if (localStatus === 'PENDING') {
      return ok({ ignored: true });
    }

    const existing = providerTx.reference
      ? await this.transactions.findByReference(providerTx.reference)
      : providerTx.id
        ? await this.transactions.findByProviderId(providerTx.id)
        : null;

    if (!existing) {
      return ok({ ignored: true });
    }
    if (isFinalStatus(existing.status)) {
      return ok(existing);
    }

    const updated = await this.transactions.applyProviderResult(existing.id, {
      status: localStatus,
      providerId: providerTx.id ?? existing.providerId,
      providerStatus: providerTx.status,
    });
    return ok(updated);
  }

  isValidChecksum(payload: PaymentWebhookPayload, checksum: string): boolean {
    const properties = payload.signature?.properties ?? [];
    const values = properties.map((path) => this.readPath(payload, path));
    const timestamp = String(payload.timestamp ?? '');
    const raw = `${values.join('')}${timestamp}${this.eventsSecret}`;
    const expected = createHash('sha256').update(raw).digest('hex');
    return expected === checksum;
  }

  private readPath(payload: PaymentWebhookPayload, path: string): string {
    const parts = path.split('.');
    let current: unknown = payload;
    for (const part of parts) {
      if (current && typeof current === 'object' && part in current) {
        current = (current as Record<string, unknown>)[part];
      } else {
        return '';
      }
    }
    return current == null ? '' : String(current);
  }
}
