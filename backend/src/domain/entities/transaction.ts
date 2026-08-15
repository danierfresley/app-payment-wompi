export type TransactionStatus = 'PENDING' | 'APPROVED' | 'DECLINED' | 'ERROR';

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
  status: TransactionStatus;
  providerId?: string | null;
  providerStatus?: string | null;
  last4?: string | null;
  cardBrand?: string | null;
  stockReserved: boolean;
}

export interface NewTransaction {
  reference: string;
  productId: string;
  customerId: string;
  deliveryId: string;
  quantity: number;
  productAmount: number;
  baseFee: number;
  deliveryFee: number;
  totalAmount: number;
  last4?: string | null;
  cardBrand?: string | null;
}
