import Link from "next/link";
import Image from "next/image";
import { requireAdmin } from "@/lib/auth/session";
import { listProducts } from "@/lib/services/product-service";
import { formatCurrency } from "@/lib/utils/format";
import { AdminNav } from "@/components/admin/nav";

export default async function AdminProductsPage() {
  await requireAdmin();
  const products = await listProducts({ activeOnly: false });

  return (
    <div className="min-h-screen bg-zinc-50">
      <AdminNav />
      <div className="mx-auto max-w-7xl px-6 py-8">
        <h1 className="text-2xl font-semibold">Products & Inventory</h1>
        <div className="mt-6 overflow-hidden rounded-xl border bg-white">
          <table className="w-full text-sm">
            <thead className="border-b bg-zinc-50 text-left text-xs uppercase text-zinc-500">
              <tr>
                <th className="p-4">Product</th>
                <th className="p-4">Category</th>
                <th className="p-4">Price</th>
                <th className="p-4">Variants / Stock</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-b last:border-0">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="relative h-12 w-10 overflow-hidden rounded bg-zinc-100">
                        {p.image_url ? (
                          <Image src={p.image_url} alt={p.name} fill className="object-cover" />
                        ) : null}
                      </div>
                      <div>
                        <p className="font-medium">{p.name}</p>
                        <Link href={`/products/${p.slug}`} className="text-xs text-blue-600 underline">
                          View storefront
                        </Link>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">{p.category}</td>
                  <td className="p-4">{formatCurrency(Number(p.price))}</td>
                  <td className="p-4">
                    <ul className="space-y-1 text-xs">
                      {p.variants.map((v) => (
                        <li key={v.id}>
                          {v.size}: {v.stock_quantity} ({v.sku})
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td className="p-4">{p.is_active ? "Active" : "Inactive"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
