import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StatusPage } from './StatusPage';
import { createTestStore, renderWithStore } from '../test-utils';

const current = {
  id: 't1',
  reference: 'CHK-99',
  productId: 'p1',
  customerId: 'c1',
  deliveryId: 'd1',
  quantity: 1,
  productAmount: 100,
  baseFee: 10,
  deliveryFee: 20,
  totalAmount: 13000,
  status: 'APPROVED' as const,
};

describe('StatusPage', () => {
  it('renders an approved payment and returns home', async () => {
    const user = userEvent.setup();
    const store = createTestStore({
      transaction: { current, status: 'ready', error: null },
      checkout: { step: 'status' },
    });
    renderWithStore(<StatusPage />, { store, route: '/status' });
    expect(screen.getByText('Pago aprobado')).toBeInTheDocument();
    expect(screen.getByText('CHK-99')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /volver a la tienda/i }));
  });
});
