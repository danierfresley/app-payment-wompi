import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CreateDeliveryUseCase } from './application/use-cases/create-delivery.use-case';
import { CreateTransactionUseCase } from './application/use-cases/create-transaction.use-case';
import { GetProductUseCase } from './application/use-cases/get-product.use-case';
import { GetProductsUseCase } from './application/use-cases/get-products.use-case';
import { GetStockUseCase } from './application/use-cases/get-stock.use-case';
import { GetTransactionUseCase } from './application/use-cases/get-transaction.use-case';
import { HandlePaymentWebhookUseCase } from './application/use-cases/handle-payment-webhook.use-case';
import { SyncTransactionUseCase } from './application/use-cases/sync-transaction.use-case';
import { UpsertCustomerUseCase } from './application/use-cases/upsert-customer.use-case';
import { AppFees } from './domain/ports/app-fees';
import {
  APP_FEES,
  CUSTOMER_REPOSITORY,
  DELIVERY_REPOSITORY,
  PAYMENT_GATEWAY,
  PRODUCT_REPOSITORY,
  TRANSACTION_REPOSITORY,
} from './domain/ports/tokens';
import { CustomersController } from './infrastructure/http/customers.controller';
import { DeliveriesController } from './infrastructure/http/deliveries.controller';
import { HealthController } from './infrastructure/http/health.controller';
import { ProductsController } from './infrastructure/http/products.controller';
import { StockController } from './infrastructure/http/stock.controller';
import { TransactionsController } from './infrastructure/http/transactions.controller';
import { WebhooksController } from './infrastructure/http/webhooks.controller';
import { WompiGateway } from './infrastructure/payment/wompi.gateway';
import { PrismaCustomerRepository } from './infrastructure/persistence/prisma-customer.repository';
import { PrismaDeliveryRepository } from './infrastructure/persistence/prisma-delivery.repository';
import { PrismaProductRepository } from './infrastructure/persistence/prisma-product.repository';
import { PrismaTransactionRepository } from './infrastructure/persistence/prisma-transaction.repository';
import { PrismaService } from './infrastructure/persistence/prisma.service';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true })],
  controllers: [
    HealthController,
    ProductsController,
    StockController,
    CustomersController,
    DeliveriesController,
    TransactionsController,
    WebhooksController,
  ],
  providers: [
    PrismaService,
    GetProductsUseCase,
    GetProductUseCase,
    GetStockUseCase,
    UpsertCustomerUseCase,
    CreateDeliveryUseCase,
    CreateTransactionUseCase,
    GetTransactionUseCase,
    SyncTransactionUseCase,
    {
      provide: HandlePaymentWebhookUseCase,
      useFactory: (transactions: PrismaTransactionRepository, config: ConfigService) =>
        new HandlePaymentWebhookUseCase(
          transactions,
          config.get<string>('WOMPI_EVENTS_KEY', ''),
        ),
      inject: [TRANSACTION_REPOSITORY, ConfigService],
    },
    { provide: PRODUCT_REPOSITORY, useClass: PrismaProductRepository },
    { provide: CUSTOMER_REPOSITORY, useClass: PrismaCustomerRepository },
    { provide: DELIVERY_REPOSITORY, useClass: PrismaDeliveryRepository },
    { provide: TRANSACTION_REPOSITORY, useClass: PrismaTransactionRepository },
    {
      provide: PAYMENT_GATEWAY,
      useFactory: (config: ConfigService) =>
        new WompiGateway({
          baseUrl: config.get<string>(
            'WOMPI_BASE_URL',
            'https://api-sandbox.co.uat.wompi.dev/v1',
          ),
          privateKey: config.get<string>('WOMPI_PRIVATE_KEY', ''),
          integrityKey: config.get<string>('WOMPI_INTEGRITY_KEY', ''),
        }),
      inject: [ConfigService],
    },
    {
      provide: APP_FEES,
      useFactory: (config: ConfigService): AppFees => ({
        baseFeeCents: Number(config.get('BASE_FEE_CENTS', 350000)),
        deliveryFeeCents: Number(config.get('DELIVERY_FEE_CENTS', 890000)),
      }),
      inject: [ConfigService],
    },
  ],
})
export class AppModule {}
