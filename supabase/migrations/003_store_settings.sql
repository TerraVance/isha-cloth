-- ============================================================
-- TABLE: store_settings
-- ============================================================
CREATE TABLE store_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Insert default hero image setting
INSERT INTO store_settings (key, value)
VALUES ('hero_image', '{"url": "/images/hero-model.jpg"}')
ON CONFLICT (key) DO NOTHING;
