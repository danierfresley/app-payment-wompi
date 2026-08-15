import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { api, type CreateTransactionInput, type Transaction } from '../../services/api';

export interface TransactionState {
  current: Transaction | null;
  status: 'idle' | 'paying' | 'ready' | 'error';
  error: string | null;
}

const initialState: TransactionState = {
  current: null,
  status: 'idle',
  error: null,
};

export const payTransaction = createAsyncThunk(
  'transaction/pay',
  async (input: CreateTransactionInput) => api.createTransaction(input),
);

export const refreshTransaction = createAsyncThunk(
  'transaction/refresh',
  async (id: string) => api.syncTransaction(id),
);

const transactionSlice = createSlice({
  name: 'transaction',
  initialState,
  reducers: {
    clearTransaction() {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(payTransaction.pending, (state) => {
        state.status = 'paying';
        state.error = null;
      })
      .addCase(payTransaction.fulfilled, (state, action) => {
        state.status = 'ready';
        state.current = action.payload;
      })
      .addCase(payTransaction.rejected, (state, action) => {
        state.status = 'error';
        state.error = action.error.message ?? 'El pago no pudo completarse';
      })
      .addCase(refreshTransaction.fulfilled, (state, action) => {
        state.current = action.payload;
        state.status = 'ready';
      });
  },
});

export const { clearTransaction } = transactionSlice.actions;
export default transactionSlice.reducer;
