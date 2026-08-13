-- Core application tables

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null default '',
  email text not null,
  role public.user_role not null default 'customer',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text not null default '',
  price numeric(10, 2) not null check (price >= 0),
  category text not null,
  image_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  size text not null,
  sku text not null unique,
  stock_quantity integer not null default 0 check (stock_quantity >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (product_id, size)
);

create table public.customers (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles (id) on delete set null,
  name text not null,
  email text not null,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  customer_id uuid not null references public.customers (id) on delete restrict,
  status public.order_status not null default 'pending',
  subtotal numeric(10, 2) not null check (subtotal >= 0),
  shipping_fee numeric(10, 2) not null default 0 check (shipping_fee >= 0),
  discount numeric(10, 2) not null default 0 check (discount >= 0),
  total numeric(10, 2) not null check (total >= 0),
  shipping_address jsonb not null default '{}'::jsonb,
  source public.order_source not null default 'storefront',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete restrict,
  variant_id uuid references public.product_variants (id) on delete set null,
  product_name_snapshot text not null,
  sku_snapshot text not null,
  unit_price numeric(10, 2) not null check (unit_price >= 0),
  quantity integer not null check (quantity > 0),
  line_total numeric(10, 2) not null check (line_total >= 0)
);

create table public.invoices (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null unique references public.orders (id) on delete cascade,
  invoice_number text not null unique,
  subtotal numeric(10, 2) not null check (subtotal >= 0),
  shipping_fee numeric(10, 2) not null default 0 check (shipping_fee >= 0),
  discount numeric(10, 2) not null default 0 check (discount >= 0),
  total numeric(10, 2) not null check (total >= 0),
  status public.invoice_status not null default 'draft',
  file_path text,
  created_at timestamptz not null default now()
);

create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references public.customers (id) on delete set null,
  channel public.conversation_channel not null default 'web',
  status public.conversation_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  role public.message_role not null,
  content text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.tickets (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid references public.conversations (id) on delete set null,
  customer_id uuid references public.customers (id) on delete set null,
  category text not null,
  priority public.ticket_priority not null default 'medium',
  status public.ticket_status not null default 'open',
  subject text not null,
  description text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.knowledge_documents (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  content text not null,
  category text not null,
  source text not null default 'seed',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.knowledge_chunks (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.knowledge_documents (id) on delete cascade,
  content text not null,
  chunk_index integer not null check (chunk_index >= 0),
  embedding extensions.vector(1024),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (document_id, chunk_index)
);

create table public.automation_events (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders (id) on delete set null,
  type text not null,
  provider text not null,
  status public.automation_event_status not null default 'pending',
  payload jsonb not null default '{}'::jsonb,
  error_message text,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create table public.integration_records (
  id uuid primary key default gen_random_uuid(),
  provider public.integration_provider not null,
  external_id text not null,
  entity_type text not null,
  entity_id uuid not null,
  status text not null default 'synced',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (provider, external_id)
);
