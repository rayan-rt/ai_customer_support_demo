import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { findProductByName, getProductById, checkInventory } from "@/lib/services/product-service";
import { searchKnowledge } from "@/lib/services/knowledge-service";
import { createOrder, getOrderByNumber, getCustomerOrders } from "@/lib/services/order-service";
import { createTicket } from "@/lib/services/ticket-service";
import type { CreateOrderInput } from "@/types/domain";

export interface AgentContext {
  customerId?: string;
  profileId?: string;
  customerEmail?: string;
  customerName?: string;
  conversationId?: string;
  source?: "ai_chat" | "simulated_whatsapp";
}

const TOOLS_EXCLUDED_FROM_BINDING = ["searchKnowledgeBase", "getBusinessHours"] as const;

const PRODUCT_PATTERN =
  /\b(product|stock|inventory|size|available|price|gown|suit|dress|wear|collection|bridal|medium|large|small|lehenga|lehnga|skirt|veil)\b/i;
const ORDER_PATTERN =
  /\b(order|tracking|track|shipment|ship|deliver|delivery|where is my)\b/i;
const PURCHASE_PATTERN =
  /\b(buy|purchase|checkout|place an order|want to order|wanna order|order the|add to cart|interested in|i want a|i want the)\b/i;
const TICKET_PATTERN =
  /\b(refund|complaint|escalat|human|manager|speak to someone|unsatisfied|wrong item|damaged|want to return|return my|return this)\b/i;
const CHECKOUT_READY_PATTERN =
  /\S+@\S+\.\S+/;

function buildConversationText(
  message: string,
  history?: { content: string }[],
) {
  return [...(history ?? []).map((entry) => entry.content), message].join("\n");
}

export function selectToolsForMessage(
  message: string,
  ctx: AgentContext,
  options?: {
    history?: { content: string }[];
    hasProductContext?: boolean;
  },
) {
  const text = buildConversationText(message, options?.history).toLowerCase();
  const selected = new Set<string>();

  const purchaseIntent = PURCHASE_PATTERN.test(text);
  const orderLookupIntent =
    ORDER_PATTERN.test(text) &&
    !purchaseIntent &&
    !/\b(wanna order|want to order|place an order|interested in)\b/i.test(text);
  const checkoutReady = CHECKOUT_READY_PATTERN.test(message);

  if (!options?.hasProductContext && (PRODUCT_PATTERN.test(text) || purchaseIntent)) {
    selected.add("getProduct");
    selected.add("checkInventory");
  }

  if (orderLookupIntent) {
    selected.add("getOrderStatus");
    if (ctx.customerId) selected.add("getCustomerOrders");
  }

  if (purchaseIntent || (checkoutReady && options?.hasProductContext)) {
    selected.add("createOrder");
  }

  if (options?.hasProductContext && (purchaseIntent || checkoutReady)) {
    selected.delete("getProduct");
    selected.delete("checkInventory");
  }

  if (TICKET_PATTERN.test(text)) {
    selected.add("createTicket");
    if (orderLookupIntent) selected.add("getOrderStatus");
  }

  const allTools = buildTools(ctx);
  return allTools.filter(
    (tool) =>
      selected.has(tool.name) &&
      !TOOLS_EXCLUDED_FROM_BINDING.includes(
        tool.name as (typeof TOOLS_EXCLUDED_FROM_BINDING)[number],
      ),
  );
}

