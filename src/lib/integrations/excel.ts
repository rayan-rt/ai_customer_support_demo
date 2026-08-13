import { createAdminClient } from "@/lib/supabase/admin";

export class ExcelAdapter {
  static async syncOrder(orderId: string, orderNumber: string) {
    const supabase = createAdminClient();
    const fileName = `orders-export-${orderNumber.replace(/[^a-zA-Z0-9]/g, "")}.csv`;

    const { data: event, error } = await supabase
      .from("automation_events")
      .insert({
        order_id: orderId,
        type: "excel_sync",
        provider: "excel",
        status: "completed",
        payload: { simulated: true, file: fileName, sheet: "Orders" },
        completed_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    await supabase.from("integration_records").upsert(
      {
        provider: "excel",
        external_id: `excel-row-${orderNumber.replace(/[^a-zA-Z0-9]/g, "")}`,
        entity_type: "order",
        entity_id: orderId,
        status: "synced",
        metadata: { simulated: true, sheet: "Orders", file: fileName },
      },
      { onConflict: "provider,external_id" },
    );

    return { simulated: true, fileName, event };
  }
}
