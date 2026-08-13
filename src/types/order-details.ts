import type {
  AutomationEvent,
  Customer,
  Invoice,
  Order,
  OrderItem,
} from "@/types/database";

export type OrderWithDetails = Order & {
  order_items?: OrderItem[];
  customers?: Customer;
  invoices?: Invoice | Invoice[];
  automation_events?: AutomationEvent[];
};