export function buildTools(ctx: AgentContext) {
  const searchKnowledgeBase = tool(
    async ({ query }) => {
      const chunks = await searchKnowledge(query, 5);
      if (chunks.length === 0) {
        return JSON.stringify({ found: false, message: "No relevant knowledge found." });
      }
      return JSON.stringify({
        found: true,
        chunks: chunks.map((c) => ({
          content: c.content,
          similarity: c.similarity,
          title: (c.metadata as { title?: string }).title,
          category: (c.metadata as { category?: string }).category,
        })),
      });
    },
    {
      name: "searchKnowledgeBase",
      description: "Search company policies, sizing guides, shipping info, and brand knowledge.",
      schema: z.object({ query: z.string() }),
    },
  );

  const getProduct = tool(
    async ({ query }) => {
      const byId = query.match(/^[0-9a-f-]{36}$/i)
        ? await getProductById(query)
        : null;
      const products = byId ? [byId] : await findProductByName(query);

      if (products.length === 0) {
        return JSON.stringify({ found: false });
      }

      return JSON.stringify({
        found: true,
        products: products.map((p) => ({
          id: p.id,
          name: p.name,
          slug: p.slug,
          price: p.price,
          category: p.category,
          description: p.description.slice(0, 200),
          variants: p.variants.map((v) => ({
            id: v.id,
            size: v.size,
            sku: v.sku,
            stock: v.stock_quantity,
          })),
        })),
      });
    },
    {
      name: "getProduct",
      description: "Look up product details and variants by name or product ID.",
      schema: z.object({ query: z.string() }),
    },
  );

  const checkInventoryTool = tool(
    async ({ productId, size }) => {
      if (!/^[0-9a-f-]{36}$/i.test(productId)) {
        return JSON.stringify({
          available: false,
          error: "Invalid product ID. Look up the product first, then check inventory with its ID.",
        });
      }

      const result = await checkInventory(productId, size);
      return JSON.stringify({
        available: result.available,
        stockQuantity: result.stockQuantity,
        size,
        productId,
        variantId: result.variant?.id,
        sku: result.variant?.sku,
      });
    },
    {
      name: "checkInventory",
      description: "Check live stock for a product variant by product ID and size.",
      schema: z.object({
        productId: z.string(),
        size: z.string(),
      }),
    },
  );

  const getCustomerOrdersTool = tool(
    async () => {
      if (!ctx.customerId) {
        return JSON.stringify({ error: "No customer context available." });
      }
      const orders = await getCustomerOrders(ctx.customerId);
      return JSON.stringify({ orders });
    },
    {
      name: "getCustomerOrders",
      description: "Get recent orders for the current customer.",
      schema: z.object({}),
    },
  );

  const getOrderStatus = tool(
    async ({ orderNumber }) => {
      const order = await getOrderByNumber(orderNumber);
      if (!order) return JSON.stringify({ found: false });

      if (ctx.customerId && order.customer_id !== ctx.customerId) {
        return JSON.stringify({ error: "You are not authorized to view this order." });
      }

      return JSON.stringify({
        found: true,
        orderNumber: order.order_number,
        status: order.status,
        total: order.total,
        createdAt: order.created_at,
        items: order.order_items,
      });
    },
    {
      name: "getOrderStatus",
      description: "Look up order status by order number.",
      schema: z.object({ orderNumber: z.string() }),
    },
  );

  const createOrderTool = tool(
    async (input) => {
      const orderInput: CreateOrderInput = {
        customerId: ctx.customerId,
        profileId: ctx.profileId,
        customerName: input.customerName ?? ctx.customerName ?? "Guest",
        customerEmail: input.customerEmail ?? ctx.customerEmail ?? "",
        customerPhone: input.customerPhone,
        items: input.items,
        shippingAddress: input.shippingAddress,
        source: ctx.source ?? "ai_chat",
      };

      if (!orderInput.customerEmail) {
        return JSON.stringify({ error: "Customer email is required." });
      }

      try {
        const result = await createOrder(orderInput);
        return JSON.stringify({ success: true, ...result });
      } catch (err) {
        return JSON.stringify({
          success: false,
          error: err instanceof Error ? err.message : "Order creation failed",
        });
      }
    },
    {
      name: "createOrder",
      description: "Create an order after collecting all required customer and shipping information.",
      schema: z.object({
        customerName: z.string().optional(),
        // Plain string — Groq rejects Zod's .email() JSON Schema regex.
        customerEmail: z.string().optional().describe("Customer email address"),
        customerPhone: z.string().optional(),
        items: z.array(
          z.object({
            productId: z.string(),
            variantId: z.string(),
            quantity: z.number().int().positive(),
          }),
        ),
        shippingAddress: z.object({
          line1: z.string(),
          line2: z.string().optional(),
          city: z.string(),
          state: z.string(),
          postal_code: z.string(),
          country: z.string().default("US"),
        }),
      }),
    },
  );

  const createTicketTool = tool(
    async (input) => {
      const ticket = await createTicket({
        ...input,
        conversationId: ctx.conversationId,
        customerId: ctx.customerId,
      });
      return JSON.stringify({ success: true, ticketId: ticket.id, status: ticket.status, subject: ticket.subject });
    },
    {
      name: "createTicket",
      description: "Create a support ticket for escalation (refunds, complaints, complex issues).",
      schema: z.object({
        category: z.string(),
        priority: z.enum(["low", "medium", "high", "urgent"]),
        subject: z.string(),
        description: z.string(),
      }),
    },
  );

  const getBusinessHours = tool(
    async () =>
      JSON.stringify({
        hours: "Mon–Sat 10:00 AM – 7:00 PM EST",
        closed: "Sundays",
        timezone: "America/New_York",
      }),
    {
      name: "getBusinessHours",
      description: "Return store business hours.",
      schema: z.object({}),
    },
  );

  return [
    searchKnowledgeBase,
    getProduct,
    checkInventoryTool,
    getCustomerOrdersTool,
    getOrderStatus,
    createOrderTool,
    createTicketTool,
    getBusinessHours,
  ];
}
