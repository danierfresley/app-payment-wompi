import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { UpsertCustomerUseCase } from '../../application/use-cases/upsert-customer.use-case';
import { UpsertCustomerDto } from './dto/customer.dto';
import { unwrap } from './http-result';

@ApiTags('customers')
@Controller('customers')
export class CustomersController {
  constructor(private readonly upsertCustomer: UpsertCustomerUseCase) {}

  @Post()
  @ApiOperation({ summary: 'Create or update a customer by email' })
  async upsert(@Body() body: UpsertCustomerDto) {
    return unwrap(await this.upsertCustomer.execute(body));
  }
}
