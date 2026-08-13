

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

---

---

## name: ai-ecommerce-support-demo
description: Build a minimal production-quality e-commerce application with an AI customer support agent, RAG knowledge base, product/order tools, customer-facing chat, admin dashboard, invoice generation, and simulated WhatsApp/Shopify integrations using Next.js and Supabase. Use this skill when asked to build the AI customer support e-commerce demo described below.



# AI E-commerce Customer Support Demo



## 0. Mission

Build a complete, runnable demo that proves this business workflow:

Customer -> AI support interface -> product/knowledge/order actions -> Supabase -> invoice -> simulated integrations.

This is NOT a chatbot-only project.

It is a minimal e-commerce application with:

- customer-facing storefront
- product catalog
- product details
- cart
- checkout/order creation
- order confirmation
- invoice generation
- AI customer support chat
- RAG knowledge base
- AI tool calling
- customer/order lookup
- admin dashboard
- order management
- product/inventory management
- conversation history
- ticket/escalation flow
- simulated WhatsApp integration
- simulated Shopify synchronization
- automation/event log

The demo must be self-contained and must work without real WhatsApp or Shopify credentials.

Do NOT block implementation waiting for external integrations.

---



# 1. Non-negotiable architecture

Use:

- Next.js App Router
- TypeScript
- Tailwind CSS
- Supabase PostgreSQL
- Supabase Auth
- Supabase Storage
- pgvector
- Next.js Route Handlers / Server Actions where appropriate
- official Supabase JS/SSR packages
- an LLM provider through a server-side AI service
- Zod for validation
- deterministic server-side business logic for orders, inventory, totals and invoices

Preferred AI implementation:

- LangChain, Groq, and Cohere
- tool calling

Do not create a separate Python/FastAPI backend.

Next.js is the full-stack application for this demo.

---



# 2. Core product principle

The LLM is NOT the business backend.

AI handles:

- language understanding
- intent detection
- knowledge retrieval
- deciding which approved tool to call
- natural language responses
- escalation decisions

Normal application code handles:

- authentication
- authorization
- product CRUD
- inventory
- cart
- order creation
- order totals
- invoice generation
- database writes
- ticket creation
- synchronization
- audit logs

The AI agent may call application tools.

The AI agent must NEVER directly write arbitrary SQL or directly mutate Supabase tables.

Architecture:

AI Agent
  -> validated tool
  -> application service
  -> Supabase

---



# 3. Primary demo journeys

Implement these five journeys completely.

## Journey A: Knowledge question

User:
"What is your exchange policy?"

Flow:
Chat UI
-> AI route
-> RAG search
-> relevant knowledge chunks
-> LLM
-> answer

The answer must be grounded in the stored knowledge base.

If no relevant knowledge is found, the AI must say it does not have enough information and offer human support.

## Journey B: Product inquiry

User:
"Do you have the red bridal suit in medium?"

Flow:
Chat UI
-> AI agent
-> get_product / check_inventory tool
-> Supabase product/inventory query
-> response

Do not use RAG as the source of truth for live inventory.

## Journey C: Order creation

User:
"I want to buy the red bridal suit in medium."

The AI should:

1. identify product
2. check inventory
3. collect required customer/order information
4. ask for missing information
5. create the order only after required information is complete
6. return order number
7. trigger invoice generation
8. create simulated synchronization events

Do not let the LLM calculate totals.

## Journey D: Order status

User:
"Where is my order?"

Flow:
Chat UI
-> AI agent
-> get_order_status tool
-> authenticated/current customer order lookup
-> response

For demo/admin testing, allow selecting a demo customer.

## Journey E: Automation proof

After an order is created, show:

Order Created ✓
Invoice Generated ✓
Inventory Updated ✓
Shopify Sync Simulated ✓
Excel Sync Simulated ✓
Customer Confirmation ✓

The UI must make this visually obvious.

---



# 4. Application surfaces

Build these routes/pages.

## Customer

- `/`
  - storefront
  - hero
  - featured products
  - AI support entry point
- `/products`
  - product listing
  - search
  - category filter
- `/products/[slug]`
  - product details
  - sizes
  - inventory status
  - add to cart
- `/cart`
  - cart items
  - quantity
  - totals
  - checkout CTA
- `/checkout`
  - customer information
  - shipping address
  - order summary
  - place order
- `/orders/[id]`
  - order details
  - status
  - invoice
  - automation timeline
- `/support`
  - AI support interface
  - conversation history
  - suggested questions



## Admin

- `/admin`
  - KPI cards
  - recent orders
  - recent conversations
  - automation activity
- `/admin/products`
  - product CRUD
  - inventory
- `/admin/orders`
  - order list
  - order detail
  - status updates
- `/admin/customers`
  - customer list
  - customer details
