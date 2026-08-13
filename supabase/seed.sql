-- Lumière Bridal demo seed data (deterministic, idempotent where practical)
-- Re-run safe: uses fixed UUIDs and ON CONFLICT / conditional inserts

begin;

set local search_path to public, extensions, auth;

-- Demo auth users (password: demo123456 for all)
insert into auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  recovery_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) values
  (
    '00000000-0000-0000-0000-000000000000',
    '11111111-1111-4111-8111-111111111111',
    'authenticated',
    'authenticated',
    'admin@lumieredemo.com',
    crypt('demo123456', gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Elena Admin"}',
    now(),
    now(),
    '', '', '', ''
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '22222222-2222-4222-8222-222222222222',
    'authenticated',
    'authenticated',
    'sarah.chen@example.com',
    crypt('demo123456', gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Sarah Chen"}',
    now(),
    now(),
    '', '', '', ''
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '33333333-3333-4333-8333-333333333333',
    'authenticated',
    'authenticated',
    'amira.khan@example.com',
    crypt('demo123456', gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Amira Khan"}',
    now(),
    now(),
    '', '', '', ''
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '44444444-4444-4444-8444-444444444444',
    'authenticated',
    'authenticated',
    'james.wilson@example.com',
    crypt('demo123456', gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"James Wilson"}',
    now(),
    now(),
    '', '', '', ''
  )
on conflict (id) do nothing;

insert into auth.identities (
  id,
  user_id,
  identity_data,
  provider,
  provider_id,
  last_sign_in_at,
  created_at,
  updated_at
) values
  ('11111111-1111-4111-8111-111111111111', '11111111-1111-4111-8111-111111111111', '{"sub":"11111111-1111-4111-8111-111111111111","email":"admin@lumieredemo.com"}', 'email', '11111111-1111-4111-8111-111111111111', now(), now(), now()),
  ('22222222-2222-4222-8222-222222222222', '22222222-2222-4222-8222-222222222222', '{"sub":"22222222-2222-4222-8222-222222222222","email":"sarah.chen@example.com"}', 'email', '22222222-2222-4222-8222-222222222222', now(), now(), now()),
  ('33333333-3333-4333-8333-333333333333', '33333333-3333-4333-8333-333333333333', '{"sub":"33333333-3333-4333-8333-333333333333","email":"amira.khan@example.com"}', 'email', '33333333-3333-4333-8333-333333333333', now(), now(), now()),
  ('44444444-4444-4444-8444-444444444444', '44444444-4444-4444-8444-444444444444', '{"sub":"44444444-4444-4444-8444-444444444444","email":"james.wilson@example.com"}', 'email', '44444444-4444-4444-8444-444444444444', now(), now(), now())
on conflict (id) do nothing;

-- Profiles are created by trigger; promote admin and ensure data
insert into public.profiles (id, full_name, email, role)
values
  ('11111111-1111-4111-8111-111111111111', 'Elena Admin', 'admin@lumieredemo.com', 'admin'),
  ('22222222-2222-4222-8222-222222222222', 'Sarah Chen', 'sarah.chen@example.com', 'customer'),
  ('33333333-3333-4333-8333-333333333333', 'Amira Khan', 'amira.khan@example.com', 'customer'),
  ('44444444-4444-4444-8444-444444444444', 'James Wilson', 'james.wilson@example.com', 'customer')
on conflict (id) do update set
  full_name = excluded.full_name,
  email = excluded.email,
  role = excluded.role;

-- Products
insert into public.products (id, name, slug, description, price, category, image_url, is_active)
values
  ('a1000001-0000-4000-8000-000000000001', 'Red Bridal Suit', 'red-bridal-suit', 'A striking crimson bridal suit tailored for modern ceremonies. Structured shoulders, satin lapels, and a refined silhouette.', 489.00, 'Bridal Suits', 'https://images.unsplash.com/photo-1595777457583-95e059d581bb?w=800', true),
  ('a1000001-0000-4000-8000-000000000002', 'Ivory Lace Gown', 'ivory-lace-gown', 'Romantic A-line gown with hand-applied Chantilly lace and a soft tulle train.', 1299.00, 'Gowns', 'https://images.unsplash.com/photo-1515377901643-4a9748da2991?w=800', true),
  ('a1000001-0000-4000-8000-000000000003', 'Champagne Satin Dress', 'champagne-satin-dress', 'Bias-cut satin slip dress in warm champagne with adjustable straps.', 649.00, 'Dresses', 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=800', true),
  ('a1000001-0000-4000-8000-000000000004', 'Emerald Evening Gown', 'emerald-evening-gown', 'Floor-length emerald velvet gown with a draped back and side slit.', 899.00, 'Evening', 'https://images.unsplash.com/photo-1539008835657-9e8e96875907?w=800', true),
  ('a1000001-0000-4000-8000-000000000005', 'Pearl Embroidered Lehenga', 'pearl-embroidered-lehenga', 'Three-piece lehenga set with pearl embroidery, silk blouse, and organza dupatta.', 1599.00, 'Lehenga', 'https://images.unsplash.com/photo-1583391733981-9b17e7d9b0df?w=800', true),
  ('a1000001-0000-4000-8000-000000000006', 'Blush Tulle Skirt', 'blush-tulle-skirt', 'Layered blush tulle maxi skirt perfect for rehearsal dinners and portraits.', 279.00, 'Separates', 'https://images.unsplash.com/photo-1519657336929-b25d69122f58?w=800', true),
  ('a1000001-0000-4000-8000-000000000007', 'Sapphire Cocktail Dress', 'sapphire-cocktail-dress', 'Midi cocktail dress in sapphire crepe with a sculpted bodice.', 429.00, 'Cocktail', 'https://images.unsplash.com/photo-1594633312681-425a7b956cc2?w=800', true),
  ('a1000001-0000-4000-8000-000000000008', 'Gold Threaded Saree', 'gold-threaded-saree', 'Silk saree with gold zari border and pre-stitched pleats for easy draping.', 749.00, 'Saree', 'https://images.unsplash.com/photo-1610036738985-6927707a4734?w=800', true),
  ('a1000001-0000-4000-8000-000000000009', 'Classic Cathedral Veil', 'classic-cathedral-veil', 'Single-tier cathedral veil with a delicate satin ribbon edge.', 189.00, 'Accessories', 'https://images.unsplash.com/photo-1522673608300-1d8b1c2e3f4a?w=800', true)
on conflict (id) do update set
  name = excluded.name,
  description = excluded.description,
  price = excluded.price,
  category = excluded.category,
  image_url = excluded.image_url,
  is_active = excluded.is_active;

-- Product variants
insert into public.product_variants (id, product_id, size, sku, stock_quantity)
values
  ('b2000001-0000-4000-8000-000000000001', 'a1000001-0000-4000-8000-000000000001', 'XS', 'LBR-SUIT-RED-XS', 3),
  ('b2000001-0000-4000-8000-000000000002', 'a1000001-0000-4000-8000-000000000001', 'S', 'LBR-SUIT-RED-S', 5),
  ('b2000001-0000-4000-8000-000000000003', 'a1000001-0000-4000-8000-000000000001', 'M', 'LBR-SUIT-RED-M', 8),
  ('b2000001-0000-4000-8000-000000000004', 'a1000001-0000-4000-8000-000000000001', 'L', 'LBR-SUIT-RED-L', 4),
  ('b2000001-0000-4000-8000-000000000005', 'a1000001-0000-4000-8000-000000000002', 'S', 'LBR-GOWN-IV-S', 2),
  ('b2000001-0000-4000-8000-000000000006', 'a1000001-0000-4000-8000-000000000002', 'M', 'LBR-GOWN-IV-M', 3),
  ('b2000001-0000-4000-8000-000000000007', 'a1000001-0000-4000-8000-000000000002', 'L', 'LBR-GOWN-IV-L', 1),
  ('b2000001-0000-4000-8000-000000000008', 'a1000001-0000-4000-8000-000000000003', 'XS', 'LBR-SAT-CH-XS', 6),
  ('b2000001-0000-4000-8000-000000000009', 'a1000001-0000-4000-8000-000000000003', 'S', 'LBR-SAT-CH-S', 7),
  ('b2000001-0000-4000-8000-000000000010', 'a1000001-0000-4000-8000-000000000003', 'M', 'LBR-SAT-CH-M', 5),
  ('b2000001-0000-4000-8000-000000000011', 'a1000001-0000-4000-8000-000000000004', 'S', 'LBR-EMR-S', 4),
  ('b2000001-0000-4000-8000-000000000012', 'a1000001-0000-4000-8000-000000000004', 'M', 'LBR-EMR-M', 3),
  ('b2000001-0000-4000-8000-000000000013', 'a1000001-0000-4000-8000-000000000005', 'M', 'LBR-LHN-M', 2),
  ('b2000001-0000-4000-8000-000000000014', 'a1000001-0000-4000-8000-000000000005', 'L', 'LBR-LHN-L', 2),
  ('b2000001-0000-4000-8000-000000000015', 'a1000001-0000-4000-8000-000000000006', 'S', 'LBR-TUL-S', 10),
  ('b2000001-0000-4000-8000-000000000016', 'a1000001-0000-4000-8000-000000000006', 'M', 'LBR-TUL-M', 9),
  ('b2000001-0000-4000-8000-000000000017', 'a1000001-0000-4000-8000-000000000007', 'S', 'LBR-CKT-S', 6),
  ('b2000001-0000-4000-8000-000000000018', 'a1000001-0000-4000-8000-000000000007', 'M', 'LBR-CKT-M', 5),
  ('b2000001-0000-4000-8000-000000000019', 'a1000001-0000-4000-8000-000000000008', 'Free', 'LBR-SAR-FREE', 4),
  ('b2000001-0000-4000-8000-000000000020', 'a1000001-0000-4000-8000-000000000009', 'One Size', 'LBR-VEIL-OS', 15)
on conflict (id) do update set
  stock_quantity = excluded.stock_quantity;

-- Customers
insert into public.customers (id, profile_id, name, email, phone)
values
  ('c3000001-0000-4000-8000-000000000001', '22222222-2222-4222-8222-222222222222', 'Sarah Chen', 'sarah.chen@example.com', '+1-415-555-0101'),
  ('c3000001-0000-4000-8000-000000000002', '33333333-3333-4333-8333-333333333333', 'Amira Khan', 'amira.khan@example.com', '+1-646-555-0102'),
  ('c3000001-0000-4000-8000-000000000003', '44444444-4444-4444-8444-444444444444', 'James Wilson', 'james.wilson@example.com', '+1-312-555-0103'),
  ('c3000001-0000-4000-8000-000000000004', null, 'Guest Shopper', 'guest@example.com', '+1-206-555-0199')
on conflict (id) do update set
  profile_id = excluded.profile_id,
  name = excluded.name,
  email = excluded.email,
  phone = excluded.phone;

-- Orders
insert into public.orders (id, order_number, customer_id, status, subtotal, shipping_fee, discount, total, shipping_address, source)
values
  (
    'd4000001-0000-4000-8000-000000000001',
    'LBR-20250801-001',
    'c3000001-0000-4000-8000-000000000001',
    'delivered',
    489.00,
    25.00,
    0,
    514.00,
    '{"line1":"742 Evergreen Terrace","city":"San Francisco","state":"CA","postal_code":"94110","country":"US"}'::jsonb,
    'storefront'
  ),
  (
    'd4000001-0000-4000-8000-000000000002',
    'LBR-20250805-002',
    'c3000001-0000-4000-8000-000000000002',
    'shipped',
    1299.00,
    35.00,
    50.00,
    1284.00,
    '{"line1":"18 Willow Lane","city":"Brooklyn","state":"NY","postal_code":"11201","country":"US"}'::jsonb,
    'ai_chat'
  ),
  (
    'd4000001-0000-4000-8000-000000000003',
    'LBR-20250810-003',
    'c3000001-0000-4000-8000-000000000003',
    'processing',
    878.00,
    25.00,
    0,
    903.00,
    '{"line1":"220 Lake Shore Drive","city":"Chicago","state":"IL","postal_code":"60601","country":"US"}'::jsonb,
    'simulated_whatsapp'
  )
on conflict (id) do update set
  status = excluded.status,
  total = excluded.total;

insert into public.order_items (id, order_id, product_id, variant_id, product_name_snapshot, sku_snapshot, unit_price, quantity, line_total)
values
  ('e5000001-0000-4000-8000-000000000001', 'd4000001-0000-4000-8000-000000000001', 'a1000001-0000-4000-8000-000000000001', 'b2000001-0000-4000-8000-000000000003', 'Red Bridal Suit', 'LBR-SUIT-RED-M', 489.00, 1, 489.00),
  ('e5000001-0000-4000-8000-000000000002', 'd4000001-0000-4000-8000-000000000002', 'a1000001-0000-4000-8000-000000000002', 'b2000001-0000-4000-8000-000000000006', 'Ivory Lace Gown', 'LBR-GOWN-IV-M', 1299.00, 1, 1299.00),
  ('e5000001-0000-4000-8000-000000000003', 'd4000001-0000-4000-8000-000000000003', 'a1000001-0000-4000-8000-000000000007', 'b2000001-0000-4000-8000-000000000018', 'Sapphire Cocktail Dress', 'LBR-CKT-M', 429.00, 1, 429.00),
  ('e5000001-0000-4000-8000-000000000004', 'd4000001-0000-4000-8000-000000000003', 'a1000001-0000-4000-8000-000000000009', 'b2000001-0000-4000-8000-000000000020', 'Classic Cathedral Veil', 'LBR-VEIL-OS', 189.00, 1, 189.00),
  ('e5000001-0000-4000-8000-000000000005', 'd4000001-0000-4000-8000-000000000003', 'a1000001-0000-4000-8000-000000000006', 'b2000001-0000-4000-8000-000000000016', 'Blush Tulle Skirt', 'LBR-TUL-M', 279.00, 1, 279.00)
on conflict (id) do nothing;

insert into public.invoices (id, order_id, invoice_number, subtotal, shipping_fee, discount, total, status, file_path)
values
  ('f6000001-0000-4000-8000-000000000001', 'd4000001-0000-4000-8000-000000000001', 'INV-20250801-001', 489.00, 25.00, 0, 514.00, 'generated', null),
  ('f6000001-0000-4000-8000-000000000002', 'd4000001-0000-4000-8000-000000000002', 'INV-20250805-002', 1299.00, 35.00, 50.00, 1284.00, 'generated', null),
  ('f6000001-0000-4000-8000-000000000003', 'd4000001-0000-4000-8000-000000000003', 'INV-20250810-003', 878.00, 25.00, 0, 903.00, 'draft', null)
on conflict (id) do update set status = excluded.status;

-- Knowledge documents
insert into public.knowledge_documents (id, title, content, category, source)
values
  ('07000001-0000-4000-8000-000000000001', 'Exchange Policy', 'Lumière Bridal Exchange Policy: Items may be exchanged within 14 days of delivery for another size or color of equal value, subject to availability. Exchanges require the item to be unworn, with original tags attached, and accompanied by proof of purchase. Final-sale and customized pieces are not eligible for exchange. Exchanges are processed within 5-7 business days after we receive and inspect the return. Shipping costs for exchanges are covered by Lumière Bridal for domestic orders.', 'Policy', 'seed'),
  ('07000001-0000-4000-8000-000000000002', 'Return Policy', 'Lumière Bridal Return Policy: Returns are accepted within 30 days of delivery for a refund to the original payment method. Items must be unworn, unwashed, and include all tags and packaging. A flat $15 restocking fee applies to returns unless the item arrived damaged or incorrect. Refunds are issued within 7-10 business days after inspection. Gift returns receive store credit.', 'Policy', 'seed'),
  ('07000001-0000-4000-8000-000000000003', 'Shipping Policy', 'Lumière Bridal ships domestically and internationally. Standard domestic shipping (5-7 business days) is $25. Express shipping (2-3 business days) is $45. Free standard shipping applies to orders over $500 within the continental US. Bridal gowns and lehengas ship in protective garment bags. Tracking is provided for all orders.', 'Policy', 'seed'),
  ('07000001-0000-4000-8000-000000000004', 'Payment Methods', 'We accept Visa, Mastercard, American Express, Discover, Apple Pay, Google Pay, and PayPal. Buy-now-pay-later is available through Affirm for orders over $200. All transactions are processed securely. We do not accept cash, checks, or cryptocurrency.', 'Policy', 'seed'),
  ('07000001-0000-4000-8000-000000000005', 'Size Guide', 'Lumière Bridal Size Guide: XS (US 0-2, bust 32-33"), S (US 4-6, bust 34-35"), M (US 8-10, bust 36-37"), L (US 12-14, bust 38-40"). Bridal suits run true to size with a tailored fit. Gowns and lehengas may require minor alterations; we recommend ordering your usual size and consulting our stylists for custom sizing.', 'Guide', 'seed'),
  ('07000001-0000-4000-8000-000000000006', 'Delivery Information', 'Delivery windows are estimates and may vary during peak bridal season (March-June). Signature confirmation is required for orders over $800. If you are unavailable, the carrier will leave a notice for redelivery or pickup. International customers are responsible for customs duties and import taxes. Contact support to schedule delivery for a specific event date.', 'Policy', 'seed'),
  ('07000001-0000-4000-8000-000000000007', 'About the Brand', 'Lumière Bridal is a fictional premium bridal and occasion wear house founded in 2018. We craft modern silhouettes with artisan embroidery, sustainable packaging, and inclusive sizing. Our atelier partners with family-run workshops in Mumbai, Milan, and Los Angeles. This demo storefront showcases our AI-powered customer support experience.', 'Brand', 'seed'),
  ('07000001-0000-4000-8000-000000000008', 'Product Care', 'Product Care Instructions: Store garments in breathable garment bags away from direct sunlight. Dry clean only for silk, satin, velvet, and heavily embellished pieces. Spot clean tulle and veils with a soft cloth. Do not iron directly on lace or beading. Allow 24 hours for creases to release after unpacking. Contact us for stain emergencies before attempting home treatment.', 'Guide', 'seed')
on conflict (id) do update set
  title = excluded.title,
  content = excluded.content,
  category = excluded.category;

-- Knowledge chunks (one chunk per document for demo)
insert into public.knowledge_chunks (id, document_id, content, chunk_index, metadata)
values
  ('08000001-0000-4000-8000-000000000001', '07000001-0000-4000-8000-000000000001', (select content from public.knowledge_documents where id = '07000001-0000-4000-8000-000000000001'), 0, '{"title":"Exchange Policy","category":"Policy","source":"seed"}'::jsonb),
  ('08000001-0000-4000-8000-000000000002', '07000001-0000-4000-8000-000000000002', (select content from public.knowledge_documents where id = '07000001-0000-4000-8000-000000000002'), 0, '{"title":"Return Policy","category":"Policy","source":"seed"}'::jsonb),
  ('08000001-0000-4000-8000-000000000003', '07000001-0000-4000-8000-000000000003', (select content from public.knowledge_documents where id = '07000001-0000-4000-8000-000000000003'), 0, '{"title":"Shipping Policy","category":"Policy","source":"seed"}'::jsonb),
  ('08000001-0000-4000-8000-000000000004', '07000001-0000-4000-8000-000000000004', (select content from public.knowledge_documents where id = '07000001-0000-4000-8000-000000000004'), 0, '{"title":"Payment Methods","category":"Policy","source":"seed"}'::jsonb),
  ('08000001-0000-4000-8000-000000000005', '07000001-0000-4000-8000-000000000005', (select content from public.knowledge_documents where id = '07000001-0000-4000-8000-000000000005'), 0, '{"title":"Size Guide","category":"Guide","source":"seed"}'::jsonb),
  ('08000001-0000-4000-8000-000000000006', '07000001-0000-4000-8000-000000000006', (select content from public.knowledge_documents where id = '07000001-0000-4000-8000-000000000006'), 0, '{"title":"Delivery Information","category":"Policy","source":"seed"}'::jsonb),
  ('08000001-0000-4000-8000-000000000007', '07000001-0000-4000-8000-000000000007', (select content from public.knowledge_documents where id = '07000001-0000-4000-8000-000000000007'), 0, '{"title":"About the Brand","category":"Brand","source":"seed"}'::jsonb),
  ('08000001-0000-4000-8000-000000000008', '07000001-0000-4000-8000-000000000008', (select content from public.knowledge_documents where id = '07000001-0000-4000-8000-000000000008'), 0, '{"title":"Product Care","category":"Guide","source":"seed"}'::jsonb)
on conflict (document_id, chunk_index) do update set
  content = excluded.content,
  metadata = excluded.metadata;

-- Conversations and messages
insert into public.conversations (id, customer_id, channel, status)
values
  ('09000001-0000-4000-8000-000000000001', 'c3000001-0000-4000-8000-000000000001', 'web', 'closed'),
  ('09000001-0000-4000-8000-000000000002', 'c3000001-0000-4000-8000-000000000002', 'web', 'escalated')
on conflict (id) do update set status = excluded.status;

insert into public.messages (id, conversation_id, role, content, metadata)
values
  ('0a100001-0000-4000-8000-000000000001', '09000001-0000-4000-8000-000000000001', 'user', 'What is your exchange policy?', '{}'),
  ('0a100001-0000-4000-8000-000000000002', '09000001-0000-4000-8000-000000000001', 'assistant', 'Items may be exchanged within 14 days of delivery for another size or color of equal value.', '{"tool":"searchKnowledgeBase"}'),
  ('0a100001-0000-4000-8000-000000000003', '09000001-0000-4000-8000-000000000002', 'user', 'I need a full refund for my gown — the color is completely wrong.', '{}'),
  ('0a100001-0000-4000-8000-000000000004', '09000001-0000-4000-8000-000000000002', 'assistant', 'I understand your concern. Let me connect you with a specialist for refund review.', '{"escalated":true}')
on conflict (id) do nothing;

-- Escalated ticket
insert into public.tickets (id, conversation_id, customer_id, category, priority, status, subject, description)
values
  (
    '0b110001-0000-4000-8000-000000000001',
    '09000001-0000-4000-8000-000000000002',
    'c3000001-0000-4000-8000-000000000002',
    'Refund Request',
    'high',
    'open',
    'Gown color mismatch — refund requested',
    'Customer reports the Ivory Lace Gown arrived with a noticeable yellow tint under natural light and requests a full refund plus return shipping.'
  )
on conflict (id) do update set status = excluded.status;

-- Automation events
insert into public.automation_events (id, order_id, type, provider, status, payload, completed_at)
values
  ('0c120001-0000-4000-8000-000000000001', 'd4000001-0000-4000-8000-000000000001', 'order_created', 'internal', 'completed', '{"message":"Order created"}'::jsonb, now() - interval '12 days'),
  ('0c120001-0000-4000-8000-000000000002', 'd4000001-0000-4000-8000-000000000001', 'inventory_updated', 'internal', 'completed', '{"sku":"LBR-SUIT-RED-M","delta":-1}'::jsonb, now() - interval '12 days'),
  ('0c120001-0000-4000-8000-000000000003', 'd4000001-0000-4000-8000-000000000001', 'invoice_generated', 'internal', 'completed', '{"invoice_number":"INV-20250801-001"}'::jsonb, now() - interval '12 days'),
  ('0c120001-0000-4000-8000-000000000004', 'd4000001-0000-4000-8000-000000000001', 'shopify_sync', 'shopify', 'completed', '{"simulated":true,"external_id":"shopify-order-1001"}'::jsonb, now() - interval '12 days'),
  ('0c120001-0000-4000-8000-000000000005', 'd4000001-0000-4000-8000-000000000001', 'excel_sync', 'excel', 'completed', '{"simulated":true,"file":"orders-export-20250801.csv"}'::jsonb, now() - interval '12 days'),
  ('0c120001-0000-4000-8000-000000000006', 'd4000001-0000-4000-8000-000000000002', 'order_created', 'internal', 'completed', '{"message":"Order created via AI chat"}'::jsonb, now() - interval '8 days'),
  ('0c120001-0000-4000-8000-000000000007', 'd4000001-0000-4000-8000-000000000003', 'whatsapp_confirmation', 'whatsapp', 'completed', '{"simulated":true,"to":"+1-312-555-0103"}'::jsonb, now() - interval '3 days')
on conflict (id) do update set status = excluded.status;

insert into public.integration_records (id, provider, external_id, entity_type, entity_id, status, metadata)
values
  ('0d130001-0000-4000-8000-000000000001', 'shopify', 'shopify-order-1001', 'order', 'd4000001-0000-4000-8000-000000000001', 'synced', '{"simulated":true}'::jsonb),
  ('0d130001-0000-4000-8000-000000000002', 'shopify', 'shopify-product-red-suit', 'product', 'a1000001-0000-4000-8000-000000000001', 'synced', '{"simulated":true}'::jsonb),
  ('0d130001-0000-4000-8000-000000000003', 'whatsapp', 'wa-msg-2001', 'conversation', '09000001-0000-4000-8000-000000000002', 'delivered', '{"simulated":true}'::jsonb),
  ('0d130001-0000-4000-8000-000000000004', 'excel', 'excel-row-3001', 'order', 'd4000001-0000-4000-8000-000000000002', 'synced', '{"simulated":true,"sheet":"Orders"}'::jsonb)
on conflict (provider, external_id) do update set status = excluded.status;

commit;
