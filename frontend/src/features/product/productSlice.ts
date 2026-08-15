import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { api, type Product } from '../../services/api';

export interface ProductState {
  items: Product[];
  selectedId: string | null;
  status: 'idle' | 'loading' | 'ready' | 'error';
  error: string | null;
}

const initialState: ProductState = {
  items: [],
  selectedId: null,
  status: 'idle',
  error: null,
};

export const fetchProducts = createAsyncThunk('product/fetchAll', async () => {
  return api.listProducts();
});

const productSlice = createSlice({
  name: 'product',
  initialState,
  reducers: {
    selectProduct(state, action: { payload: string }) {
      state.selectedId = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.status = 'ready';
        state.items = action.payload;
        if (!state.selectedId && action.payload[0]) {
          state.selectedId = action.payload[0].id;
        }
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.status = 'error';
        state.error = action.error.message ?? 'No se pudieron cargar los productos';
      });
  },
});

export const { selectProduct } = productSlice.actions;
export default productSlice.reducer;
