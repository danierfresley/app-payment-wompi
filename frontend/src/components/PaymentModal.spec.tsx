import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PaymentModal } from './PaymentModal';
import { createTestStore, renderWithStore } from '../test-utils';

jest.mock('../services/paymentClient', () => ({
  fetchAcceptance: jest.fn().mockResolvedValue({
    acceptanceToken: 'acc',
    acceptPersonalAuth: 'per',
    permalink: 'http://terms',
    personalPermalink: 'http://data',
  }),
  tokenizeCard: jest.fn().mockResolvedValue('tok_test'),
}));

jest.mock('../services/api', () => ({
  api: {
    upsertCustomer: jest.fn().mockResolvedValue({ id: 'c1' }),
    createDelivery: jest.fn().mockResolvedValue({ id: 'd1' }),
  },
}));

describe('PaymentModal', () => {
  it('tokenizes a valid card and moves to summary', async () => {
    const user = userEvent.setup();
    const store = createTestStore({
      checkout: { step: 'form' },
    });
    renderWithStore(<PaymentModal />, { store });

    await user.type(screen.getByPlaceholderText(/4242 4242 4242 4242/i), '4242424242424242');
    const inputs = screen.getAllByRole('textbox');
    await user.type(inputs[1], 'ANA PEREZ');
    await user.type(screen.getByPlaceholderText('12'), '12');
    await user.type(screen.getByPlaceholderText('29'), '29');
    const cvc = screen.getByLabelText(/cvc/i);
    await user.type(cvc, '123');
    await user.type(screen.getByLabelText(/^nombre$/i), 'Ana Perez');
    await user.type(screen.getByLabelText(/correo/i), 'ana@test.com');
    await user.type(screen.getByLabelText(/teléfono/i), '3001234567');
    await user.type(screen.getByLabelText(/documento/i), '123');
    await user.type(screen.getByLabelText(/dirección/i), 'Cra 7 # 1');
    await user.type(screen.getByLabelText(/ciudad/i), 'Bogotá');
    await user.type(screen.getByLabelText(/región/i), 'Cundinamarca');
    await user.type(screen.getByLabelText(/código postal/i), '110111');
    const checks = screen.getAllByRole('checkbox');
    await user.click(checks[0]);
    await user.click(checks[1]);
    await user.click(screen.getByRole('button', { name: /continuar al resumen/i }));

    await waitFor(() => {
      expect(store.getState().checkout.step).toBe('summary');
      expect(store.getState().checkout.cardToken).toBe('tok_test');
    });
  });
});
