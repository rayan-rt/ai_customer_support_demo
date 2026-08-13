import { NextResponse } from "next/server";
import { ShopifyAdapter } from "@/lib/integrations/shopify";
import { requireAdmin } from "@/lib/auth/session";

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const { orderId, orderNumber, productId, productName, sku, quantity } = await request.json();

    if (orderId && orderNumber) {
      const result = await ShopifyAdapter.syncOrder(orderId, orderNumber);
      return NextResponse.json(result);
    }
    if (productId && productName) {
      const result = await ShopifyAdapter.syncProduct(productId, productName);
      return NextResponse.json(result);
    }
    if (sku && quantity !== undefined) {
      const result = await ShopifyAdapter.syncInventory(sku, quantity);
      return NextResponse.json(result);
    }

    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Shopify sync failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
