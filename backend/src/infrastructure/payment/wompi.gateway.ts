import { Injectable } from '@nestjs/common';
import {
  CardPaymentRequest,
  PaymentGateway,
  ProviderTransaction,
} from '../../domain/ports/payment.gateway';
import { buildIntegritySignature } from './integrity';

interface WompiConfig {
  baseUrl: string;
  privateKey: string;
  integrityKey: string;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

@Injectable()
export class WompiGateway implements PaymentGateway {
  constructor(private readonly config: WompiConfig) {}

  async createCardTransaction(
    request: CardPaymentRequest,
  ): Promise<ProviderTransaction> {
    const signature = buildIntegritySignature(
      request.reference,
      request.amountInCents,
      request.currency,
      this.config.integrityKey,
    );

    const response = await fetch(`${this.config.baseUrl}/transactions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.config.privateKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount_in_cents: request.amountInCents,
        currency: request.currency,
        customer_email: request.customerEmail,
        reference: request.reference,
        acceptance_token: request.acceptanceToken,
        accept_personal_auth: request.acceptPersonalAuth,
        signature,
        payment_method: {
          type: 'CARD',
          token: request.cardToken,
          installments: request.installments,
        },
      }),
    });

    const body = (await response.json()) as {
      data?: { id: string; status: string; reference: string };
      error?: { reason?: string; messages?: unknown };
    };

    if (!response.ok || !body.data) {
      const reason =
        body.error?.reason ??
        `Provider rejected the transaction (${response.status})`;
      throw new Error(reason);
    }

    return {
      id: body.data.id,
      status: body.data.status,
      reference: body.data.reference,
    };
  }

  async getTransaction(providerId: string): Promise<ProviderTransaction> {
    const response = await fetch(
      `${this.config.baseUrl}/transactions/${providerId}`,
      {
        headers: {
          Authorization: `Bearer ${this.config.privateKey}`,
        },
      },
    );
    const body = (await response.json()) as {
      data?: { id: string; status: string; reference: string };
    };
    if (!response.ok || !body.data) {
      throw new Error('Unable to fetch provider transaction');
    }
    return {
      id: body.data.id,
      status: body.data.status,
      reference: body.data.reference,
    };
  }

  async waitForSettlement(
    providerId: string,
    attempts = 5,
    delayMs = 1000,
  ): Promise<ProviderTransaction> {
    let last = await this.getTransaction(providerId);
    for (let i = 0; i < attempts; i += 1) {
      if (last.status !== 'PENDING') {
        return last;
      }
      await sleep(delayMs);
      last = await this.getTransaction(providerId);
    }
    return last;
  }
}
