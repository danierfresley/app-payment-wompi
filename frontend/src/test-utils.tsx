import { configureStore } from '@reduxjs/toolkit';
import { render, type RenderOptions } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import type { ReactElement, ReactNode } from 'react';
import checkoutReducer, {
  initialCheckoutState,
} from './features/checkout/checkoutSlice';
import productReducer from './features/product/productSlice';
import transactionReducer from './features/transaction/transactionSlice';

export const sampleProduct = {
  id: '11111111-1111-1111-1111-111111111111',
  name: 'Nova Pulse ANC',
  description: 'Auriculares',
  priceInCents: 18990000,
  imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format',
  stock: 12,
};

export const createTestStore = (preloaded?: {
  product?: Partial<{
    items: typeof sampleProduct[];
    selectedId: string | null;
    status: 'idle' | 'loading' | 'ready' | 'error';
    error: string | null;
  }>;
  checkout?: Partial<typeof initialCheckoutState>;
  transaction?: Partial<{
    current: unknown;
    status: 'idle' | 'paying' | 'ready' | 'error';
    error: string | null;
  }>;
}) =>
  configureStore({
    reducer: {
      product: productReducer,
      checkout: checkoutReducer,
      transaction: transactionReducer,
    },
    preloadedState: {
      product: {
        items: [sampleProduct],
        selectedId: sampleProduct.id,
        status: 'ready' as const,
        error: null,
        ...preloaded?.product,
      },
      checkout: { ...initialCheckoutState, ...preloaded?.checkout },
      transaction: {
        current: null,
        status: 'idle' as const,
        error: null,
        ...preloaded?.transaction,
      },
    },
  });

export const renderWithStore = (
  ui: ReactElement,
  options?: { store?: ReturnType<typeof createTestStore>; route?: string } & Omit<
    RenderOptions,
    'wrapper'
  >,
) => {
  const store = options?.store ?? createTestStore();
  const route = options?.route ?? '/';
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <Provider store={store}>
      <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>
    </Provider>
  );
  return { store, ...render(ui, { wrapper: Wrapper, ...options }) };
};
