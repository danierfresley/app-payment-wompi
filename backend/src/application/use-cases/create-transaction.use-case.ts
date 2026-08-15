import { randomUUID } from 'crypto';
import { Inject, Injectable } from '@nestjs/common';
import { Transaction } from '../../domain/entities/transaction';
import {
  DomainError,
  notFound,
  paymentFailed,
  validation,
} from '../../domain/errors/domain-error';
import type { AppFees } from '../../domain/ports/app-fees';
import type { CustomerRepository } from '../../domain/ports/customer.repository';
import type { DeliveryRepository } from '../../domain/ports/delivery.repository';
import type { PaymentGateway } from '../../domain/ports/payment.gateway';
import type { ProductRepository } from '../../domain/ports/product.repository';
import type { TransactionRepository } from '../../domain/ports/transaction.repository';
import {
  APP_FEES,
  CUSTOMER_REPOSITORY,
  DELIVERY_REPOSITORY,
  PAYMENT_GATEWAY,
  PRODUCT_REPOSITORY,
  TRANSACTION_REPOSITORY,
} from '../../domain/ports/tokens';
import { err, ok, Result } from '../result';
import { mapProviderStatus } from './map-provider-status';

export interface CreateTransactionInput {
  productId: string;
  customerId: string;
  deliveryId: string;
  quantity: number;
  cardToken: string;
  last4?: string;
  cardBrand?: string;
  installments?: number;
  acceptanceToken: string;
  acceptPersonalAuth: string;
}

@Injectable()
export class CreateTransactionUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly products: ProductRepository,
    @Inject(CUSTOMER_REPOSITORY)
    private readonly customers: CustomerRepository,
    @Inject(DELIVERY_REPOSITORY)
    private readonly deliveries: DeliveryRepository,
    @Inject(TRANSACTION_REPOSITORY)
    private readonly transactions: TransactionRepository,
    @Inject(PAYMENT_GATEWAY)
    private readonly payment: PaymentGateway,
    @Inject(APP_FEES)
    private readonly fees: AppFees,
  ) {}

  async execute(
    input: CreateTransactionInput,
  ): Promise<Result<Transaction, DomainError>> {
    if (!input.cardToken?.trim()) {
      return err(validation('Card token is required'));
    }
    if (!input.acceptanceToken?.trim() || !input.acceptPersonalAuth?.trim()) {
      return err(validation('Acceptance tokens are required'));
    }
    if (!Number.isInteger(input.quantity) || input.quantity < 1) {
      return err(validation('Quantity must be a positive integer'));
    }

    const product = await this.products.findById(input.productId);
    if (!product) {
      return err(notFound('Product not found'));
    }
    if (product.stock < input.quantity) {
      return err(validation('Insufficient stock'));
    }

    const customer = await this.customers.findById(input.customerId);
    if (!customer) {
      return err(notFound('Customer not found'));
    }

    const delivery = await this.deliveries.findById(input.deliveryId);
    if (!delivery) {
      return err(notFound('Delivery not found'));
    }
    if (delivery.customerId !== customer.id) {
      return err(validation('Delivery does not belong to the customer'));
    }

    const productAmount = product.priceInCents * input.quantity;
    const baseFee = this.fees.baseFeeCents;
    const deliveryFee = this.fees.deliveryFeeCents;
    const totalAmount = productAmount + baseFee + deliveryFee;
    const reference = `CHK-${Date.now()}-${randomUUID().slice(0, 8)}`;

    let pending: Transaction;
    try {
      pending = await this.transactions.createPendingAndReserveStock({
        reference,
        productId: product.id,
        customerId: customer.id,
        deliveryId: delivery.id,
        quantity: input.quantity,
        productAmount,
        baseFee,
        deliveryFee,
        totalAmount,
        last4: input.last4 ?? null,
        cardBrand: input.cardBrand ?? null,
      });
    } catch {
      return err(validation('Insufficient stock'));
    }

    try {
      const created = await this.payment.createCardTransaction({
        amountInCents: totalAmount,
        currency: 'COP',
        customerEmail: customer.email,
        reference,
        cardToken: input.cardToken,
        installments: input.installments ?? 1,
        acceptanceToken: input.acceptanceToken,
        acceptPersonalAuth: input.acceptPersonalAuth,
      });

      let provider = created;
      if (mapProviderStatus(created.status) === 'PENDING') {
        provider = await this.payment.waitForSettlement(created.id);
      }

      const localStatus = mapProviderStatus(provider.status);
      const finalized = await this.transactions.applyProviderResult(pending.id, {
        status: localStatus === 'PENDING' ? 'PENDING' : localStatus,
        providerId: provider.id,
        providerStatus: provider.status,
      });
      return ok(finalized);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Payment provider error';
      const failed = await this.transactions.applyProviderResult(pending.id, {
        status: 'ERROR',
        providerStatus: message,
      });
      return err(paymentFailed(message, failed));
    }
  }
}
