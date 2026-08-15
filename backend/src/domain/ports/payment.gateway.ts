export interface CardPaymentRequest {
  amountInCents: number;
  currency: string;
  customerEmail: string;
  reference: string;
  cardToken: string;
  installments: number;
  acceptanceToken: string;
  acceptPersonalAuth: string;
}

export interface ProviderTransaction {
  id: string;
  status: string;
  reference: string;
}

export interface PaymentGateway {
  createCardTransaction(
    request: CardPaymentRequest,
  ): Promise<ProviderTransaction>;
  getTransaction(providerId: string): Promise<ProviderTransaction>;
  waitForSettlement(
    providerId: string,
    attempts?: number,
    delayMs?: number,
  ): Promise<ProviderTransaction>;
}
