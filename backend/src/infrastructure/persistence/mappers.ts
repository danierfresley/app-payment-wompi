import {
  Customer as PrismaCustomer,
  Delivery as PrismaDelivery,
  Product as PrismaProduct,
  Transaction as PrismaTransaction,
} from '@prisma/client';
import { Customer } from '../../domain/entities/customer';
import { Delivery } from '../../domain/entities/delivery';
import { Product } from '../../domain/entities/product';
import { Transaction } from '../../domain/entities/transaction';

export const toProduct = (row: PrismaProduct): Product => ({
  id: row.id,
  name: row.name,
  description: row.description,
  priceInCents: row.priceInCents,
  imageUrl: row.imageUrl,
  stock: row.stock,
});

export const toCustomer = (row: PrismaCustomer): Customer => ({
  id: row.id,
  name: row.name,
  email: row.email,
  phone: row.phone,
  documentType: row.documentType,
  documentNumber: row.documentNumber,
});

export const toDelivery = (row: PrismaDelivery): Delivery => ({
  id: row.id,
  customerId: row.customerId,
  address: row.address,
  city: row.city,
  region: row.region,
  postalCode: row.postalCode,
  status: row.status,
});

export const toTransaction = (row: PrismaTransaction): Transaction => ({
  id: row.id,
  reference: row.reference,
  productId: row.productId,
  customerId: row.customerId,
  deliveryId: row.deliveryId,
  quantity: row.quantity,
  productAmount: row.productAmount,
  baseFee: row.baseFee,
  deliveryFee: row.deliveryFee,
  totalAmount: row.totalAmount,
  status: row.status,
  providerId: row.providerId,
  providerStatus: row.providerStatus,
  last4: row.last4,
  cardBrand: row.cardBrand,
  stockReserved: row.stockReserved,
});
