import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProductPage } from './ProductPage';
import { createTestStore, renderWithStore, sampleProduct } from '../test-utils';

jest.mock('../services/api', () => ({
  api: {
    listProducts: jest.fn().mockResolvedValue([
      {
        id: '11111111-1111-1111-1111-111111111111',
        name: 'Nova Pulse ANC',
        description: 'Auriculares',
        priceInCents: 18990000,
        imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format',
        stock: 12,
      },
    ]),
  },
}));

jest.mock('../services/paymentClient', () => ({
  fetchAcceptance: jest.fn().mockResolvedValue({
    acceptanceToken: 'acc',
    acceptPersonalAuth: 'per',
    permalink: 'http://terms',
    personalPermalink: 'http://data',
  }),
  tokenizeCard: jest.fn(),
}));

describe('ProductPage', () => {
  it('renders the selected product and opens the payment modal', async () => {
    const user = userEvent.setup();
    const store = createTestStore();
    renderWithStore(<ProductPage />, { store });
    expect(screen.getByText('Nova Pulse ANC')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /pagar con tarjeta de crédito/i }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('shows a loading state', () => {
    const store = createTestStore({
      product: { items: [], selectedId: null, status: 'loading', error: 'falló' },
    });
    renderWithStore(<ProductPage />, { store });
    expect(screen.getByText(/cargando catálogo/i)).toBeInTheDocument();
    expect(screen.getByText(/falló/i)).toBeInTheDocument();
  });

  it('disables checkout when the product is sold out', () => {
    const store = createTestStore({
      product: {
        items: [{ ...sampleProduct, stock: 0 }],
        selectedId: sampleProduct.id,
        status: 'ready',
        error: null,
      },
    });
    renderWithStore(<ProductPage />, { store });
    expect(screen.getByRole('button', { name: /sin stock/i })).toBeDisabled();
  });
});
