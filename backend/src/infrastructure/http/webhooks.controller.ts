import { Body, Controller, Headers, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { HandlePaymentWebhookUseCase } from '../../application/use-cases/handle-payment-webhook.use-case';
import type { PaymentWebhookPayload } from '../../application/use-cases/handle-payment-webhook.use-case';
import { unwrap } from './http-result';

@ApiTags('webhooks')
@Controller('webhooks')
export class WebhooksController {
  constructor(private readonly handleWebhook: HandlePaymentWebhookUseCase) {}

  @Post('payments')
  @ApiOperation({ summary: 'Receive payment provider events' })
  async payments(
    @Body() body: PaymentWebhookPayload,
    @Headers('x-event-checksum') checksum?: string,
  ) {
    return unwrap(await this.handleWebhook.execute(body, checksum));
  }
}
