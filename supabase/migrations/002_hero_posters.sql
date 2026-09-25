-- ============================================================
-- Isha Vastram — Migration 002: Hero Poster Marquee
-- Run this in: Supabase Dashboard → SQL Editor → Run
-- ============================================================

CREATE TABLE hero_posters (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url   TEXT NOT NULL,              -- Supabase Storage URL of the poster image
  product_id  UUID REFERENCES products(id) ON DELETE CASCADE,  -- linked saree
  title       TEXT,                       -- optional overlay label
  sort_order  INTEGER NOT NULL DEFAULT 0, -- controls display order in marquee
  is_active   BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_hero_posters_active ON hero_posters(is_active, sort_order)
  WHERE is_active = true;
