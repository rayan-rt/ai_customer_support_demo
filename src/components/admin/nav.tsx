import Link from "next/link";
import { BRAND_NAME } from "@/lib/config/env";

const links = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/customers", label: "Customers" },
  { href: "/admin/conversations", label: "Conversations" },
  { href: "/admin/knowledge", label: "Knowledge" },
  { href: "/admin/automation", label: "Automation" },
  { href: "/admin/whatsapp", label: "WhatsApp Sim" },
];

export function AdminNav() {
  return (
    <div className="border-b bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-zinc-500">Admin</p>
          <h1 className="text-xl font-semibold">{BRAND_NAME}</h1>
        </div>
        <Link href="/" className="text-sm underline">Storefront</Link>
      </div>
      <nav className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-6 pb-3">
        {links.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="whitespace-nowrap rounded-lg px-3 py-1.5 text-sm hover:bg-zinc-100"
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
