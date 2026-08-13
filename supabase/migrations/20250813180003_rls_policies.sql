-- Row Level Security policies

alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.product_variants enable row level security;
alter table public.customers enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.invoices enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.tickets enable row level security;
alter table public.knowledge_documents enable row level security;
alter table public.knowledge_chunks enable row level security;
alter table public.automation_events enable row level security;
alter table public.integration_records enable row level security;

-- profiles
create policy "Users can view own profile"
  on public.profiles for select
  to authenticated
  using (id = auth.uid() or public.is_admin());

create policy "Users can update own profile"
  on public.profiles for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid() and role = (select role from public.profiles where id = auth.uid()));

create policy "Admins can update any profile"
  on public.profiles for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- products (public catalog read)
create policy "Anyone can view active products"
  on public.products for select
  to anon, authenticated
  using (is_active = true or public.is_admin());

create policy "Admins manage products"
  on public.products for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- product_variants
create policy "Anyone can view variants of active products"
  on public.product_variants for select
  to anon, authenticated
  using (
    public.is_admin()
    or exists (
      select 1 from public.products p
      where p.id = product_id and p.is_active = true
    )
  );

create policy "Admins manage variants"
  on public.product_variants for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- customers
create policy "Customers view own record"
  on public.customers for select
  to authenticated
  using (profile_id = auth.uid() or public.is_admin());

create policy "Customers update own record"
  on public.customers for update
  to authenticated
  using (profile_id = auth.uid())
  with check (profile_id = auth.uid());

create policy "Authenticated users can create customer record"
  on public.customers for insert
  to authenticated
  with check (profile_id = auth.uid() or public.is_admin());

create policy "Admins manage customers"
  on public.customers for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- orders
create policy "Customers view own orders"
  on public.orders for select
  to authenticated
  using (public.can_access_order(id));

create policy "Customers create own orders"
  on public.orders for insert
  to authenticated
  with check (
    public.is_admin()
    or exists (
      select 1 from public.customers c
      where c.id = customer_id and c.profile_id = auth.uid()
    )
  );

create policy "Admins manage orders"
  on public.orders for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- order_items
create policy "View order items for accessible orders"
  on public.order_items for select
  to authenticated
  using (public.can_access_order(order_id));

create policy "Insert order items for accessible orders"
  on public.order_items for insert
  to authenticated
  with check (public.can_access_order(order_id) or public.is_admin());

create policy "Admins manage order items"
  on public.order_items for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- invoices
create policy "View invoices for accessible orders"
  on public.invoices for select
  to authenticated
  using (public.can_access_order(order_id));

create policy "Admins manage invoices"
  on public.invoices for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- conversations
create policy "Customers view own conversations"
  on public.conversations for select
  to authenticated
  using (
    public.is_admin()
    or (customer_id is not null and public.is_customer_owner(customer_id))
  );

create policy "Customers create conversations"
  on public.conversations for insert
  to authenticated
  with check (
    public.is_admin()
    or customer_id is null
    or public.is_customer_owner(customer_id)
  );

create policy "Admins manage conversations"
  on public.conversations for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- messages
create policy "View messages in accessible conversations"
  on public.messages for select
  to authenticated
  using (
    public.is_admin()
    or exists (
      select 1 from public.conversations conv
      where conv.id = conversation_id
        and (
          conv.customer_id is null
          or public.is_customer_owner(conv.customer_id)
        )
    )
  );

create policy "Insert messages in accessible conversations"
  on public.messages for insert
  to authenticated
  with check (
    public.is_admin()
    or exists (
      select 1 from public.conversations conv
      where conv.id = conversation_id
        and (
          conv.customer_id is null
          or public.is_customer_owner(conv.customer_id)
        )
    )
  );

-- tickets
create policy "Customers view own tickets"
  on public.tickets for select
  to authenticated
  using (
    public.is_admin()
    or (customer_id is not null and public.is_customer_owner(customer_id))
  );

create policy "Customers create own tickets"
  on public.tickets for insert
  to authenticated
  with check (
    public.is_admin()
    or customer_id is null
    or public.is_customer_owner(customer_id)
  );

create policy "Admins manage tickets"
  on public.tickets for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- knowledge (read for authenticated; admin write)
create policy "Authenticated users can read knowledge documents"
  on public.knowledge_documents for select
  to authenticated
  using (true);

create policy "Admins manage knowledge documents"
  on public.knowledge_documents for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "Authenticated users can read knowledge chunks"
  on public.knowledge_chunks for select
  to authenticated
  using (true);

create policy "Admins manage knowledge chunks"
  on public.knowledge_chunks for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- automation_events
create policy "View automation events for accessible orders"
  on public.automation_events for select
  to authenticated
  using (
    public.is_admin()
    or (
      order_id is not null
      and public.can_access_order(order_id)
    )
  );

create policy "Admins manage automation events"
  on public.automation_events for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- integration_records (admin only)
create policy "Admins view integration records"
  on public.integration_records for select
  to authenticated
  using (public.is_admin());

create policy "Admins manage integration records"
  on public.integration_records for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());
