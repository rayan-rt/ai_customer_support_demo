import { z } from "zod";

export const shippingAddressSchema = z.object({
  line1: z.string().min(1),
  line2: z.string().optional(),
  city: z.string().min(1),
  state: z.string().min(1),
  postal_code: z.string().min(1),
  country: z.string().min(1).default("US"),
});

export const orderItemSchema = z.object({
  productId: z.string().uuid(),
  variantId: z.string().uuid(),
  quantity: z.number().int().positive(),
});

export const createOrderSchema = z.object({
  customerId: z.string().uuid().optional(),
  customerName: z.string().min(1),
  customerEmail: z.string().email(),
  customerPhone: z.string().optional(),
  items: z.array(orderItemSchema).min(1),
  shippingAddress: shippingAddressSchema,
  source: z
    .enum(["storefront", "ai_chat", "simulated_whatsapp", "admin"])
    .default("storefront"),
  discount: z.number().min(0).optional(),
});

export const chatRequestSchema = z.object({
  message: z.string().min(1),
  conversationId: z.string().uuid().optional(),
  customerId: z.string().uuid().optional(),
  channel: z.enum(["web", "simulated_whatsapp"]).default("web"),
});

export const knowledgeSearchSchema = z.object({
  query: z.string().min(1),
  matchCount: z.number().int().positive().max(10).optional(),
});

export const ticketSchema = z.object({
  category: z.string().min(1),
  priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
  subject: z.string().min(1),
  description: z.string().min(1),
  conversationId: z.string().uuid().optional(),
  customerId: z.string().uuid().optional(),
});

export const whatsappSimulatorSchema = z.object({
  message: z.string().min(1),
  customerId: z.string().uuid(),
  conversationId: z.string().uuid().optional(),
});
