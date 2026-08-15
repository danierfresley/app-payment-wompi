import { Injectable } from '@nestjs/common';
import { NewTransaction, Transaction } from '../../domain/entities/transaction';
import {
  TransactionRepository,
  TransactionStatusPatch,
} from '../../domain/ports/transaction.repository';
import { toTransaction } from './mappers';
import { PrismaService } from './prisma.service';

@Injectable()
export class PrismaTransactionRepository implements TransactionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createPendingAndReserveStock(
    input: NewTransaction,
  ): Promise<Transaction> {
    return this.prisma.$transaction(async (tx) => {
      const reserved = await tx.product.updateMany({
        where: { id: input.productId, stock: { gte: input.quantity } },
        data: { stock: { decrement: input.quantity } },
      });
      if (reserved.count === 0) {
        throw new Error('INSUFFICIENT_STOCK');
      }

      const row = await tx.transaction.create({
        data: {
          ...input,
          status: 'PENDING',
          stockReserved: true,
        },
      });
      return toTransaction(row);
    });
  }

  async findById(id: string): Promise<Transaction | null> {
    const row = await this.prisma.transaction.findUnique({ where: { id } });
    return row ? toTransaction(row) : null;
  }

  async findByReference(reference: string): Promise<Transaction | null> {
    const row = await this.prisma.transaction.findUnique({
      where: { reference },
    });
    return row ? toTransaction(row) : null;
  }

  async findByProviderId(providerId: string): Promise<Transaction | null> {
    const row = await this.prisma.transaction.findFirst({
      where: { providerId },
    });
    return row ? toTransaction(row) : null;
  }

  async applyProviderResult(
    id: string,
    patch: TransactionStatusPatch,
  ): Promise<Transaction> {
    return this.prisma.$transaction(async (tx) => {
      const current = await tx.transaction.findUnique({ where: { id } });
      if (!current) {
        throw new Error('TRANSACTION_NOT_FOUND');
      }

      if (
        current.status === 'APPROVED' ||
        current.status === 'DECLINED' ||
        current.status === 'ERROR'
      ) {
        return toTransaction(current);
      }

      if (patch.status === 'APPROVED') {
        await tx.delivery.update({
          where: { id: current.deliveryId },
          data: { status: 'ASSIGNED' },
        });
      }

      if (
        (patch.status === 'DECLINED' || patch.status === 'ERROR') &&
        current.stockReserved
      ) {
        await tx.product.update({
          where: { id: current.productId },
          data: { stock: { increment: current.quantity } },
        });
      }

      const row = await tx.transaction.update({
        where: { id },
        data: {
          status: patch.status,
          providerId: patch.providerId ?? current.providerId,
          providerStatus: patch.providerStatus ?? current.providerStatus,
          stockReserved:
            patch.status === 'DECLINED' || patch.status === 'ERROR'
              ? false
              : current.stockReserved,
        },
      });
      return toTransaction(row);
    });
  }
}
