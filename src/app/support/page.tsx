import { CartHeaderWrapper } from "@/components/storefront/shell";
import { SupportChat } from "@/components/support/chat-panel";
import { getAuthUser } from "@/lib/auth/session";
import { getCustomerByProfileId } from "@/lib/services/customer-service";

export default async function SupportPage() {
  const user = await getAuthUser();
  const customer = user ? await getCustomerByProfileId(user.id) : null;

  return (
    <CartHeaderWrapper>
      <div className="mx-auto max-w-3xl px-6 py-10">
        <h1 className="font-serif text-3xl">Customer Support</h1>
        <p className="mt-2 text-[var(--muted)]">
          Ask about policies, check product availability, track orders, or place a new order.
        </p>
        <div className="mt-8 h-[600px]">
          <SupportChat customerId={customer?.id} />
        </div>
      </div>
    </CartHeaderWrapper>
  );
}