- `/admin/conversations`
  - conversation list
  - transcript
  - escalation state
- `/admin/knowledge`
  - knowledge documents
  - create/edit/delete
  - ingestion status
- `/admin/automation`
  - simulated Shopify events
  - simulated WhatsApp messages
  - Excel sync events
  - invoice events
  - event status

---



# 5. Database model

Use UUID primary keys.

Required tables:

## profiles

- id UUID PK references auth.users(id)
- full_name
- email
- role: customer | admin
- created_at
- updated_at



## products

- id UUID PK
- name
- slug unique
- description
- price numeric
- category
- image_url
- is_active
- created_at
- updated_at



## product_variants

- id UUID PK
- product_id FK
- size
- sku unique
- stock_quantity
- created_at
- updated_at



## customers

- id UUID PK
- profile_id nullable FK
- name
- email
- phone
- created_at
- updated_at



## orders

- id UUID PK
- order_number unique
- customer_id FK
- status
- subtotal
- shipping_fee
- discount
- total
- shipping_address JSONB
- source: storefront | ai_chat | simulated_whatsapp | admin
- created_at
- updated_at



## order_items

- id UUID PK
- order_id FK
- product_id FK
- variant_id nullable FK
- product_name_snapshot
- sku_snapshot
- unit_price
- quantity
- line_total

Snapshot product name, SKU and price at order time.

## invoices

- id UUID PK
- order_id unique FK
- invoice_number unique
- subtotal
- shipping_fee
- discount
- total
- status
- file_path nullable
- created_at



## conversations

- id UUID PK
- customer_id nullable FK
- channel: web | simulated_whatsapp
- status: active | escalated | closed
- created_at
- updated_at



## messages

- id UUID PK
- conversation_id FK
- role: user | assistant | tool | system
- content
- metadata JSONB
- created_at



## tickets

- id UUID PK
- conversation_id nullable FK
- customer_id nullable FK
- category
- priority
- status: open | in_progress | resolved
- subject
- description
- created_at
- updated_at



## knowledge_documents

- id UUID PK
- title
- content
- category
- source
- created_at
- updated_at



## knowledge_chunks

- id UUID PK
- document_id FK
- content
- chunk_index
- embedding vector()
- metadata JSONB
- created_at

The embedding dimension MUST match the selected embedding model.

Do not hard-code a dimension that does not match the configured embedding model.

## automation_events

- id UUID PK
- order_id nullable FK
- type
- provider
- status: pending | processing | completed | failed
- payload JSONB
- error_message nullable
- created_at
- completed_at nullable



## integration_records

- id UUID PK
- provider: shopify | whatsapp | excel
- external_id
- entity_type
- entity_id
- status
- metadata JSONB
- created_at
- updated_at

---



# 6. Database rules

Enable:

- uuid generation as needed
- pgvector/vector extension
- Row Level Security

Use foreign keys and appropriate indexes.

Indexes should include:

- products.slug
- products.category
- product_variants.product_id
- product_variants.sku
- orders.order_number
- orders.customer_id
- orders.status
- order_items.order_id
- conversations.customer_id
- messages.conversation_id
- automation_events.order_id
- knowledge_chunks.document_id

For vector search use HNSW when supported.

Use cosine distance for normalized embeddings unless the selected embedding provider requires another metric.

Create a Postgres function such as:

`match_knowledge_chunks(query_embedding, match_threshold, match_count)`

It should:

- compare embeddings using cosine distance
- filter by threshold
- return chunk content, metadata and similarity
- limit results

RAG retrieval must happen through this controlled function.

---



# 7. Supabase Auth

Use Supabase Auth.

Roles:

- customer
- admin

Never trust a client-supplied role.

Use profile/role data and server-side authorization.

Protect:

- `/admin/*`
- admin mutations
- customer order data

Customers must only access their own orders/conversations.

Admins can access demo data.

Use Supabase SSR patterns with:

- browser client
- server client
- middleware/proxy/session refresh as required by the current Supabase Next.js guidance

Never expose a service-role/secret key to the browser.

---



# 8. Supabase Storage

Create a bucket:

`invoices`

Use private storage if invoice documents contain customer/order information.

Generate signed URLs for authorized invoice access.

Product images may use:

- a public product-images bucket, or
- seeded remote image URLs for the demo

Do not put invoice PDFs into a public bucket.

---



# 9. RAG pipeline

Implement:

Document
-> normalize content
-> chunk
-> generate embedding
-> insert knowledge_chunks
-> vector search
-> retrieve top K
-> pass grounded context to AI

Keep chunking simple for the MVP:

- approximately 500 to 800 tokens per chunk
- small overlap
- preserve document title/category metadata

Do not over-engineer chunking.

Knowledge seed documents should include:

