import { appEnv } from '../config';

const API_URL = appEnv.apiUrl;

export interface Product {
  id: string;
  name: string;
  description: string;
  priceInCents: number;
  imageUrl: string;
  stock: number;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  documentType: string;
  documentNumber: string;
}

export interface Delivery {
  id: string;
  customerId: string;
  address: string;
  city: string;
  region: string;
  postalCode: string;
  status: 'PENDING' | 'ASSIGNED';
}

export interface Transaction {
  id: string;
  reference: string;
  productId: string;
  customerId: string;
  deliveryId: string;
  quantity: number;
  productAmount: number;
  baseFee: number;
  deliveryFee: number;
  totalAmount: number;
  status: 'PENDING' | 'APPROVED' | 'DECLINED' | 'ERROR';
  providerId?: string | null;
  providerStatus?: string | null;
  last4?: string | null;
  cardBrand?: string | null;
}

export interface CustomerInput {
  name: string;
  email: string;
  phone: string;
  documentType: string;
  documentNumber: string;
}

export interface DeliveryInput {
  customerId: string;
  address: string;
  city: string;
  region: string;
  postalCode: string;
}

export interface CreateTransactionInput {
  productId: string;
  customerId: string;
  deliveryId: string;
  quantity: number;
  cardToken: string;
  last4?: string;
  cardBrand?: string;
  installments?: number;
  acceptanceToken: string;
  acceptPersonalAuth: string;
}

const request = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  });
  const body = (await response.json()) as T & { message?: string };
  if (!response.ok) {
    throw new Error(body.message ?? `Request failed (${response.status})`);
  }
  return body;
};

export const api = {
  listProducts: () => request<Product[]>('/products'),
  getProduct: (id: string) => request<Product>(`/products/${id}`),
  getStock: (productId: string) =>
    request<{ productId: string; stock: number }>(`/stock/${productId}`),
  upsertCustomer: (input: CustomerInput) =>
    request<Customer>('/customers', {
      method: 'POST',
      body: JSON.stringify(input),
    }),
  createDelivery: (input: DeliveryInput) =>
    request<Delivery>('/deliveries', {
      method: 'POST',
      body: JSON.stringify(input),
    }),
  createTransaction: (input: CreateTransactionInput) =>
    request<Transaction>('/transactions', {
      method: 'POST',
      body: JSON.stringify(input),
    }),
  getTransaction: (id: string) => request<Transaction>(`/transactions/${id}`),
  syncTransaction: (id: string) =>
    request<Transaction>(`/transactions/${id}/sync`, { method: 'PATCH' }),
};
