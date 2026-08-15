import { Customer, CustomerInput } from '../entities/customer';

export interface CustomerRepository {
  findById(id: string): Promise<Customer | null>;
  upsertByEmail(input: CustomerInput): Promise<Customer>;
}