- Exchange Policy
- Return Policy
- Shipping Policy
- Payment Methods
- Size Guide
- Delivery Information
- About the Brand
- Product Care

Create a server-side ingestion function/route.

Do not generate embeddings in the browser.

Cohere → pgvector → LangChain → Groq

---



# 10. AI agent tools

- LangChain orchestrates the agent and tool calling, with Groq as the LLM

Implement only these tools:

## searchKnowledgeBase

Input:

- query string

Output:

- relevant chunks
- similarity
- source/title



## getProduct

Input:

- product name or product ID

Output:

- product details
- variants
- stock



## checkInventory

Input:

- product ID
- variant/size

Output:

- stock quantity
- availability



## getCustomerOrders

Input:

- customer ID

Output:

- recent orders

Never allow arbitrary customer IDs from an unauthenticated client.

## getOrderStatus

Input:

- order number

Output:

- status
- items
- total
- timestamps

Validate that the current user is allowed to access the order.

## createOrder

Input:

- customer information
- items
- shipping address
- source

Output:

- order number
- total
- status

The tool must call normal order service logic.

## createTicket

Input:

- category
- priority
- subject
- description

Output:

- ticket number
- status

Use this for human escalation.

## getBusinessHours

Return demo business hours.

---



# 11. AI behavior

System prompt must enforce:

1. You are a customer support assistant for the demo store.
2. Never invent product availability, price, order status, policy or shipping information.
3. Use tools for live business data.
4. Use RAG for policies and company knowledge.
5. Never claim an order was created until the order tool succeeds.
6. Never claim an invoice was generated until invoice generation succeeds.
7. Ask for missing required information before creating an order.
8. Never calculate final business totals independently if the backend can calculate them.
9. Escalate refunds, serious complaints, uncertain cases and unsupported requests.
10. Keep responses concise and professional.
11. Clearly state when human support is required.

---



# 12. Order service

Centralize order creation in one service.

Order creation:

1. validate customer
2. validate products
3. validate variants
4. validate inventory
5. calculate subtotal
6. calculate shipping
7. calculate discount if applicable
8. calculate final total
9. create order
10. create order items
11. decrement inventory transactionally
12. create invoice record
13. generate invoice
14. create automation events
15. return order result

Do not duplicate this logic in:

- checkout
- AI tool
- admin
- simulated WhatsApp

All must call the same order service.

---



# 13. Invoice generation

Generate invoices deterministically.

Invoice contents:

- brand name
- invoice number
- order number
- customer
- shipping address
- products
- quantities
- unit prices
- subtotal
- shipping
- discount
- total
- date

Generate a PDF server-side.

Store it in Supabase Storage.

Save the storage path in the invoice row.

Do not use the LLM to generate invoice totals.

---



# 14. Simulated Shopify integration

There is NO real Shopify dependency.

Create an adapter:

`ShopifyAdapter`

Methods:

- syncProduct
- syncInventory
- syncOrder

Implementation:

- create `automation_events`
- create/update `integration_records`
- simulate successful synchronization
- expose status in admin dashboard

The UI should show:

`Shopify Sync: Simulated / Connected`

Make it obvious that this is a demo integration.

Do not pretend a real Shopify account is connected.

---



# 15. Simulated WhatsApp integration

There is NO real WhatsApp dependency.

Create:

`WhatsAppAdapter`

Methods:

- sendMessage
- receiveMessage
- sendInvoice

The admin dashboard should include a "WhatsApp Simulator" where the developer/user can:

- choose demo customer
- type a customer message
- send it
- see the AI response
- see tool calls/actions
- see created order/ticket/invoice

The simulator must use the same conversation and AI services as the web chat.

Do not build a second AI implementation for the simulator.

---



# 16. Simulated Excel synchronization

There is NO real Excel dependency.

Create:

`ExcelAdapter`

For the demo:

- create automation event
- generate a CSV/XLSX export if practical
- expose "Excel Updated" status in automation timeline

The database remains the source of truth.

---



# 17. API / route design

Use clean route handlers.

Required routes:

POST `/api/ai/chat`
POST `/api/ai/knowledge/search`

POST `/api/orders`
GET `/api/orders`
GET `/api/orders/[id]`

POST `/api/invoices/[orderId]`
GET `/api/invoices/[id]`

GET `/api/products`
GET `/api/products/[id]`

POST `/api/knowledge/documents`
PATCH `/api/knowledge/documents/[id]`
DELETE `/api/knowledge/documents/[id]`

POST `/api/tickets`
GET `/api/tickets`

POST `/api/simulators/whatsapp`
POST `/api/simulators/shopify`
POST `/api/simulators/excel`

GET `/api/automation/events`

Use Zod schemas for all request validation.

Do not put complex business logic inside route handlers.

Route:
-> validation
-> service
-> response

