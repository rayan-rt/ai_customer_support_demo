import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { createAdminClient } from "@/lib/supabase/admin";
import { BRAND_NAME } from "@/lib/config/env";
import { formatCurrency, formatDate, generateInvoiceNumber } from "@/lib/utils/format";
import type { Customer, Order } from "@/types/database";

interface InvoiceLineItem {
  productName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

interface InvoiceData {
  order: Order;
  customer: Customer;
  items: InvoiceLineItem[];
}

export async function generateInvoicePdf(data: InvoiceData) {
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([612, 792]);
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdf.embedFont(StandardFonts.HelveticaBold);

  let y = 740;
  const left = 50;

  page.drawText(BRAND_NAME, { x: left, y, size: 22, font: fontBold, color: rgb(0.45, 0.15, 0.2) });
  y -= 30;
  page.drawText("INVOICE", { x: left, y, size: 16, font: fontBold });
  y -= 24;
  page.drawText(`Invoice #: ${generateInvoiceNumber()}`, { x: left, y, size: 11, font });
  page.drawText(`Order #: ${data.order.order_number}`, { x: 320, y, size: 11, font });
  y -= 16;
  page.drawText(`Date: ${formatDate(data.order.created_at)}`, { x: left, y, size: 11, font });

  y -= 32;
  page.drawText("Bill To:", { x: left, y, size: 12, font: fontBold });
  y -= 16;
  page.drawText(data.customer.name, { x: left, y, size: 11, font });
  y -= 14;
  page.drawText(data.customer.email, { x: left, y, size: 11, font });

  const addr = data.order.shipping_address as Record<string, string>;
  y -= 14;
  page.drawText(`${addr.line1 ?? ""}, ${addr.city ?? ""}, ${addr.state ?? ""} ${addr.postal_code ?? ""}`, {
    x: left,
    y,
    size: 11,
    font,
  });

  y -= 36;
  page.drawText("Item", { x: left, y, size: 11, font: fontBold });
  page.drawText("SKU", { x: 220, y, size: 11, font: fontBold });
  page.drawText("Qty", { x: 340, y, size: 11, font: fontBold });
  page.drawText("Price", { x: 400, y, size: 11, font: fontBold });
  page.drawText("Total", { x: 480, y, size: 11, font: fontBold });

  y -= 8;
  page.drawLine({ start: { x: left, y }, end: { x: 562, y }, thickness: 1, color: rgb(0.8, 0.8, 0.8) });
  y -= 18;

  for (const item of data.items) {
    page.drawText(item.productName.slice(0, 28), { x: left, y, size: 10, font });
    page.drawText(item.sku, { x: 220, y, size: 10, font });
    page.drawText(String(item.quantity), { x: 340, y, size: 10, font });
    page.drawText(formatCurrency(item.unitPrice), { x: 400, y, size: 10, font });
    page.drawText(formatCurrency(item.lineTotal), { x: 480, y, size: 10, font });
    y -= 18;
  }

  y -= 12;
  page.drawLine({ start: { x: 340, y: y + 8 }, end: { x: 562, y: y + 8 }, thickness: 1, color: rgb(0.8, 0.8, 0.8) });
  y -= 8;
  page.drawText(`Subtotal: ${formatCurrency(Number(data.order.subtotal))}`, { x: 400, y, size: 11, font });
  y -= 16;
  page.drawText(`Shipping: ${formatCurrency(Number(data.order.shipping_fee))}`, { x: 400, y, size: 11, font });
  y -= 16;
  if (Number(data.order.discount) > 0) {
    page.drawText(`Discount: -${formatCurrency(Number(data.order.discount))}`, { x: 400, y, size: 11, font });
    y -= 16;
  }
  page.drawText(`Total: ${formatCurrency(Number(data.order.total))}`, { x: 400, y, size: 13, font: fontBold });

  return pdf.save();
}

export async function createAndStoreInvoice(orderId: string) {
  const supabase = createAdminClient();

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("*, order_items(*), customers(*)")
    .eq("id", orderId)
    .single();

  if (orderError) throw orderError;

  const orderRecord = order as Order & {
    order_items?: Array<Record<string, unknown>>;
    customers?: Customer;
  };
  const invoiceNumber = generateInvoiceNumber();
  const customer = orderRecord.customers as Customer;
  const items = (orderRecord.order_items ?? []).map((item) => ({
    productName: String(item.product_name_snapshot ?? ""),
    sku: String(item.sku_snapshot ?? ""),
    quantity: Number(item.quantity ?? 0),
    unitPrice: Number(item.unit_price ?? 0),
    lineTotal: Number(item.line_total ?? 0),
  }));

  const pdfBytes = await generateInvoicePdf({
    order: orderRecord,
    customer,
    items,
  });

  const filePath = `${orderId}/${invoiceNumber}.pdf`;
  const { error: uploadError } = await supabase.storage
    .from("invoices")
    .upload(filePath, pdfBytes, {
      contentType: "application/pdf",
      upsert: true,
    });

  if (uploadError) throw uploadError;

  const { data: invoice, error: invoiceError } = await supabase
    .from("invoices")
    .upsert(
      {
        order_id: orderId,
        invoice_number: invoiceNumber,
        subtotal: orderRecord.subtotal,
        shipping_fee: orderRecord.shipping_fee,
        discount: orderRecord.discount,
        total: orderRecord.total,
        status: "generated",
        file_path: filePath,
      },
      { onConflict: "order_id" },
    )
    .select()
    .single();

  if (invoiceError) throw invoiceError;

  await supabase.from("automation_events").insert({
    order_id: orderId,
    type: "invoice_generated",
    provider: "internal",
    status: "completed",
    payload: { invoice_number: invoiceNumber, file_path: filePath },
    completed_at: new Date().toISOString(),
  });

  return invoice;
}

export async function getInvoiceSignedUrl(invoiceId: string) {
  const supabase = createAdminClient();
  const { data: invoice, error } = await supabase
    .from("invoices")
    .select("*")
    .eq("id", invoiceId)
    .single();

  if (error) throw error;
  if (!invoice.file_path) return null;

  const { data: signed, error: signError } = await supabase.storage
    .from("invoices")
    .createSignedUrl(invoice.file_path, 3600);

  if (signError) throw signError;
  return { invoice, url: signed.signedUrl };
}

export async function getInvoiceByOrderId(orderId: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("invoices")
    .select("*")
    .eq("order_id", orderId)
    .maybeSingle();

  if (error) throw error;
  return data;
}
