import { GetProductUseCase } from './get-product.use-case';
import { GetProductsUseCase } from './get-products.use-case';
import { GetStockUseCase } from './get-stock.use-case';

const product = {
  id: 'p1',
  name: 'Nova',
  description: 'desc',
  priceInCents: 1000,
  imageUrl: 'http://img',
  stock: 4,
};

describe('catalog use cases', () => {
  it('lists products', async () => {
    const useCase = new GetProductsUseCase({
      findAll: async () => [product],
      findById: async () => product,
      getStock: async () => 4,
    });
    const result = await useCase.execute();
    expect(result.ok && result.value).toHaveLength(1);
  });

  it('returns a product or not found', async () => {
    const found = new GetProductUseCase({
      findAll: async () => [],
      findById: async () => product,
      getStock: async () => 4,
    });
    const missing = new GetProductUseCase({
      findAll: async () => [],
      findById: async () => null,
      getStock: async () => null,
    });
    expect((await found.execute('p1')).ok).toBe(true);
    expect((await missing.execute('x')).ok).toBe(false);
  });

  it('reads stock', async () => {
    const useCase = new GetStockUseCase({
      findAll: async () => [],
      findById: async () => product,
      getStock: async (id) => (id === 'p1' ? 4 : null),
    });
    expect((await useCase.execute('p1')).ok).toBe(true);
    expect((await useCase.execute('missing')).ok).toBe(false);
  });
});
