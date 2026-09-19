# Isha Vastram — Saree E-Commerce Platform

Build a stunning, full-stack e-commerce platform for **Isha Vastram Cotton Sarees** with a premium customer-facing storefront and a powerful admin dashboard for stock, order, and customer management.

## Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 14 (App Router) |
| **Language** | TypeScript |
| **Database** | PostgreSQL (via Supabase) |
| **ORM / Client** | Supabase JS Client (`@supabase/supabase-js`) |
| **Auth** | Simple password-based admin login (env-based secret, JWT cookie) |
| **Styling** | Vanilla CSS with CSS Variables design system |
| **Image Storage** | Supabase Storage (free tier — 1GB, `products` bucket) |
| **WhatsApp** | WhatsApp Business API URL (`wa.me`) for order notifications |
| **Fonts** | Google Fonts — Playfair Display (headings) + Inter (body) |

---

## User Review Required

> [!IMPORTANT]
> **WhatsApp Integration**: Orders will trigger a WhatsApp message to the admin's number with all customer details (name, phone, address, order items, total). The admin's WhatsApp number will be configured via environment variable. Confirm this approach works for you.

> [!IMPORTANT]
> **Database — Supabase (PostgreSQL)**: We'll use [Supabase](https://supabase.com) (free tier) which gives you a fully managed PostgreSQL database, file storage, and a REST API out of the box. You'll need to:
> 1. Create a free Supabase account at [supabase.com](https://supabase.com)
> 2. Create a new project → copy the **Project URL** and **anon key** from Settings → API
> 3. Provide these values for `.env.local`

> [!IMPORTANT]  
> **Image Storage — Supabase Storage**: Product images will be uploaded directly to a Supabase Storage bucket called `products`. This gives us CDN-backed URLs, no local file management, and seamless integration with the database. Free tier includes 1GB storage.

---

## Open Questions

1. **Admin WhatsApp Number** — What phone number should receive order notifications via WhatsApp?
2. **Currency** — Should prices be in ₹ (INR)? Assuming yes.
3. **Saree Categories** — What categories/tags should we pre-populate? (e.g., Cotton, Silk, Banarasi, Paithani, Chanderi, etc.)
4. **Color Palette Preference** — Based on your logo, I'll use a **Maroon + Gold + Cream** palette. Any other preferences?
5. **Shipping** — Should there be a flat shipping fee, or free shipping above a certain amount?

---

## Proposed Changes

### Phase 1: Project Foundation & Design System

#### [NEW] Next.js Project Setup
- Initialize Next.js 14 with TypeScript in `/Users/varadadhav/TerraVance/isha-cloth/`
- Configure project structure with App Router
- Install `@supabase/supabase-js` and set up Supabase client
- Run SQL migrations in Supabase Dashboard (SQL Editor) to create tables
- Create Supabase Storage bucket `products` for saree images
- Environment variables configuration (`.env.local`)

#### Environment Variables (`.env.local`)
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Admin Auth
ADMIN_PASSWORD=your-secure-admin-password
JWT_SECRET=your-jwt-secret

# WhatsApp
ADMIN_WHATSAPP_NUMBER=919876543210
```

#### Project Structure
```
isha-cloth/
├── public/
│   ├── images/
│   │   ├── logo.png              (Isha Vastram logo)
│   │   └── banners/              (Hero section banners)
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql (Full SQL schema for all tables)
├── src/
│   ├── app/
│   │   ├── layout.tsx            (Root layout with fonts, metadata)
│   │   ├── page.tsx              (Homepage — hero, featured, categories)
│   │   ├── globals.css           (Design system + global styles)
│   │   ├── collection/
│   │   │   └── page.tsx          (Browse all sarees with filters)
│   │   ├── saree/[id]/
│   │   │   └── page.tsx          (Individual saree detail page)
│   │   ├── cart/
│   │   │   └── page.tsx          (Shopping cart)
│   │   ├── checkout/
│   │   │   └── page.tsx          (Checkout form + WhatsApp order)
│   │   ├── about/
│   │   │   └── page.tsx          (About Isha Vastram)
│   │   ├── contact/
│   │   │   └── page.tsx          (Contact page)
│   │   ├── admin/
│   │   │   ├── login/
│   │   │   │   └── page.tsx      (Admin login page)
│   │   │   ├── layout.tsx        (Admin layout with sidebar nav)
│   │   │   ├── page.tsx          (Admin dashboard — overview stats)
│   │   │   ├── products/
│   │   │   │   ├── page.tsx      (Manage all sarees list)
│   │   │   │   └── new/
│   │   │   │       └── page.tsx  (Add new saree form)
│   │   │   ├── orders/
│   │   │   │   └── page.tsx      (All orders management)
│   │   │   ├── customers/
│   │   │   │   └── page.tsx      (Customer list + messaging)
│   │   │   └── finance/
│   │   │       └── page.tsx      (Revenue, stock value, analytics)
│   │   └── api/
│   │       ├── auth/
│   │       │   └── login/route.ts
│   │       ├── products/
│   │       │   ├── route.ts      (GET all, POST new)
│   │       │   └── [id]/route.ts (GET one, PUT update, DELETE)
│   │       ├── orders/
│   │       │   ├── route.ts      (GET all, POST new)
│   │       │   └── [id]/route.ts (GET one, PUT update status)
│   │       ├── customers/
│   │       │   └── route.ts      (GET all customers)
│   │       ├── upload/
│   │       │   └── route.ts      (Image upload to Supabase Storage)
│   │       └── whatsapp/
│   │           └── route.ts      (Send WhatsApp message)
│   ├── types/
│   │   └── database.ts           (TypeScript types matching SQL schema)
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts         (Browser Supabase client — uses anon key)
│   │   │   └── server.ts         (Server Supabase client — uses service role key)
│   │   ├── auth.ts               (Admin auth middleware — JWT verify)
│   │   └── whatsapp.ts           (WhatsApp message builder)
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Navbar.tsx        (Customer-facing navbar with logo, cart icon)
│   │   │   ├── Footer.tsx        (Footer with links, social, WhatsApp)
│   │   │   └── AdminSidebar.tsx  (Admin dashboard sidebar)
│   │   ├── home/
│   │   │   ├── HeroSection.tsx   (Full-screen hero with parallax saree imagery)
│   │   │   ├── FeaturedSarees.tsx(Carousel of featured products)
│   │   │   ├── Categories.tsx    (Category cards with hover effects)
│   │   │   ├── Testimonials.tsx  (Customer testimonials)
│   │   │   └── WhyChooseUs.tsx   (USPs — pure cotton, handloom, etc.)
│   │   ├── product/
│   │   │   ├── SareeCard.tsx     (Product card with hover zoom + quick view)
│   │   │   ├── SareeGrid.tsx     (Responsive grid layout)
│   │   │   ├── FilterSidebar.tsx (Price, category, color filters)
│   │   │   └── ImageGallery.tsx  (Product detail image gallery with zoom)
│   │   ├── cart/
│   │   │   ├── CartItem.tsx      (Individual cart item row)
│   │   │   └── CartSummary.tsx   (Cart totals, proceed to checkout)
│   │   ├── admin/
│   │   │   ├── StatsCard.tsx     (Dashboard stat widget)
│   │   │   ├── OrderTable.tsx    (Orders data table)
│   │   │   ├── ProductForm.tsx   (Add/edit saree form with image upload)
│   │   │   ├── CustomerTable.tsx (Customers list)
│   │   │   └── RevenueChart.tsx  (Finance charts)
│   │   └── ui/
│   │       ├── Button.tsx
│   │       ├── Input.tsx
│   │       ├── Modal.tsx
│   │       ├── Toast.tsx
│   │       ├── Badge.tsx
│   │       └── Loader.tsx
│   └── context/
│       └── CartContext.tsx        (Cart state management via React Context)
└── .env.local                     (Supabase URL, keys, admin password, WhatsApp)
```

---

### Phase 2: Customer-Facing Storefront (The "Wow" Factor)

The storefront is the centrepiece — designed to feel like walking into a premium saree boutique.

#### Design Language
- **Colors**: Maroon (`#800020`), Gold (`#D4A537`), Cream (`#FFF8F0`), Deep Burgundy (`#4A0E1B`), Charcoal (`#2D2D2D`)
- **Typography**: Playfair Display for headings (elegant serif), Inter for body text
- **Effects**: Glassmorphism cards, parallax scrolling, silk-like CSS animations, gold shimmer effects

#### [NEW] Homepage (`page.tsx`)
1. **Hero Section** — Full-viewport parallax hero with a beautiful saree drape animation, tagline "शुद्ध कापसाच्या साड्यांचे विशेष घर", and a CTA "Explore Collection"
2. **Featured Sarees** — Horizontal scrolling carousel with 3D card tilt effects on hover
3. **Category Showcase** — Elegant grid cards (Cotton, Silk, Festive, Daily Wear) with overlay hover animations
4. **Why Choose Us** — Animated icons section (Pure Cotton, Handloom, Affordable, Fast Delivery)
5. **Testimonials** — Auto-scrolling customer review cards with star ratings
6. **Instagram/WhatsApp CTA** — Floating WhatsApp button + social proof section

#### [NEW] Collection Page (`collection/page.tsx`)
- Responsive saree grid (2-col mobile, 3-col tablet, 4-col desktop)
- Filter sidebar: Category, Price Range (slider), Color, Availability
- Sort: Price Low→High, High→Low, Newest, Popular
- Infinite scroll or "Load More" pagination
- Skeleton loading states

#### [NEW] Saree Detail Page (`saree/[id]/page.tsx`)
- Multi-image gallery with thumbnail strip + zoom on hover
- Price display with optional strikethrough for discount
- Size/variant selection
- "Add to Cart" with satisfying micro-animation
- Related sarees carousel below
- WhatsApp inquiry button ("Ask about this saree")

#### [NEW] Cart Page (`cart/page.tsx`)
- Cart items with quantity adjustment (+ / −)
- Remove item with slide-out animation
- Order summary sidebar with subtotal, shipping, total
- "Proceed to Checkout" button

#### [NEW] Checkout Page (`checkout/page.tsx`)
- Customer information form (Name, Phone, Email, Address, Pincode, City)
- Order summary review
- "Place Order" → saves order to DB → sends WhatsApp message to admin with full order details → sends confirmation message link to customer's WhatsApp
- Order confirmation page with order ID

---

### Phase 3: Admin Dashboard (`/admin`)

A clean, powerful dashboard with dark theme for managing the entire business.

#### [NEW] Admin Login (`admin/login/page.tsx`)
- Simple password field with "Enter Admin Password"
- Validates against `ADMIN_PASSWORD` env variable
- Sets a JWT cookie for session management
- Maroon-themed login card with the Isha Vastram logo

#### [NEW] Admin Dashboard Home (`admin/page.tsx`)
- **Stats Cards**: Total Revenue, Orders Today, Total Products, Low Stock Alerts
- **Recent Orders** table (last 10)
- **Revenue Chart** (last 7 days / 30 days toggle)
- **Quick Actions**: Add New Saree, View All Orders

#### [NEW] Product Management (`admin/products/`)
- **Product List**: Table with image thumbnail, name, price, stock, status (active/draft)
- **Add New Saree** (`admin/products/new/`):
  - Image upload zone (drag & drop + click to browse, multiple images)
  - Fields: Name, Description (rich text), Price, Compare Price, Stock Quantity
  - Tags: Multi-select chips (Cotton, Silk, Festive, Bridal, Daily Wear, etc.)
  - Category dropdown
  - Color selector
  - Status: Active / Draft
  - Preview card showing how the saree will appear on the storefront
- **Edit Saree**: Same form, pre-populated
- **Delete Saree**: Confirmation modal

#### [NEW] Order Management (`admin/orders/`)
- **Orders Table**: Order ID, Customer Name, Items, Total, Status, Date
- **Status Management**: Dropdown to change status (Received → Confirmed → Shipped → Delivered → Cancelled)
- **Order Detail**: Click to expand — full order info, customer details, items
- **Send WhatsApp Update**: Button to send order status update to customer via WhatsApp
- **Filters**: By status, date range

#### [NEW] Customer Management (`admin/customers/`)
- **Customer List**: Name, Phone, Email, Total Orders, Total Spent
- **Customer Detail**: Order history, contact info
- **Send Message**: 
  - Direct WhatsApp message button (opens `wa.me/{phone}?text={message}`)
  - Pre-built message templates (Order confirmation, Shipping update, New collection alert)
- **Export**: Download customer list as CSV

#### [NEW] Finance Dashboard (`admin/finance/`)
- **Revenue Overview**: Total revenue, today's revenue, this month, this week
- **Revenue Chart**: Line chart (daily/weekly/monthly toggle)
- **Sold Items Log**: Table of all sold items with date, price, customer
- **Stock Value**: Total inventory value (sum of all products × stock × price)
- **Remaining Stock**: Products sorted by stock level, low stock highlighted in red
- **Order Status Breakdown**: Pie chart (Received / Confirmed / Shipped / Delivered / Cancelled)

---

### Phase 4: Database Schema (PostgreSQL via Supabase)

All tables are created via a single SQL migration file. Run in Supabase Dashboard → SQL Editor.

#### [NEW] `supabase/migrations/001_initial_schema.sql`

##### Products Table
```sql
CREATE TABLE products (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  description   TEXT,
  price         DECIMAL(10, 2) NOT NULL,
  compare_price DECIMAL(10, 2),          -- Original price for discount display
  images        TEXT[] DEFAULT '{}',      -- Array of Supabase Storage URLs
  category      TEXT NOT NULL,            -- Cotton, Silk, etc.
  tags          TEXT[] DEFAULT '{}',      -- Festive, Bridal, Daily Wear
  color         TEXT,
  stock         INTEGER NOT NULL DEFAULT 0,
  sold          INTEGER NOT NULL DEFAULT 0,
  status        TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'draft')),
  featured      BOOLEAN NOT NULL DEFAULT false,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for common queries
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_featured ON products(featured) WHERE featured = true;
```

##### Customers Table
```sql
CREATE TABLE customers (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL,
  phone           TEXT NOT NULL UNIQUE,
  email           TEXT,
  address         TEXT,
  city            TEXT,
  pincode         TEXT,
  total_orders    INTEGER NOT NULL DEFAULT 0,
  total_spent     DECIMAL(10, 2) NOT NULL DEFAULT 0,
  last_order_date TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_customers_phone ON customers(phone);
```

##### Orders Table
```sql
CREATE TABLE orders (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id       TEXT NOT NULL UNIQUE,     -- Human-readable (e.g., IV-20260917-001)
  customer_id    UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  subtotal       DECIMAL(10, 2) NOT NULL,
  shipping       DECIMAL(10, 2) NOT NULL DEFAULT 0,
  total          DECIMAL(10, 2) NOT NULL,
  status         TEXT NOT NULL DEFAULT 'received'
                   CHECK (status IN ('received','confirmed','shipped','delivered','cancelled')),
  whatsapp_sent  BOOLEAN NOT NULL DEFAULT false,
  notes          TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_orders_created ON orders(created_at DESC);
```

##### Order Items Table (normalized — replaces embedded array)
```sql
CREATE TABLE order_items (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id    UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id  UUID NOT NULL REFERENCES products(id) ON DELETE SET NULL,
  name        TEXT NOT NULL,              -- Snapshot of product name at time of order
  price       DECIMAL(10, 2) NOT NULL,    -- Snapshot of price at time of order
  quantity    INTEGER NOT NULL DEFAULT 1,
  image       TEXT                        -- Snapshot of product image URL
);

CREATE INDEX idx_order_items_order ON order_items(order_id);
```

##### Auto-update `updated_at` trigger
```sql
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_products_modtime
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_orders_modtime
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_modified_column();
```

##### Supabase Storage Bucket
```sql
-- Run in Supabase Dashboard → Storage → Create new bucket
-- Bucket name: "products"
-- Public: true (so product images are publicly accessible)
```

#### [NEW] `src/types/database.ts` — TypeScript Types
```typescript
export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  compare_price: number | null;
  images: string[];
  category: string;
  tags: string[];
  color: string | null;
  stock: number;
  sold: number;
  status: 'active' | 'draft';
  featured: boolean;
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  address: string | null;
  city: string | null;
  pincode: string | null;
  total_orders: number;
  total_spent: number;
  last_order_date: string | null;
  created_at: string;
}

export interface Order {
  id: string;
  order_id: string;
  customer_id: string;
  subtotal: number;
  shipping: number;
  total: number;
  status: 'received' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  whatsapp_sent: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
  // Joined fields
  customer?: Customer;
  items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  name: string;
  price: number;
  quantity: number;
  image: string | null;
}
```

---

### Phase 5: API Routes

All API routes use the **Supabase server client** (service role key) for database operations.

| Method | Endpoint | Description | Supabase Query |
|---|---|---|---|
| `POST` | `/api/auth/login` | Admin login, returns JWT cookie | N/A (env check) |
| `GET` | `/api/products` | List products (with filters) | `supabase.from('products').select()` |
| `POST` | `/api/products` | Create new product (admin) | `supabase.from('products').insert()` |
| `GET` | `/api/products/[id]` | Get single product | `supabase.from('products').select().eq('id', id)` |
| `PUT` | `/api/products/[id]` | Update product (admin) | `supabase.from('products').update().eq('id', id)` |
| `DELETE` | `/api/products/[id]` | Delete product (admin) | `supabase.from('products').delete().eq('id', id)` |
| `POST` | `/api/upload` | Upload image to Supabase Storage | `supabase.storage.from('products').upload()` |
| `GET` | `/api/orders` | List all orders (admin) | `supabase.from('orders').select('*, customer:customers(*), items:order_items(*)')` |
| `POST` | `/api/orders` | Create new order (checkout) | Insert into `customers` + `orders` + `order_items` (transaction) |
| `GET` | `/api/orders/[id]` | Get single order | Joined select with customer + items |
| `PUT` | `/api/orders/[id]` | Update order status (admin) | `supabase.from('orders').update()` |
| `GET` | `/api/customers` | List all customers (admin) | `supabase.from('customers').select()` |
| `POST` | `/api/whatsapp` | Build WhatsApp redirect URL | N/A (URL builder) |

---

### Phase 6: WhatsApp Integration

When a customer places an order:

1. **To Admin**: Opens WhatsApp Business API link with message:
   ```
   🆕 New Order - Isha Vastram!
   
   📦 Order ID: IV-20260917-001
   👤 Customer: Priya Sharma
   📱 Phone: +91 98765 43210
   📍 Address: 123, MG Road, Pune - 411001
   
   🛒 Items:
   1. Banarasi Silk Saree × 1 — ₹2,499
   2. Cotton Handloom Saree × 2 — ₹1,598
   
   💰 Total: ₹4,097
   
   📝 Status: Received
   ```

2. **To Customer**: Redirects to WhatsApp with pre-filled message confirming their order.

3. **From Admin Dashboard**: Admin can click "Send WhatsApp" on any order or customer to open WhatsApp with templated messages.

---

## Animations & UI Highlights

| Feature | Animation |
|---|---|
| Hero Section | Parallax scroll + floating saree drape with silk shimmer |
| Saree Cards | 3D tilt on hover + golden border glow + zoom image |
| Add to Cart | Button ripple + cart icon bounce + flying product animation |
| Page Transitions | Smooth fade-in with staggered content reveal |
| Navbar | Shrink on scroll + glassmorphism blur backdrop |
| Loading States | Skeleton shimmer in brand gold color |
| Admin Charts | Animated chart draw-in on mount |
| Toast Notifications | Slide-in from right with auto-dismiss |
| Floating WhatsApp | Pulse animation + bounce on first visit |
| Category Cards | Overlay gradient slide-up with text reveal |

---

## Verification Plan

### Automated Tests
```bash
# Build check
npm run build

# TypeScript type checking  
npx tsc --noEmit

# Lint check
npm run lint
```

### Manual Verification
- **Customer Flow**: Browse → Filter → View Saree → Add to Cart → Checkout → WhatsApp message sent
- **Admin Flow**: Login → Dashboard stats → Add new saree → Manage orders → Update status → Send WhatsApp → View finance
- **Responsive**: Test on mobile (375px), tablet (768px), and desktop (1440px)
- **Performance**: Lighthouse score check for performance, accessibility, SEO

---

## Build Order (Execution Sequence)

1. **Initialize Next.js project** with TypeScript + set up folder structure
2. **Design system** — `globals.css` with full CSS variable tokens
3. **Supabase setup** — client/server helpers + SQL migration + Storage bucket
4. **TypeScript types** — `database.ts` matching the SQL schema
5. **API routes** — all CRUD operations using Supabase client
6. **UI components** — reusable Button, Input, Modal, Toast, etc.
7. **Layout components** — Navbar, Footer, AdminSidebar
8. **Homepage** with hero, featured, categories, testimonials
9. **Collection page** with filters and saree grid
10. **Saree detail page** with gallery and add to cart
11. **Cart context** + Cart page
12. **Checkout page** with WhatsApp integration
13. **Admin login** + auth middleware
14. **Admin dashboard** — stats, charts, recent orders
15. **Admin products** — list, add/edit form with Supabase Storage image upload
16. **Admin orders** — table, status management, WhatsApp
17. **Admin customers** — list, messaging
18. **Admin finance** — revenue charts, stock overview
19. **Polish** — animations, responsive tweaks, loading states

---

## Supabase Setup Checklist

Steps to complete in the Supabase Dashboard before running the app:

- [ ] Create Supabase project at [supabase.com](https://supabase.com)
- [ ] Copy **Project URL** and **anon key** from Settings → API
- [ ] Copy **service_role key** from Settings → API (keep secret!)
- [ ] Run `001_initial_schema.sql` in SQL Editor
- [ ] Create Storage bucket named `products` (set to **Public**)
- [ ] Add these values to `.env.local`
