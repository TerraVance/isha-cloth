-- ============================================================
-- Isha Vastram — Complete Database Schema
-- Run this in: Supabase Dashboard → SQL Editor → Run
-- ============================================================

-- ============================================================
-- TABLE 1: products
-- ============================================================
CREATE TABLE products (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  description   TEXT,
  price         DECIMAL(10, 2) NOT NULL,
  compare_price DECIMAL(10, 2),                   -- Original price for discount display
  images        TEXT[] DEFAULT '{}',               -- Array of Supabase Storage URLs
  category      TEXT NOT NULL,                     -- Cotton, Silk, Banarasi, Paithani, etc.
  tags          TEXT[] DEFAULT '{}',               -- Festive, Bridal, Daily Wear, etc.
  color         TEXT,
  stock         INTEGER NOT NULL DEFAULT 0,
  sold          INTEGER NOT NULL DEFAULT 0,        -- Total units sold
  share_count   INTEGER NOT NULL DEFAULT 0,        -- 🔄 Viral Loop: tracks WhatsApp shares
  status        TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'draft')),
  featured      BOOLEAN NOT NULL DEFAULT false,    -- Show on homepage carousel
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_featured ON products(featured) WHERE featured = true;
CREATE INDEX idx_products_stock ON products(stock);

-- ============================================================
-- TABLE 2: customers
-- ============================================================
CREATE TABLE customers (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name              TEXT NOT NULL,
  phone             TEXT NOT NULL UNIQUE,
  email             TEXT,
  address           TEXT,
  city              TEXT,
  pincode           TEXT,
  total_orders      INTEGER NOT NULL DEFAULT 0,
  total_spent       DECIMAL(10, 2) NOT NULL DEFAULT 0,
  last_order_date   TIMESTAMPTZ,
  last_contacted_at TIMESTAMPTZ,                   -- 🔄 Re-engagement Loop: track broadcast date
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_customers_phone ON customers(phone);
CREATE INDEX idx_customers_city ON customers(city);
CREATE INDEX idx_customers_total_spent ON customers(total_spent DESC);

-- ============================================================
-- TABLE 3: coupons (🔄 Post-Purchase Loop)
-- ============================================================
CREATE TABLE coupons (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code             TEXT NOT NULL UNIQUE,           -- e.g., ISHA10, WELCOME20
  discount_percent INTEGER NOT NULL,               -- 10 = 10% off
  max_uses         INTEGER DEFAULT NULL,           -- NULL = unlimited uses
  times_used       INTEGER NOT NULL DEFAULT 0,
  min_order        DECIMAL(10,2) NOT NULL DEFAULT 0, -- Minimum cart amount to apply
  is_active        BOOLEAN NOT NULL DEFAULT true,
  expires_at       TIMESTAMPTZ,                    -- NULL = never expires
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Seed the default post-purchase coupon
INSERT INTO coupons (code, discount_percent, max_uses, min_order, is_active)
VALUES ('ISHA10', 10, NULL, 500, true);

-- ============================================================
-- TABLE 4: orders
-- ============================================================
CREATE TABLE orders (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id        TEXT NOT NULL UNIQUE,            -- Human-readable: IV-20260918-001
  customer_id     UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  coupon_id       UUID REFERENCES coupons(id) ON DELETE SET NULL, -- 🔄 Post-Purchase Loop
  subtotal        DECIMAL(10, 2) NOT NULL,
  discount_amount DECIMAL(10, 2) NOT NULL DEFAULT 0, -- 🔄 Amount saved via coupon
  shipping        DECIMAL(10, 2) NOT NULL DEFAULT 0,
  total           DECIMAL(10, 2) NOT NULL,
  status          TEXT NOT NULL DEFAULT 'received'
                    CHECK (status IN ('received','confirmed','shipped','delivered','cancelled')),
  whatsapp_sent   BOOLEAN NOT NULL DEFAULT false,
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_orders_created ON orders(created_at DESC);
CREATE INDEX idx_orders_coupon ON orders(coupon_id) WHERE coupon_id IS NOT NULL;

-- ============================================================
-- TABLE 5: order_items
-- ============================================================
CREATE TABLE order_items (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id    UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id  UUID REFERENCES products(id) ON DELETE SET NULL,
  name        TEXT NOT NULL,                       -- Snapshot at time of order
  price       DECIMAL(10, 2) NOT NULL,             -- Snapshot at time of order
  quantity    INTEGER NOT NULL DEFAULT 1,
  image       TEXT                                 -- Snapshot of primary image URL
);

CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_items_product ON order_items(product_id);

-- ============================================================
-- TABLE 6: testimonials (🔄 Social Proof Loop)
-- ============================================================
CREATE TABLE testimonials (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name TEXT NOT NULL,
  customer_phone TEXT,
  photo_url     TEXT,                              -- Supabase Storage URL of customer photo
  review_text   TEXT,
  rating        INTEGER CHECK (rating >= 1 AND rating <= 5),
  product_id    UUID REFERENCES products(id) ON DELETE SET NULL,
  is_approved   BOOLEAN NOT NULL DEFAULT false,    -- Admin must approve before showing
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_testimonials_approved ON testimonials(is_approved) WHERE is_approved = true;

-- ============================================================
-- TABLE 7: restock_requests (🔄 Restock Notification Loop)
-- ============================================================
CREATE TABLE restock_requests (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id  UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  phone       TEXT NOT NULL,
  notified    BOOLEAN NOT NULL DEFAULT false,      -- Set to true after WhatsApp sent
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(product_id, phone)                        -- One request per product per phone
);

CREATE INDEX idx_restock_product ON restock_requests(product_id) WHERE notified = false;

-- ============================================================
-- AUTO-UPDATE updated_at TRIGGERS
-- ============================================================
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

-- ============================================================
-- SUPABASE STORAGE BUCKETS
-- Run separately in: Supabase Dashboard → Storage → New Bucket
-- ============================================================
-- Bucket 1: "products"     → Public: true  (product images)
-- Bucket 2: "testimonials" → Public: true  (customer photos)
