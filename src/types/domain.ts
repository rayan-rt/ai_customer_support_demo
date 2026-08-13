import type { OrderSource, OrderStatus } from "@/types/database";

export interface CartItem {
  productId: string;
  variantId: string;
  productName: string;
  slug: string;
  sku: string;
  size: string;
  unitPrice: number;
  quantity: number;
  imageUrl?: string | null;
}

export interface ShippingAddress {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}

export interface CreateOrderItemInput {
  productId: string;
  variantId: string;
  quantity: number;
}

export interface CreateOrderInput {
  customerId?: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  profileId?: string;
  items: CreateOrderItemInput[];
  shippingAddress: ShippingAddress;
  source: OrderSource;
  discount?: number;
}

export interface OrderResult {
  orderId: string;
  orderNumber: string;
  total: number;
  status: OrderStatus;
  invoiceNumber?: string;
}

export interface ChatMessage {
  role: "user" | "assistant" | "tool" | "system";
  content: string;
  metadata?: Record<string, unknown>;
}

export interface ToolCallInfo {
  name: string;
  input: unknown;
  output?: unknown;
}

export interface ChatResponse {
  message: string;
  conversationId: string;
  toolCalls?: ToolCallInfo[];
  escalated?: boolean;
}
