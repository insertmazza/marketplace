-- ─────────────────────────────────────────────────────────────
--  SUPABASE — SQL de configuración inicial
--  Pegá esto en: Supabase → SQL Editor → New query → Run
-- ─────────────────────────────────────────────────────────────

-- Categorías
CREATE TABLE categories (
  id    SERIAL PRIMARY KEY,
  slug  TEXT UNIQUE NOT NULL,
  name  TEXT NOT NULL,
  icon  TEXT,
  color TEXT
);

-- Anuncios
CREATE TABLE listings (
  id           BIGSERIAL PRIMARY KEY,
  title        TEXT NOT NULL,
  description  TEXT,
  price        NUMERIC,
  currency     TEXT DEFAULT 'ARS',
  price_label  TEXT,
  category_id  INT REFERENCES categories(id),
  location     TEXT,
  contact_phone TEXT,
  user_id      UUID REFERENCES auth.users(id),
  status       TEXT DEFAULT 'active',
  is_featured  BOOLEAN DEFAULT false,
  views        INT DEFAULT 0,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- Imágenes de cada anuncio
CREATE TABLE listing_images (
  id         BIGSERIAL PRIMARY KEY,
  listing_id BIGINT REFERENCES listings(id) ON DELETE CASCADE,
  url        TEXT NOT NULL,
  r2_key     TEXT NOT NULL,
  position   INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Espacios publicitarios
CREATE TABLE ad_slots (
  id         SERIAL PRIMARY KEY,
  slot_id    TEXT UNIQUE NOT NULL,
  title      TEXT,
  image_url  TEXT,
  link_url   TEXT,
  bg_color   TEXT DEFAULT 'linear-gradient(135deg, #7C3AED, #4338CA)',
  active     BOOLEAN DEFAULT true,
  start_date DATE,
  end_date   DATE,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Datos iniciales ────────────────────────────────────────

INSERT INTO ad_slots (slot_id, title, link_url, active) VALUES
  ('banner_top',    'Espacio publicitario superior', '#', true),
  ('banner_mid',    'Espacio publicitario medio',    '#', true),
  ('banner_bottom', 'Espacio publicitario inferior', '#', true);

INSERT INTO categories (slug, name, icon, color) VALUES
  ('vehiculos',    'Vehículos',   '🚗', '#FF6B35'),
  ('inmuebles',    'Inmuebles',   '🏠', '#2EC4B6'),
  ('servicios',    'Servicios',   '🔧', '#9B5DE5'),
  ('electronicos', 'Electrónica', '📱', '#00BBF9'),
  ('hogar',        'Hogar',       '🛋️', '#F7B731'),
  ('ropa',         'Ropa & Moda', '👗', '#FF85A1'),
  ('deportes',     'Deportes',    '⚽', '#0EAD69'),
  ('mascotas',     'Mascotas',    '🐾', '#E55934');

-- ── Seguridad (Row Level Security) ────────────────────────

ALTER TABLE listings       ENABLE ROW LEVEL SECURITY;
ALTER TABLE listing_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE ad_slots       ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories     ENABLE ROW LEVEL SECURITY;

-- Lectura pública de anuncios activos
CREATE POLICY "Anuncios públicos"
  ON listings FOR SELECT
  USING (status = 'active');

-- Solo el dueño puede crear sus anuncios
CREATE POLICY "Crear propio anuncio"
  ON listings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Solo el dueño puede editar sus anuncios
CREATE POLICY "Editar propio anuncio"
  ON listings FOR UPDATE
  USING (auth.uid() = user_id);

-- Imágenes: lectura pública
CREATE POLICY "Imágenes públicas"
  ON listing_images FOR SELECT
  USING (true);

-- Solo subir imágenes a tus propios anuncios
CREATE POLICY "Subir imágenes propias"
  ON listing_images FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM listings WHERE id = listing_id AND user_id = auth.uid())
  );

-- Ad slots: lectura pública de los activos
CREATE POLICY "Ad slots públicos"
  ON ad_slots FOR SELECT
  USING (active = true);

-- Categorías: lectura pública
CREATE POLICY "Categorías públicas"
  ON categories FOR SELECT
  USING (true);

-- ── Para actualizar un banner publicitario ─────────────────
-- (Ejecutá esto cuando tengas un anunciante)
--
-- UPDATE ad_slots
-- SET
--   title      = 'Nombre del anunciante',
--   image_url  = 'https://pub-XXX.r2.dev/ads/banner.jpg',
--   link_url   = 'https://sitio-del-anunciante.com',
--   bg_color   = 'linear-gradient(135deg, #15803D, #166534)',
--   start_date = '2024-04-01',
--   end_date   = '2024-04-30',
--   active     = true
-- WHERE slot_id = 'banner_top';