---



# 18. Project structure

Prefer:

app/
  page.tsx
  products/
  cart/
  checkout/
  orders/
  support/
  admin/
  api/

components/
  ui/
  storefront/
  support/
  admin/
  orders/

lib/
  supabase/
    client.ts
    server.ts
  ai/
    agent.ts
    prompts.ts
    tools.ts
    rag.ts
  services/
    order-service.ts
    invoice-service.ts
    product-service.ts
    customer-service.ts
    conversation-service.ts
    ticket-service.ts
    knowledge-service.ts
  integrations/
    shopify.ts
    whatsapp.ts
    excel.ts
  validation/
  utils/

supabase/
  migrations/
  seed.sql

scripts/
  seed-knowledge.ts
  generate-embeddings.ts

types/
  database.ts
  domain.ts

---



# 19. UI/UX requirements

The application should look like a real premium e-commerce demo, not an admin template.

Use:

- clean typography
- responsive layout
- polished cards
- useful empty states
- loading states
- error states
- toast notifications
- skeletons where appropriate

Customer storefront:

- premium fashion/bridal aesthetic
- product imagery
- clear pricing
- clear availability
- clean checkout

AI support:

- floating support button
- polished chat panel/page
- suggested prompts
- streaming response if practical
- tool/action indicators
- escalation indicator

Admin:

- clear KPI cards
- tables
- filters
- status badges
- automation timeline

Do not over-design animations.

---



# 20. Demo seed data

Seed at least:

- 8 products
- multiple sizes/variants
- realistic inventory
- 3 demo customers
- several orders
- several knowledge documents
- one escalated ticket
- automation events

Use a fictional bridal brand.

Do not use real client/company credentials or private information.

---



# 21. Demo script

The finished application must support this exact demonstration:

1. Open storefront.
2. Open AI support.
3. Ask:
  "What is your exchange policy?"
4. Show RAG-backed answer.
5. Ask:
  "Is the red bridal suit available in medium?"
6. Show live inventory tool call.
7. Ask:
  "I want to order it."
8. AI collects required information.
9. Create order.
10. Open order page.
11. Show order number and status.
12. Open invoice.
13. Show generated invoice.
14. Open automation timeline.
15. Show:
  - Order Created
    - Inventory Updated
    - Invoice Generated
    - Shopify Sync Simulated
    - Excel Sync Simulated
16. Open admin conversations.
17. Open WhatsApp Simulator.
18. Send another customer message.
19. Show the same AI agent responding.
20. Ask a refund/complex question.
21. Show ticket escalation.

The demo must communicate:

"One customer conversation can become a real business action."

---



# 22. Development rules for the coding agent

Before coding:

1. Inspect the existing repository.
2. Preserve existing working configuration unless necessary.
3. Determine whether Next.js and Supabase are already configured.
4. Do not ask unnecessary clarification questions.
5. Make reasonable implementation decisions.
6. Build the complete MVP end-to-end.

While coding:

- TypeScript strict mode
- no `any` unless unavoidable and documented
- server-side secrets only
- validate all external input
- handle Supabase errors
- handle loading/error states
- avoid duplicate business logic
- keep components modular
- use reusable UI components
- keep AI tools narrowly scoped
- never expose service-role secrets
- never commit `.env.local`

Database:

- use migrations
- use RLS
- add indexes
- use foreign keys
- use transactions/RPC where atomicity is required
- seed deterministic demo data

AI:

- server-side only
- no direct DB writes
- tools call services
- tools validate inputs
- RAG retrieval is explicit
- no hallucinated business facts

---



# 23. Completion requirements

Do not consider the project complete until:

- `npm install` succeeds
- `npm run dev` starts
- production build succeeds
- TypeScript passes
- lint passes
- Supabase schema can be recreated from migrations
- seed data works
- authentication works
- storefront works
- checkout creates real database orders
- inventory decrements correctly
- invoice is generated
- AI chat works
- RAG retrieval works
- product tool works
- order tool works
- ticket escalation works
- WhatsApp simulator works
- Shopify simulator works
- Excel simulation works
- admin dashboard works
- no secret key is exposed client-side
- LangChain agent works
- Groq LLM works
- Cohere embeddings work
- pgvector similarity search works

If an external API is unavailable, use the adapter simulator and continue.

---



# 24. Final acceptance test

Run through:

A. FAQ -> RAG -> answer
B. Product question -> inventory tool -> answer
C. AI order -> order service -> database
D. Order -> invoice
E. Order -> simulated Shopify
F. Order -> simulated Excel
G. WhatsApp simulator -> same AI agent
H. Complex question -> ticket
I. Admin dashboard -> observe all events

The final application should feel like a small real e-commerce business platform with an AI employee built into it, not like a ChatGPT clone.

