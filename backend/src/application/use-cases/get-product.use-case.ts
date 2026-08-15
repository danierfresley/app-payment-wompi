import { Inject, Injectable } from '@nestjs/common';
import { Product } from '../../domain/entities/product';
import { DomainError, notFound } from '../../domain/errors/domain-error';
import { PRODUCT_REPOSITORY } from '../../domain/ports/tokens';
import type { ProductRepository } from '../../domain/ports/product.repository';
import { err, ok, Result } from '../result';

@Injectable()
export class GetProductUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly products: ProductRepository,
  ) {}

  async execute(id: string): Promise<Result<Product, DomainError>> {
    const product = await this.products.findById(id);
    if (!product) {
      return err(notFound('Product not found'));
    }
    return ok(product);
  }
}
