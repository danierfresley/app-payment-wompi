import { Product } from '../entities/product';

export interface ProductRepository {
  findAll(): Promise<Product[]>;
  findById(id: string): Promise<Product | null>;
  getStock(id: string): Promise<number | null>;
}
