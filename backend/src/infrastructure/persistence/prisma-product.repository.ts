import { Injectable } from '@nestjs/common';
import { Product } from '../../domain/entities/product';
import { ProductRepository } from '../../domain/ports/product.repository';
import { toProduct } from './mappers';
import { PrismaService } from './prisma.service';

@Injectable()
export class PrismaProductRepository implements ProductRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<Product[]> {
    const rows = await this.prisma.product.findMany({
      orderBy: { name: 'asc' },
    });
    return rows.map(toProduct);
  }

  async findById(id: string): Promise<Product | null> {
    const row = await this.prisma.product.findUnique({ where: { id } });
    return row ? toProduct(row) : null;
  }

  async getStock(id: string): Promise<number | null> {
    const row = await this.prisma.product.findUnique({
      where: { id },
      select: { stock: true },
    });
    return row ? row.stock : null;
  }
}
