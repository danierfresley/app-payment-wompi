import { Inject, Injectable } from '@nestjs/common';
import { Product } from '../../domain/entities/product';
import { DomainError } from '../../domain/errors/domain-error';
import { PRODUCT_REPOSITORY } from '../../domain/ports/tokens';
import type { ProductRepository } from '../../domain/ports/product.repository';
import { ok, Result } from '../result';

@Injectable()
export class GetProductsUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly products: ProductRepository,
  ) {}

  async execute(): Promise<Result<Product[], DomainError>> {
    const items = await this.products.findAll();
    return ok(items);
  }
}
