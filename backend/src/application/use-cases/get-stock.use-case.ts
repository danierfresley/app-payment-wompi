import { Inject, Injectable } from '@nestjs/common';
import { DomainError, notFound } from '../../domain/errors/domain-error';
import { PRODUCT_REPOSITORY } from '../../domain/ports/tokens';
import type { ProductRepository } from '../../domain/ports/product.repository';
import { err, ok, Result } from '../result';

export interface StockView {
  productId: string;
  stock: number;
}

@Injectable()
export class GetStockUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly products: ProductRepository,
  ) {}

  async execute(productId: string): Promise<Result<StockView, DomainError>> {
    const stock = await this.products.getStock(productId);
    if (stock === null) {
      return err(notFound('Product not found'));
    }
    return ok({ productId, stock });
  }
}
