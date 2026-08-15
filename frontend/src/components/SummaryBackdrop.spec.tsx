import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SummaryBackdrop } from './SummaryBackdrop';
import { createTestStore, renderWithStore, sampleProduct } from '../test-utils';

describe('SummaryBackdrop', () => {
  it('shows fee breakdown and can go back', async () => {
    const user = userEvent.setup();
    const store = createTestStore({
      checkout: {
        step: 'summary',
        last4: '4242',
        cardBrand: 'visa',
        delivery: {
          address: 'Cra 7',
          city: 'Bogotá',
          region: 'Cundinamarca',
          postalCode: '110111',
        },
      },
    });
    renderWithStore(<SummaryBackdrop />, { store });
    expect(screen.getByText('Confirma el pago')).toBeInTheDocument();
    expect(screen.getByText(/tarifa base/i)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /volver/i }));
    expect(store.getState().checkout.step).toBe('form');
  });

  it('renders nothing without a selected product', () => {
    const store = createTestStore({
      product: { items: [], selectedId: null, status: 'ready', error: null },
    });
    const { container } = renderWithStore(<SummaryBackdrop />, { store });
    expect(container.firstChild).toBeNull();
    expect(sampleProduct.name).toBeDefined();
  });

  it('dispatches payment when all tokens are present', async () => {
    const user = userEvent.setup();
    const store = createTestStore({
      checkout: {
        step: 'summary',
        customerId: 'c1',
        deliveryId: 'd1',
        cardToken: 'tok',
        last4: '4242',
        cardBrand: 'visa',
        acceptanceToken: 'acc',
        acceptPersonalAuth: 'per',
      },
    });
    const dispatchSpy = jest.spyOn(store, 'dispatch');
    renderWithStore(<SummaryBackdrop />, { store });
    await user.click(screen.getByRole('button', { name: /pagar ahora/i }));
    expect(dispatchSpy).toHaveBeenCalled();
  });
});
