import { createAdminClient } from "@/lib/supabase/admin";

export class ShopifyAdapter {
  static async syncOrder(orderId: string, orderNumber: string) {
    const supabase = createAdminClient();
    const externalId = `shopify-order-${orderNumber.replace(/[^a-zA-Z0-9]/g, "")}`;

    const { data: event, error: eventError } = await supabase
      .from("automation_events")
      .insert({
        order_id: orderId,
        type: "shopify_sync",
        provider: "shopify",
        status: "completed",
        payload: { simulated: true, external_id: externalId },
        completed_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (eventError) throw eventError;

    await supabase.from("integration_records").upsert(
      {
        provider: "shopify",
        external_id: externalId,
        entity_type: "order",
        entity_id: orderId,
        status: "synced",
        metadata: { simulated: true },
      },
      { onConflict: "provider,external_id" },
    );

    return { simulated: true, externalId, event };
  }

  static async syncProduct(productId: string, productName: string) {
    const supabase = createAdminClient();
    const externalId = `shopify-product-${productName.toLowerCase().replace(/\s+/g, "-").slice(0, 30)}`;

    await supabase.from("integration_records").upsert(
      {
        provider: "shopify",
        external_id: externalId,
        entity_type: "product",
        entity_id: productId,
        status: "synced",
        metadata: { simulated: true },
      },
      { onConflict: "provider,external_id" },
    );

    return { simulated: true, externalId };
  }

  static async syncInventory(sku: string, quantity: number) {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("automation_events")
      .insert({
        type: "shopify_inventory_sync",
        provider: "shopify",
        status: "completed",
        payload: { simulated: true, sku, quantity },
        completed_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return { simulated: true, event: data };
  }
}
