export type DomainErrorCode =
  | 'NOT_FOUND'
  | 'VALIDATION'
  | 'CONFLICT'
  | 'PAYMENT_FAILED'
  | 'UNAUTHORIZED';

export class DomainError {
  constructor(
    public readonly code: DomainErrorCode,
    public readonly message: string,
    public readonly statusCode: number,
    public readonly details?: unknown,
  ) {}
}

export const notFound = (message: string) =>
  new DomainError('NOT_FOUND', message, 404);

export const validation = (message: string, details?: unknown) =>
  new DomainError('VALIDATION', message, 400, details);

export const conflict = (message: string) =>
  new DomainError('CONFLICT', message, 409);

export const paymentFailed = (message: string, details?: unknown) =>
  new DomainError('PAYMENT_FAILED', message, 502, details);

export const unauthorized = (message: string) =>
  new DomainError('UNAUTHORIZED', message, 401);
