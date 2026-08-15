import { Delivery, DeliveryInput } from '../entities/delivery';

export interface DeliveryRepository {
  findById(id: string): Promise<Delivery | null>;
  create(input: DeliveryInput): Promise<Delivery>;
}
