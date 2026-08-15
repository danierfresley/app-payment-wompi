import { Inject, Injectable } from '@nestjs/common';
import { Delivery, DeliveryInput } from '../../domain/entities/delivery';
import { DomainError, notFound, validation } from '../../domain/errors/domain-error';
import { CUSTOMER_REPOSITORY, DELIVERY_REPOSITORY } from '../../domain/ports/tokens';
import type { CustomerRepository } from '../../domain/ports/customer.repository';
import type { DeliveryRepository } from '../../domain/ports/delivery.repository';
import { err, ok, Result } from '../result';

@Injectable()
export class CreateDeliveryUseCase {
  constructor(
    @Inject(CUSTOMER_REPOSITORY)
    private readonly customers: CustomerRepository,
    @Inject(DELIVERY_REPOSITORY)
    private readonly deliveries: DeliveryRepository,
  ) {}

  async execute(input: DeliveryInput): Promise<Result<Delivery, DomainError>> {
    if (!input.address?.trim() || !input.city?.trim() || !input.region?.trim()) {
      return err(validation('Address, city and region are required'));
    }
    if (!input.postalCode?.trim()) {
      return err(validation('Postal code is required'));
    }

    const customer = await this.customers.findById(input.customerId);
    if (!customer) {
      return err(notFound('Customer not found'));
    }

    const delivery = await this.deliveries.create({
      customerId: input.customerId,
      address: input.address.trim(),
      city: input.city.trim(),
      region: input.region.trim(),
      postalCode: input.postalCode.trim(),
    });
    return ok(delivery);
  }
}
