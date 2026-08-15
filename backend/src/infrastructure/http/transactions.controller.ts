import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateTransactionUseCase } from '../../application/use-cases/create-transaction.use-case';
import { GetTransactionUseCase } from '../../application/use-cases/get-transaction.use-case';
import { SyncTransactionUseCase } from '../../application/use-cases/sync-transaction.use-case';
import { CreateTransactionDto } from './dto/transaction.dto';
import { unwrap } from './http-result';

@ApiTags('transactions')
@Controller('transactions')
export class TransactionsController {
  constructor(
    private readonly createTransaction: CreateTransactionUseCase,
    private readonly getTransaction: GetTransactionUseCase,
    private readonly syncTransaction: SyncTransactionUseCase,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Create a PENDING transaction and charge the card token',
  })
  async create(@Body() body: CreateTransactionDto) {
    return unwrap(await this.createTransaction.execute(body));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a local transaction' })
  async getById(@Param('id') id: string) {
    return unwrap(await this.getTransaction.execute(id));
  }

  @Patch(':id/sync')
  @ApiOperation({
    summary: 'Re-query the payment provider and apply stock/delivery updates',
  })
  async sync(@Param('id') id: string) {
    return unwrap(await this.syncTransaction.execute(id));
  }
}
