import reducer, {
  initialCheckoutState,
  resetCheckout,
  setAcceptance,
  setAcceptedPersonal,
  setAcceptedTerms,
  setCardToken,
  setCustomer,
  setDelivery,
  setIds,
  setQuantity,
  setStep,
} from './checkoutSlice';

describe('checkoutSlice', () => {
  it('updates step, quantity and customer data', () => {
    let state = reducer(initialCheckoutState, setStep('form'));
    state = reducer(state, setQuantity(0));
    expect(state.quantity).toBe(1);
    state = reducer(state, setQuantity(2));
    state = reducer(
      state,
      setCustomer({
        name: 'Ana',
        email: 'ana@test.com',
        phone: '300',
        documentType: 'CC',
        documentNumber: '1',
      }),
    );
    state = reducer(
      state,
      setDelivery({
        address: 'Cra 1',
        city: 'Bogotá',
        region: 'Cundinamarca',
        postalCode: '110111',
      }),
    );
    expect(state.step).toBe('form');
    expect(state.customer.name).toBe('Ana');
    expect(state.delivery.city).toBe('Bogotá');
  });

  it('stores token metadata and acceptance contracts', () => {
    let state = reducer(
      initialCheckoutState,
      setIds({ customerId: 'c1', deliveryId: 'd1' }),
    );
    state = reducer(
      state,
      setCardToken({ token: 'tok_1', last4: '4242', brand: 'visa' }),
    );
    state = reducer(
      state,
      setAcceptance({
        acceptanceToken: 'a',
        acceptPersonalAuth: 'b',
        permalink: 'http://terms',
        personalPermalink: 'http://data',
      }),
    );
    state = reducer(state, setAcceptedTerms(true));
    state = reducer(state, setAcceptedPersonal(true));
    expect(state.cardToken).toBe('tok_1');
    expect(state.acceptedTerms).toBe(true);
    expect(reducer(state, resetCheckout())).toEqual(initialCheckoutState);
  });
});
