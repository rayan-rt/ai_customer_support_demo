-- Extensions and enum types for Lumière Bridal demo

create extension if not exists vector with schema extensions;
create extension if not exists pgcrypto with schema extensions;

create type public.user_role as enum ('customer', 'admin');

create type public.order_status as enum (
  'pending',
  'confirmed',
  'processing',
  'shipped',
  'delivered',
  'cancelled'
);

create type public.order_source as enum (
  'storefront',
  'ai_chat',
  'simulated_whatsapp',
  'admin'
);

create type public.invoice_status as enum (
  'draft',
  'generated',
  'sent',
  'paid'
);

create type public.conversation_channel as enum ('web', 'simulated_whatsapp');

create type public.conversation_status as enum ('active', 'escalated', 'closed');

create type public.message_role as enum ('user', 'assistant', 'tool', 'system');

create type public.ticket_status as enum ('open', 'in_progress', 'resolved');

create type public.ticket_priority as enum ('low', 'medium', 'high', 'urgent');

create type public.automation_event_status as enum (
  'pending',
  'processing',
  'completed',
  'failed'
);

create type public.integration_provider as enum ('shopify', 'whatsapp', 'excel');

-- Embedding dimension: 1024 for Cohere embed-english-v3.0 (see COHERE_EMBEDDING_MODEL in .env)
comment on schema public is 'Lumière Bridal AI customer support demo';
