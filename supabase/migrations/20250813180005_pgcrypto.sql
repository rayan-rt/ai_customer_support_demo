-- Ensure pgcrypto is available for seed auth user passwords
create extension if not exists pgcrypto with schema extensions;
