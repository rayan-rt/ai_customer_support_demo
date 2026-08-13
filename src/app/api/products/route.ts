import { NextResponse } from "next/server";
import { listProducts, getProductById } from "@/lib/services/product-service";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (id) {
    const product = await getProductById(id);
    if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(product);
  }

  const category = searchParams.get("category") ?? undefined;
  const search = searchParams.get("search") ?? undefined;
  const products = await listProducts({ category, search });
  return NextResponse.json(products);
}
