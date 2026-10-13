export type UserRole = 'user' | 'admin';

export type PlanType = 'standard' | 'rush';

export type OrderStatus =
  | 'pending_payment'
  | 'paid'
  | 'processing'
  | 'completed'
  | 'cancelled';

export interface Profile {
  id: string;
  full_name: string;
  phone: string;
  zalo: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  code: string;
  user_id: string;
  customer_name: string;
  customer_phone: string;
  customer_zalo: string;
  brief: string | null;
  input_file_path: string | null;
  plan: PlanType;
  amount: number;
  status: OrderStatus;
  due_at: string | null;
  delivered_file_path: string | null;
  cancel_reason: string | null;
  created_at: string;
  paid_at: string | null;
  completed_at: string | null;
}

export interface Payment {
  id: string;
  order_id: string | null;
  provider: string;
  provider_txn_id: string;
  amount: number;
  raw_payload: Record<string, unknown>;
  matched: boolean;
  created_at: string;
}

export interface OrderEvent {
  id: string;
  order_id: string;
  from_status: OrderStatus | null;
  to_status: OrderStatus;
  actor_id: string | null;
  note: string | null;
  created_at: string;
}

export interface PlanConfig {
  id: PlanType;
  name: string;
  price: number;
  deliveryDays: number;
  description: string;
  features: string[];
}

export interface PaymentInstructions {
  bankName: string;
  accountNumber: string;
  accountName: string;
  amount: number;
  transferContent: string;
  qrUrl: string;
  expiresInMinutes: number;
}
