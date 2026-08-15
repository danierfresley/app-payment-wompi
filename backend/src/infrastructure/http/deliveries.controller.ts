import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateDeliveryUseCase } from '../../application/use-cases/create-delivery.use-case';
import { CreateDeliveryDto } from './dto/delivery.dto';
import { unwrap } from './http-result';

@ApiTags('deliveries')
@Controller('deliveries')
export class DeliveriesController {
  constructor(private readonly createDelivery: CreateDeliveryUseCase) {}

  @Post()
  @ApiOperation({ summary: 'Create delivery details for a customer' })
  async create(@Body() body: CreateDeliveryDto) {
    return unwrap(await this.createDelivery.execute(body));
  }
}
