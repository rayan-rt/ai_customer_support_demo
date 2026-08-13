export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = "customer" | "admin";
export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";
export type OrderSource =
  | "storefront"
  | "ai_chat"
  | "simulated_whatsapp"
  | "admin";
export type InvoiceStatus = "draft" | "generated" | "sent" | "paid";
export type ConversationChannel = "web" | "simulated_whatsapp";
export type ConversationStatus = "active" | "escalated" | "closed";
export type MessageRole = "user" | "assistant" | "tool" | "system";
export type TicketStatus = "open" | "in_progress" | "resolved";
export type TicketPriority = "low" | "medium" | "high" | "urgent";
export type AutomationEventStatus =
  | "pending"
  | "processing"
  | "completed"
  | "failed";
export type IntegrationProvider = "shopify" | "whatsapp" | "excel";

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  category: string;
  image_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  size: string;
  sku: string;
  stock_quantity: number;
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: string;
  profile_id: string | null;
  name: string;
  email: string;
  phone: string | null;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  order_number: string;
  customer_id: string;
  status: OrderStatus;
  subtotal: number;
  shipping_fee: number;
  discount: number;
  total: number;
  shipping_address: Json;
  source: OrderSource;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  variant_id: string | null;
  product_name_snapshot: string;
  sku_snapshot: string;
  unit_price: number;
  quantity: number;
  line_total: number;
}

export interface Invoice {
  id: string;
  order_id: string;
  invoice_number: string;
  subtotal: number;
  shipping_fee: number;
  discount: number;
  total: number;
  status: InvoiceStatus;
  file_path: string | null;
  created_at: string;
}

export interface Conversation {
  id: string;
  customer_id: string | null;
  channel: ConversationChannel;
  status: ConversationStatus;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  role: MessageRole;
  content: string;
  metadata: Json;
  created_at: string;
}

export interface Ticket {
  id: string;
  conversation_id: string | null;
  customer_id: string | null;
  category: string;
  priority: TicketPriority;
  status: TicketStatus;
  subject: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface KnowledgeDocument {
  id: string;
  title: string;
  content: string;
  category: string;
  source: string;
  created_at: string;
  updated_at: string;
}

export interface KnowledgeChunk {
  id: string;
  document_id: string;
  content: string;
  chunk_index: number;
  embedding: number[] | null;
  metadata: Json;
  created_at: string;
}

export interface AutomationEvent {
  id: string;
  order_id: string | null;
  type: string;
  provider: string;
  status: AutomationEventStatus;
  payload: Json;
  error_message: string | null;
  created_at: string;
  completed_at: string | null;
}

export interface IntegrationRecord {
  id: string;
  provider: IntegrationProvider;
  external_id: string;
  entity_type: string;
  entity_id: string;
  status: string;
  metadata: Json;
  created_at: string;
  updated_at: string;
}

export interface KnowledgeChunkMatch {
  id: string;
  document_id: string;
  content: string;
  chunk_index: number;
  metadata: Record<string, unknown>;
  similarity: number;
}

type Table<T> = {
  Row: T;
  Insert: Partial<T>;
  Update: Partial<T>;
};

export interface Database {
  public: {
    Tables: {
      profiles: Table<Profile>;
      products: Table<Product>;
      product_variants: Table<ProductVariant>;
      customers: Table<Customer>;
      orders: Table<Order>;
      order_items: Table<OrderItem>;
      invoices: Table<Invoice>;
      conversations: Table<Conversation>;
      messages: Table<Message>;
      tickets: Table<Ticket>;
      knowledge_documents: Table<KnowledgeDocument>;
      knowledge_chunks: Table<KnowledgeChunk>;
      automation_events: Table<AutomationEvent>;
      integration_records: Table<IntegrationRecord>;
    };
    Functions: {
      match_knowledge_chunks: {
        Args: {
          query_embedding: number[];
          match_threshold?: number;
          match_count?: number;
        };
        Returns: KnowledgeChunkMatch[];
      };
    };
  };
}
