import { Inject, Injectable } from '@nestjs/common';
import { Customer, CustomerInput } from '../../domain/entities/customer';
import { DomainError, validation } from '../../domain/errors/domain-error';
import { CUSTOMER_REPOSITORY } from '../../domain/ports/tokens';
import type { CustomerRepository } from '../../domain/ports/customer.repository';
import { err, ok, Result } from '../result';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

@Injectable()
export class UpsertCustomerUseCase {
  constructor(
    @Inject(CUSTOMER_REPOSITORY)
    private readonly customers: CustomerRepository,
  ) {}

  async execute(input: CustomerInput): Promise<Result<Customer, DomainError>> {
    if (!input.name?.trim()) {
      return err(validation('Name is required'));
    }
    if (!EMAIL_RE.test(input.email ?? '')) {
      return err(validation('A valid email is required'));
    }
    if (!input.phone?.trim()) {
      return err(validation('Phone is required'));
    }
    if (!input.documentType?.trim() || !input.documentNumber?.trim()) {
      return err(validation('Document type and number are required'));
    }

    const customer = await this.customers.upsertByEmail({
      ...input,
      name: input.name.trim(),
      email: input.email.trim().toLowerCase(),
      phone: input.phone.trim(),
      documentType: input.documentType.trim(),
      documentNumber: input.documentNumber.trim(),
    });
    return ok(customer);
  }
}
