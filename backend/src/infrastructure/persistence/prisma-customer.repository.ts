import { Injectable } from '@nestjs/common';
import { Customer, CustomerInput } from '../../domain/entities/customer';
import { CustomerRepository } from '../../domain/ports/customer.repository';
import { toCustomer } from './mappers';
import { PrismaService } from './prisma.service';

@Injectable()
export class PrismaCustomerRepository implements CustomerRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Customer | null> {
    const row = await this.prisma.customer.findUnique({ where: { id } });
    return row ? toCustomer(row) : null;
  }

  async upsertByEmail(input: CustomerInput): Promise<Customer> {
    const row = await this.prisma.customer.upsert({
      where: { email: input.email },
      create: input,
      update: {
        name: input.name,
        phone: input.phone,
        documentType: input.documentType,
        documentNumber: input.documentNumber,
      },
    });
    return toCustomer(row);
  }
}
