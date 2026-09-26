-- ============================================================
-- Isha Vastram — Finance Tables
-- Run this in: Supabase Dashboard → SQL Editor → Run
-- ============================================================

-- ============================================================
-- TABLE: expenses
-- ============================================================
CREATE TABLE IF NOT EXISTS expenses (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title        TEXT NOT NULL,
  amount       DECIMAL(10,2) NOT NULL,
  category     TEXT NOT NULL DEFAULT 'other'
                 CHECK (category IN ('raw_material','shipping','packaging','marketing','rent','salary','tax','utilities','other')),
  description  TEXT,
  vendor       TEXT,
  receipt_url  TEXT,
  expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_expenses_date     ON expenses(expense_date DESC);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category);

CREATE OR REPLACE TRIGGER update_expenses_modtime
  BEFORE UPDATE ON expenses
  FOR EACH ROW EXECUTE FUNCTION update_modified_column();

-- ============================================================
-- TABLE: invoices
-- ============================================================
CREATE TABLE IF NOT EXISTS invoices (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number TEXT NOT NULL UNIQUE,
  order_id       UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  customer_id    UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  subtotal       DECIMAL(10,2) NOT NULL,
  discount       DECIMAL(10,2) NOT NULL DEFAULT 0,
  shipping       DECIMAL(10,2) NOT NULL DEFAULT 0,
  gst_percent    DECIMAL(5,2) NOT NULL DEFAULT 0,
  gst_amount     DECIMAL(10,2) NOT NULL DEFAULT 0,
  total          DECIMAL(10,2) NOT NULL,
  status         TEXT NOT NULL DEFAULT 'generated'
                   CHECK (status IN ('generated','sent','paid')),
  notes          TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_invoices_order    ON invoices(order_id);
CREATE INDEX IF NOT EXISTS idx_invoices_customer ON invoices(customer_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status   ON invoices(status);

-- ============================================================
-- Seed business_info into store_settings
-- ============================================================
INSERT INTO store_settings (key, value)
VALUES ('business_info', '{"business_name":"Isha Vastram","gstin":"","pan":"","address":"","city":"","state":"Maharashtra","pincode":"","phone":"919209337387","email":"","bank_name":"","account_number":"","ifsc_code":"","upi_id":""}')
ON CONFLICT (key) DO NOTHING;

-- ============================================================
-- TABLE: manual_revenue (Offline / Cash Sales)
-- ============================================================
CREATE TABLE IF NOT EXISTS manual_revenue (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title          TEXT NOT NULL,
  amount         DECIMAL(10,2) NOT NULL,
  payment_method TEXT NOT NULL DEFAULT 'cash'
                   CHECK (payment_method IN ('cash','upi','bank_transfer','cheque','other')),
  customer_name  TEXT,
  customer_phone TEXT,
  description    TEXT,
  items_summary  TEXT,       -- e.g. "2x Cotton Saree, 1x Silk Dupatta"
  sale_date      DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_manual_revenue_date ON manual_revenue(sale_date DESC);

CREATE OR REPLACE TRIGGER update_manual_revenue_modtime
  BEFORE UPDATE ON manual_revenue
  FOR EACH ROW EXECUTE FUNCTION update_modified_column();
