-- ============================================================
-- PRINT3D — Schema Supabase
-- Colar no SQL Editor: https://supabase.com/dashboard/project/wnhfflafqengtdtgonsd/sql
-- ============================================================

-- TABELA: products
CREATE TABLE IF NOT EXISTS products (
  id                  SERIAL PRIMARY KEY,
  title               TEXT NOT NULL,
  src_url             TEXT NOT NULL,
  gallery             TEXT[] DEFAULT '{}',
  price               DECIMAL(10,2) NOT NULL,
  discount_amount     DECIMAL(10,2) DEFAULT 0,
  discount_percentage INTEGER DEFAULT 0,
  rating              DECIMAL(3,1) DEFAULT 0,
  stock               BOOLEAN DEFAULT TRUE,
  category            TEXT DEFAULT 'Geral',
  description         TEXT,
  is_featured         BOOLEAN DEFAULT FALSE,
  is_new              BOOLEAN DEFAULT FALSE,
  is_top_selling      BOOLEAN DEFAULT FALSE,
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- TABELA: orders
CREATE TABLE IF NOT EXISTS orders (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name     TEXT NOT NULL,
  customer_email    TEXT NOT NULL,
  customer_phone    TEXT,
  shipping_address  JSONB NOT NULL,
  items             JSONB NOT NULL,
  subtotal          DECIMAL(10,2) NOT NULL,
  discount          DECIMAL(10,2) DEFAULT 0,
  shipping_cost     DECIMAL(10,2) DEFAULT 0,
  total             DECIMAL(10,2) NOT NULL,
  status            TEXT DEFAULT 'pendente',
  tracking_code     TEXT,
  carrier           TEXT,
  payment_status    TEXT DEFAULT 'pendente',
  payment_method    TEXT,
  notes             TEXT,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

-- Status possíveis para orders:
-- pendente → confirmada → em_preparacao → enviada → entregue
-- cancelada

-- TABELA: reviews
CREATE TABLE IF NOT EXISTS reviews (
  id          SERIAL PRIMARY KEY,
  product_id  INTEGER REFERENCES products(id) ON DELETE CASCADE,
  user_name   TEXT NOT NULL,
  content     TEXT NOT NULL,
  rating      INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- DADOS INICIAIS — os teus 15 produtos atuais
-- ============================================================

INSERT INTO products (id, title, src_url, gallery, price, discount_amount, discount_percentage, rating, stock, category, is_new, is_featured, is_top_selling) VALUES
(1,  'Vaso Espiral Geométrico',         '/images/pic1.png',  ARRAY['/images/pic1.png', '/images/pic10.png', '/images/pic11.png'], 15, 0, 0,   4.5, TRUE,  'Decoração',    TRUE,  FALSE, FALSE),
(2,  'Suporte para Auscultadores Gaming','/images/pic2.png', ARRAY['/images/pic2.png'],                                           20, 0, 15,  4.0, TRUE,  'Gaming',       TRUE,  FALSE, FALSE),
(3,  'Dragão Articulado Flexível',       '/images/pic3.png', ARRAY['/images/pic3.png'],                                           14, 0, 0,   4.8, FALSE, 'Animais',      TRUE,  TRUE,  FALSE),
(4,  'Lampada Litofane Personalizada',   '/images/pic4.png', ARRAY['/images/pic4.png', '/images/pic10.png', '/images/pic11.png'], 39, 0, 10,  5.0, TRUE,  'Iluminação',   TRUE,  TRUE,  FALSE),
(5,  'Pack Animais Articulados (5 peças)','/images/pic5.png',ARRAY['/images/pic5.png', '/images/pic10.png', '/images/pic11.png'], 20, 0, 20,  5.0, TRUE,  'Animais',      FALSE, TRUE,  TRUE),
(6,  'Porta-Velas Geométrico',           '/images/pic6.png', ARRAY['/images/pic6.png', '/images/pic10.png', '/images/pic11.png'], 10, 0, 0,   4.5, FALSE, 'Decoração',    FALSE, FALSE, TRUE),
(7,  'Organizador de Cabos USB',         '/images/pic7.png', ARRAY['/images/pic7.png'],                                           8,  0, 0,   4.0, TRUE,  'Gaming',       FALSE, FALSE, TRUE),
(8,  'Vaso de Parede Minimalista',       '/images/pic8.png', ARRAY['/images/pic8.png'],                                           13, 0, 0,   4.5, TRUE,  'Decoração',    FALSE, FALSE, TRUE),
(12, 'Suporte Multiuso para Secretária', '/images/pic12.png',ARRAY['/images/pic12.png', '/images/pic10.png', '/images/pic11.png'],25, 0, 20,  4.0, TRUE,  'Organização',  FALSE, FALSE, FALSE),
(13, 'Escultura Abstrata de Mesa',       '/images/pic13.png',ARRAY['/images/pic13.png', '/images/pic10.png', '/images/pic11.png'],19, 0, 0,   3.5, TRUE,  'Decoração',    FALSE, FALSE, FALSE),
(14, 'Cortador de Bolachas Temático',    '/images/pic14.png',ARRAY['/images/pic14.png'],                                           9, 0, 0,   4.5, TRUE,  'Cozinha',      FALSE, FALSE, FALSE),
(15, 'Miniatura RPG Pack 3 Figuras',     '/images/pic15.png',ARRAY['/images/pic15.png'],                                          27, 0, 15,  5.0, TRUE,  'RPG',          FALSE, TRUE,  FALSE)
ON CONFLICT (id) DO NOTHING;

-- Atualizar sequência do serial após INSERT com IDs manuais
SELECT setval('products_id_seq', (SELECT MAX(id) FROM products));

-- ============================================================
-- RLS (Row Level Security) — leitura pública, escrita protegida
-- ============================================================

ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Produtos: qualquer pessoa pode ler
CREATE POLICY "produtos_leitura_publica" ON products
  FOR SELECT USING (TRUE);

-- Encomendas: qualquer pessoa pode criar (necessário para checkout)
CREATE POLICY "encomendas_criar" ON orders
  FOR INSERT WITH CHECK (TRUE);

-- Encomendas: só o service_role pode ler/atualizar (admin)
CREATE POLICY "encomendas_admin" ON orders
  FOR ALL USING (auth.role() = 'service_role');

-- Reviews: leitura pública
CREATE POLICY "reviews_leitura_publica" ON reviews
  FOR SELECT USING (TRUE);

-- Reviews: qualquer pessoa pode criar
CREATE POLICY "reviews_criar" ON reviews
  FOR INSERT WITH CHECK (TRUE);

-- ============================================================
-- ATUALIZAÇÃO: Ligar encomendas ao utilizador autenticado
-- Colar no SQL Editor do Supabase para adicionar após o schema inicial
-- ============================================================

-- Adicionar user_id à tabela orders (para utilizadores autenticados)
ALTER TABLE orders ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Índice para pesquisa rápida por utilizador
CREATE INDEX IF NOT EXISTS orders_user_id_idx ON orders(user_id);
CREATE INDEX IF NOT EXISTS orders_customer_email_idx ON orders(customer_email);

-- Política: utilizador autenticado pode ver as suas próprias encomendas
CREATE POLICY IF NOT EXISTS "encomendas_proprias" ON orders
  FOR SELECT USING (
    auth.uid() = user_id
    OR customer_email = auth.jwt()->>'email'
  );

-- ============================================================
-- ATUALIZAÇÃO: Coluna payment_intent_id para pagamentos Stripe
-- Colar no SQL Editor do Supabase se ainda não tiveres feito
-- ============================================================

-- Guardar o ID do PaymentIntent do Stripe para idempotência
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_intent_id TEXT;

-- Índice único para evitar duplicados
CREATE UNIQUE INDEX IF NOT EXISTS orders_payment_intent_id_idx ON orders(payment_intent_id) WHERE payment_intent_id IS NOT NULL;
