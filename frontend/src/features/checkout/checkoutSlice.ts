import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { CardBrand } from '../../utils/card';

export type CheckoutStep = 'product' | 'form' | 'summary' | 'status';

export interface CheckoutCustomer {
  name: string;
  email: string;
  phone: string;
  documentType: string;
  documentNumber: string;
}

export interface CheckoutDelivery {
  address: string;
  city: string;
  region: string;
  postalCode: string;
}

export interface CheckoutState {
  step: CheckoutStep;
  quantity: number;
  customer: CheckoutCustomer;
  delivery: CheckoutDelivery;
  customerId: string | null;
  deliveryId: string | null;
  cardToken: string | null;
  last4: string | null;
  cardBrand: CardBrand | null;
  acceptanceToken: string | null;
  acceptPersonalAuth: string | null;
  permalink: string | null;
  personalPermalink: string | null;
  acceptedTerms: boolean;
  acceptedPersonal: boolean;
}

const emptyCustomer: CheckoutCustomer = {
  name: '',
  email: '',
  phone: '',
  documentType: 'CC',
  documentNumber: '',
};

const emptyDelivery: CheckoutDelivery = {
  address: '',
  city: '',
  region: '',
  postalCode: '',
};

export const initialCheckoutState: CheckoutState = {
  step: 'product',
  quantity: 1,
  customer: emptyCustomer,
  delivery: emptyDelivery,
  customerId: null,
  deliveryId: null,
  cardToken: null,
  last4: null,
  cardBrand: null,
  acceptanceToken: null,
  acceptPersonalAuth: null,
  permalink: null,
  personalPermalink: null,
  acceptedTerms: false,
  acceptedPersonal: false,
};

const checkoutSlice = createSlice({
  name: 'checkout',
  initialState: initialCheckoutState,
  reducers: {
    setStep(state, action: PayloadAction<CheckoutStep>) {
      state.step = action.payload;
    },
    setQuantity(state, action: PayloadAction<number>) {
      state.quantity = Math.max(1, action.payload);
    },
    setCustomer(state, action: PayloadAction<CheckoutCustomer>) {
      state.customer = action.payload;
    },
    setDelivery(state, action: PayloadAction<CheckoutDelivery>) {
      state.delivery = action.payload;
    },
    setIds(
      state,
      action: PayloadAction<{ customerId: string; deliveryId: string }>,
    ) {
      state.customerId = action.payload.customerId;
      state.deliveryId = action.payload.deliveryId;
    },
    setCardToken(
      state,
      action: PayloadAction<{
        token: string;
        last4: string;
        brand: CardBrand;
      }>,
    ) {
      state.cardToken = action.payload.token;
      state.last4 = action.payload.last4;
      state.cardBrand = action.payload.brand;
    },
    setAcceptance(
      state,
      action: PayloadAction<{
        acceptanceToken: string;
        acceptPersonalAuth: string;
        permalink: string;
        personalPermalink: string;
      }>,
    ) {
      state.acceptanceToken = action.payload.acceptanceToken;
      state.acceptPersonalAuth = action.payload.acceptPersonalAuth;
      state.permalink = action.payload.permalink;
      state.personalPermalink = action.payload.personalPermalink;
    },
    setAcceptedTerms(state, action: PayloadAction<boolean>) {
      state.acceptedTerms = action.payload;
    },
    setAcceptedPersonal(state, action: PayloadAction<boolean>) {
      state.acceptedPersonal = action.payload;
    },
    resetCheckout() {
      return initialCheckoutState;
    },
  },
});

export const {
  setStep,
  setQuantity,
  setCustomer,
  setDelivery,
  setIds,
  setCardToken,
  setAcceptance,
  setAcceptedTerms,
  setAcceptedPersonal,
  resetCheckout,
} = checkoutSlice.actions;
export default checkoutSlice.reducer;
