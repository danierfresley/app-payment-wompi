import reducer, { fetchProducts, selectProduct } from './productSlice';
import { sampleProduct } from '../../test-utils';

describe('productSlice', () => {
  const initial = {
    items: [],
    selectedId: null,
    status: 'idle' as const,
    error: null,
  };

  it('selects a product and handles fetch lifecycle', () => {
    let state = reducer(initial, selectProduct('abc'));
    expect(state.selectedId).toBe('abc');
    state = reducer(state, { type: fetchProducts.pending.type });
    expect(state.status).toBe('loading');
    state = reducer(state, {
      type: fetchProducts.fulfilled.type,
      payload: [sampleProduct],
    });
    expect(state.items).toHaveLength(1);
    state = reducer(initial, {
      type: fetchProducts.rejected.type,
      error: { message: 'boom' },
    });
    expect(state.status).toBe('error');
  });
});
