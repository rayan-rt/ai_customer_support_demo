import { createAdminClient } from "@/lib/supabase/admin";
import { ExcelAdapter } from "@/lib/integrations/excel";
import { ShopifyAdapter } from "@/lib/integrations/shopify";
import { WhatsAppAdapter } from "@/lib/integrations/whatsapp";
import { createAndStoreInvoice } from "@/lib/services/invoice-service";
import { findOrCreateCustomer } from "@/lib/services/customer-service";
import { getProductById } from "@/lib/services/product-service";
import { generateOrderNumber } from "@/lib/utils/format";
import type { CreateOrderInput, OrderResult } from "@/types/domain";
import type { OrderWithDetails } from "@/types/order-details";

const SHIPPING_FEE = 25;
const FREE_SHIPPING_THRESHOLD = 500;

function calculateShipping(subtotal: number) {
  return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
}

export async function createOrder(input: CreateOrderInput): Promise<OrderResult> {
  const supabase = createAdminClient();

  const customer = input.customerId
    ? await (async () => {
        const { data } = await supabase
          .from("customers")
          .select("*")
          .eq("id", input.customerId!)
          .single();
        return data!;
      })()
    : await findOrCreateCustomer({
        name: input.customerName,
        email: input.customerEmail,
        phone: input.customerPhone,
        profileId: input.profileId,
      });

  let subtotal = 0;
  const lineItems: Array<{
    productId: string;
    variantId: string;
    productName: string;
    sku: string;
    unitPrice: number;
    quantity: number;
    lineTotal: number;
  }> = [];

  for (const item of input.items) {
    const product = await getProductById(item.productId);
    if (!product) throw new Error(`Product not found: ${item.productId}`);

    const variant = product.variants.find((v) => v.id === item.variantId);
    if (!variant) throw new Error(`Variant not found for ${product.name}`);

    if (variant.stock_quantity < item.quantity) {
      throw new Error(
        `Insufficient stock for ${product.name} (${variant.size}): ${variant.stock_quantity} available`,
      );
    }

    const unitPrice = Number(product.price);
    const lineTotal = unitPrice * item.quantity;
    subtotal += lineTotal;

    lineItems.push({
      productId: product.id,
      variantId: variant.id,
      productName: product.name,
      sku: variant.sku,
      unitPrice,
      quantity: item.quantity,
      lineTotal,
    });
  }

  const discount = input.discount ?? 0;
  const shippingFee = calculateShipping(subtotal);
  const total = subtotal + shippingFee - discount;
  const orderNumber = generateOrderNumber();

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      order_number: orderNumber,
      customer_id: customer.id,
      status: "confirmed",
      subtotal,
      shipping_fee: shippingFee,
      discount,
      total,
      shipping_address: input.shippingAddress,
      source: input.source,
    })
    .select()
    .single();

  if (orderError) throw orderError;

  const orderItems = lineItems.map((li) => ({
    order_id: order.id,
    product_id: li.productId,
    variant_id: li.variantId,
    product_name_snapshot: li.productName,
    sku_snapshot: li.sku,
    unit_price: li.unitPrice,
    quantity: li.quantity,
    line_total: li.lineTotal,
  }));

  const { error: itemsError } = await supabase.from("order_items").insert(orderItems);
  if (itemsError) throw itemsError;

  for (const li of lineItems) {
    const product = await getProductById(li.productId);
    const variant = product?.variants.find((v) => v.id === li.variantId);
    if (!variant) continue;

    const newStock = variant.stock_quantity - li.quantity;
    await supabase
      .from("product_variants")
      .update({ stock_quantity: newStock })
      .eq("id", li.variantId);

    await supabase.from("automation_events").insert({
      order_id: order.id,
      type: "inventory_updated",
      provider: "internal",
      status: "completed",
      payload: { sku: li.sku, delta: -li.quantity, new_stock: newStock },
      completed_at: new Date().toISOString(),
    });
  }

  await supabase.from("automation_events").insert({
    order_id: order.id,
    type: "order_created",
    provider: "internal",
    status: "completed",
    payload: { message: "Order created", source: input.source },
    completed_at: new Date().toISOString(),
  });

  const invoice = await createAndStoreInvoice(order.id);
  await ShopifyAdapter.syncOrder(order.id, orderNumber);
  await ExcelAdapter.syncOrder(order.id, orderNumber);

  if (input.source === "simulated_whatsapp") {
    await WhatsAppAdapter.sendInvoice(order.id, customer.phone ?? undefined);
  }

  return {
    orderId: order.id,
    orderNumber: order.order_number,
    total: Number(order.total),
    status: order.status,
    invoiceNumber: invoice.invoice_number,
  };
}

export async function getOrderByNumber(orderNumber: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("orders")
    .select("*, order_items(*), customers(*), invoices(*), automation_events(*)")
    .eq("order_number", orderNumber)
    .maybeSingle();

  if (error) throw error;
  return data as OrderWithDetails | null;
}

export async function getOrderById(orderId: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("orders")
    .select("*, order_items(*), customers(*), invoices(*), automation_events(*)")
    .eq("id", orderId)
    .maybeSingle();

  if (error) throw error;
  return data as OrderWithDetails | null;
}

export async function getCustomerOrders(customerId: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .eq("customer_id", customerId)
    .order("created_at", { ascending: false })
    .limit(10);

  if (error) throw error;
  return data ?? [];
}

export async function listOrders() {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("orders")
    .select("*, customers(name, email)")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function updateOrderStatus(orderId: string, status: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("orders")
    .update({ status })
    .eq("id", orderId)
    .select()
    .single();

  if (error) throw error;
  return data;
}
