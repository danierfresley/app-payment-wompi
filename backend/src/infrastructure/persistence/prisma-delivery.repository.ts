import { Injectable } from '@nestjs/common';
import { Delivery, DeliveryInput } from '../../domain/entities/delivery';
import { DeliveryRepository } from '../../domain/ports/delivery.repository';
import { toDelivery } from './mappers';
import { PrismaService } from './prisma.service';

@Injectable()
export class PrismaDeliveryRepository implements DeliveryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Delivery | null> {
    const row = await this.prisma.delivery.findUnique({ where: { id } });
    return row ? toDelivery(row) : null;
  }

  async create(input: DeliveryInput): Promise<Delivery> {
    const row = await this.prisma.delivery.create({ data: input });
    return toDelivery(row);
  }
}
