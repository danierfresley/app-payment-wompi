import { CustomersController } from './customers.controller';
import { DeliveriesController } from './deliveries.controller';
import { ProductsController } from './products.controller';
import { StockController } from './stock.controller';
import { TransactionsController } from './transactions.controller';
import { WebhooksController } from './webhooks.controller';
import { ok } from '../../application/result';

const product = {
  id: 'p1',
  name: 'Nova',
  description: 'd',
  priceInCents: 1,
  imageUrl: 'u',
  stock: 1,
};

describe('http controllers', () => {
  it('unwraps catalog and checkout use cases', async () => {
    const products = new ProductsController(
      { execute: async () => ok([product]) } as never,
      { execute: async () => ok(product) } as never,
    );
    await expect(products.list()).resolves.toEqual([product]);
    await expect(products.getById('p1')).resolves.toEqual(product);

    const stock = new StockController({
      execute: async () => ok({ productId: 'p1', stock: 1 }),
    } as never);
    await expect(stock.getByProduct('p1')).resolves.toEqual({
      productId: 'p1',
      stock: 1,
    });

    const customers = new CustomersController({
      execute: async () => ok({ id: 'c1' }),
    } as never);
    await expect(
      customers.upsert({
        name: 'A',
        email: 'a@a.com',
        phone: '1',
        documentType: 'CC',
        documentNumber: '1',
      }),
    ).resolves.toEqual({ id: 'c1' });

    const deliveries = new DeliveriesController({
      execute: async () => ok({ id: 'd1' }),
    } as never);
    await expect(
      deliveries.create({
        customerId: 'c1',
        address: 'a',
        city: 'b',
        region: 'c',
        postalCode: '1',
      }),
    ).resolves.toEqual({ id: 'd1' });

    const transactions = new TransactionsController(
      { execute: async () => ok({ id: 't1' }) } as never,
      { execute: async () => ok({ id: 't1' }) } as never,
      { execute: async () => ok({ id: 't1' }) } as never,
    );
    await expect(
      transactions.create({
        productId: 'p1',
        customerId: 'c1',
        deliveryId: 'd1',
        quantity: 1,
        cardToken: 'tok',
        acceptanceToken: 'a',
        acceptPersonalAuth: 'b',
      }),
    ).resolves.toEqual({ id: 't1' });
    await expect(transactions.getById('t1')).resolves.toEqual({ id: 't1' });
    await expect(transactions.sync('t1')).resolves.toEqual({ id: 't1' });

    const webhooks = new WebhooksController({
      execute: async () => ok({ ignored: true }),
    } as never);
    await expect(webhooks.payments({})).resolves.toEqual({ ignored: true });
  });
});
