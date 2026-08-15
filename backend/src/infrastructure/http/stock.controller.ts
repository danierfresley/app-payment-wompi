import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { GetStockUseCase } from '../../application/use-cases/get-stock.use-case';
import { unwrap } from './http-result';

@ApiTags('stock')
@Controller('stock')
export class StockController {
  constructor(private readonly getStock: GetStockUseCase) {}

  @Get(':productId')
  @ApiOperation({ summary: 'Get remaining stock for a product' })
  async getByProduct(@Param('productId') productId: string) {
    return unwrap(await this.getStock.execute(productId));
  }
}
