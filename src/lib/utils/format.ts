export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

export function formatDate(date: string | Date) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(typeof date === "string" ? new Date(date) : date);
}

export function generateOrderNumber() {
  const now = new Date();
  const date = now.toISOString().slice(0, 10).replace(/-/g, "");
  const suffix = Math.floor(Math.random() * 900 + 100);
  return `LBR-${date}-${suffix}`;
}

export function generateInvoiceNumber() {
  const now = new Date();
  const date = now.toISOString().slice(0, 10).replace(/-/g, "");
  const suffix = Math.floor(Math.random() * 900 + 100);
  return `INV-${date}-${suffix}`;
}
