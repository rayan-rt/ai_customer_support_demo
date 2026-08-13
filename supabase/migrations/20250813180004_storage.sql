-- Private invoice storage bucket and policies

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'invoices',
  'invoices',
  false,
  52428800,
  array['application/pdf']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'product-images',
  'product-images',
  true,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Invoice PDFs: admin full access; customers via order ownership check
create policy "Admins full access to invoices bucket"
  on storage.objects for all
  to authenticated
  using (
    bucket_id = 'invoices'
    and public.is_admin()
  )
  with check (
    bucket_id = 'invoices'
    and public.is_admin()
  );

create policy "Customers read own invoice files"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'invoices'
    and exists (
      select 1
      from public.invoices inv
      join public.orders o on o.id = inv.order_id
      join public.customers c on c.id = o.customer_id
      where inv.file_path = storage.objects.name
        and c.profile_id = auth.uid()
    )
  );

-- Product images: public read, admin write
create policy "Public read product images"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'product-images');

create policy "Admins manage product images"
  on storage.objects for all
  to authenticated
  using (bucket_id = 'product-images' and public.is_admin())
  with check (bucket_id = 'product-images' and public.is_admin());
