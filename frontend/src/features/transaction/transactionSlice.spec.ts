import reducer, {
  clearTransaction,
  payTransaction,
  refreshTransaction,
} from './transactionSlice';

const tx = {
  id: 't1',
  reference: 'CHK-1',
  productId: 'p1',
  customerId: 'c1',
  deliveryId: 'd1',
  quantity: 1,
  productAmount: 100,
  baseFee: 10,
  deliveryFee: 20,
  totalAmount: 130,
  status: 'APPROVED' as const,
};

describe('transactionSlice', () => {
  const initial = { current: null, status: 'idle' as const, error: null };

  it('tracks pay and refresh states', () => {
    let state = reducer(initial, { type: payTransaction.pending.type });
    expect(state.status).toBe('paying');
    state = reducer(state, { type: payTransaction.fulfilled.type, payload: tx });
    expect(state.current?.id).toBe('t1');
    state = reducer(state, {
      type: payTransaction.rejected.type,
      error: { message: 'declined' },
    });
    expect(state.status).toBe('error');
    state = reducer(state, {
      type: refreshTransaction.fulfilled.type,
      payload: { ...tx, status: 'DECLINED' },
    });
    expect(state.current?.status).toBe('DECLINED');
    expect(reducer(state, clearTransaction())).toEqual(initial);
  });
});
