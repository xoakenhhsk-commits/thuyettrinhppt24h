import { Order, PaymentInstructions } from '../types';

export interface WebhookVerificationResult {
  isValid: boolean;
  orderCode?: string | null;
  amount?: number;
  transactionId?: string;
  errorMessage?: string;
  rawPayload?: Record<string, unknown>;
}

export interface PaymentProvider {
  name: string;
  createPaymentInstructions(order: Order): PaymentInstructions;
  verifyWebhook(
    body: unknown,
    headers: Record<string, string | string[] | undefined>
  ): Promise<WebhookVerificationResult>;
}
