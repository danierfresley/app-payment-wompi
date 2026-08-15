import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { GetProductUseCase } from '../../application/use-cases/get-product.use-case';
import { GetProductsUseCase } from '../../application/use-cases/get-products.use-case';
import { unwrap } from './http-result';

@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(
    private readonly getProducts: GetProductsUseCase,
    private readonly getProduct: GetProductUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List products with current stock' })
  async list() {
    return unwrap(await this.getProducts.execute());
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a product by id' })
  async getById(@Param('id') id: string) {
    return unwrap(await this.getProduct.execute(id));
  }
}
