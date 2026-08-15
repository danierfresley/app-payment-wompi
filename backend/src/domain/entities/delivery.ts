export type DeliveryStatus = 'PENDING' | 'ASSIGNED';

export interface Delivery {
  id: string;
  customerId: string;
  address: string;
  city: string;
  region: string;
  postalCode: string;
  status: DeliveryStatus;
}

export interface DeliveryInput {
  customerId: string;
  address: string;
  city: string;
  region: string;
  postalCode: string;
}
