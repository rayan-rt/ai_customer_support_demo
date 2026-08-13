-- Helper functions, triggers, indexes, and vector search

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create trigger products_set_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

create trigger product_variants_set_updated_at
  before update on public.product_variants
  for each row execute function public.set_updated_at();

create trigger customers_set_updated_at
  before update on public.customers
  for each row execute function public.set_updated_at();

create trigger orders_set_updated_at
  before update on public.orders
  for each row execute function public.set_updated_at();

create trigger conversations_set_updated_at
  before update on public.conversations
  for each row execute function public.set_updated_at();

create trigger tickets_set_updated_at
  before update on public.tickets
  for each row execute function public.set_updated_at();

create trigger knowledge_documents_set_updated_at
  before update on public.knowledge_documents
  for each row execute function public.set_updated_at();

create trigger integration_records_set_updated_at
  before update on public.integration_records
  for each row execute function public.set_updated_at();

-- Always assign customer role on signup; never trust client-supplied role metadata
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
    coalesce(new.email, ''),
    'customer'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.get_user_role()
returns public.user_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
  );
$$;

create or replace function public.is_customer_owner(customer_row_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.customers c
    where c.id = customer_row_id
      and c.profile_id = auth.uid()
  );
$$;

create or replace function public.can_access_order(order_row_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_admin()
    or exists (
      select 1
      from public.orders o
      join public.customers c on c.id = o.customer_id
      where o.id = order_row_id
        and c.profile_id = auth.uid()
    );
$$;

-- Vector similarity search (cosine distance). Used by RAG pipeline server-side.
create or replace function public.match_knowledge_chunks(
  query_embedding extensions.vector(1024),
  match_threshold float default 0.5,
  match_count int default 5
)
returns table (
  id uuid,
  document_id uuid,
  content text,
  chunk_index int,
  metadata jsonb,
  similarity float
)
language sql
stable
set search_path to 'public', 'extensions'
as $$
  select
    kc.id,
    kc.document_id,
    kc.content,
    kc.chunk_index,
    kc.metadata,
    1 - (kc.embedding <=> query_embedding) as similarity
  from public.knowledge_chunks kc
  where kc.embedding is not null
    and 1 - (kc.embedding <=> query_embedding) > match_threshold
  order by kc.embedding <=> query_embedding
  limit match_count;
$$;

grant execute on function public.match_knowledge_chunks(extensions.vector(1024), float, int)
  to authenticated, service_role, anon;

-- Indexes
create index products_slug_idx on public.products (slug);
create index products_category_idx on public.products (category);
create index products_is_active_idx on public.products (is_active);

create index product_variants_product_id_idx on public.product_variants (product_id);
create index product_variants_sku_idx on public.product_variants (sku);

create index customers_profile_id_idx on public.customers (profile_id);
create index customers_email_idx on public.customers (email);

create index orders_order_number_idx on public.orders (order_number);
create index orders_customer_id_idx on public.orders (customer_id);
create index orders_status_idx on public.orders (status);
create index orders_created_at_idx on public.orders (created_at desc);

create index order_items_order_id_idx on public.order_items (order_id);
create index order_items_product_id_idx on public.order_items (product_id);

create index invoices_order_id_idx on public.invoices (order_id);
create index invoices_invoice_number_idx on public.invoices (invoice_number);

create index conversations_customer_id_idx on public.conversations (customer_id);
create index conversations_status_idx on public.conversations (status);

create index messages_conversation_id_idx on public.messages (conversation_id);
create index messages_created_at_idx on public.messages (created_at);

create index tickets_customer_id_idx on public.tickets (customer_id);
create index tickets_status_idx on public.tickets (status);
create index tickets_conversation_id_idx on public.tickets (conversation_id);

create index knowledge_documents_category_idx on public.knowledge_documents (category);

create index knowledge_chunks_document_id_idx on public.knowledge_chunks (document_id);

create index knowledge_chunks_embedding_hnsw_idx
  on public.knowledge_chunks
  using hnsw (embedding extensions.vector_cosine_ops);

create index automation_events_order_id_idx on public.automation_events (order_id);
create index automation_events_status_idx on public.automation_events (status);
create index automation_events_created_at_idx on public.automation_events (created_at desc);

create index integration_records_provider_idx on public.integration_records (provider);
create index integration_records_entity_idx on public.integration_records (entity_type, entity_id);
