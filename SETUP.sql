/**
 * SETUP SQL PARA SUPABASE
 * Copie e cole este SQL no SQL Editor do Supabase para criar as tabelas
 * 
 * Link: https://app.supabase.com/project/[SEU-PROJECT-ID]/sql/new
 */

-- ===== 1. TABELA: TOOLS =====
CREATE TABLE IF NOT EXISTS tools (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  subcategory TEXT,
  badges JSONB DEFAULT '[]',
  tags JSONB DEFAULT '[]',
  icon TEXT,
  link TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===== 2. TABELA: PROMPTS =====
CREATE TABLE IF NOT EXISTS prompts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  models JSONB DEFAULT '[]',
  content TEXT NOT NULL,
  image TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===== 3. TABELA: WORKFLOWS =====
CREATE TABLE IF NOT EXISTS workflows (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  steps JSONB DEFAULT '[]',
  image TEXT,
  webhook_url TEXT,
  inputs JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===== 4. TABELA: FAVORITOS =====
CREATE TABLE IF NOT EXISTS favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  item_type TEXT NOT NULL, -- 'tool', 'prompt', 'workflow'
  item_id UUID NOT NULL,
  item_name TEXT, -- cache para facilitar queries
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===== 5. TABELA: CATEGORIAS =====
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL, -- 'tool', 'prompt', 'workflow'
  name TEXT NOT NULL,
  position INT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(type, name)
);

-- ===== 6. TABELA: SUBCATEGORIAS =====
CREATE TABLE IF NOT EXISTS subcategories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category TEXT NOT NULL,
  name TEXT NOT NULL,
  position INT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(category, name)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_tools_category ON tools(category);
CREATE INDEX IF NOT EXISTS idx_prompts_category ON prompts(category);
CREATE INDEX IF NOT EXISTS idx_workflows_category ON workflows(category);
CREATE INDEX IF NOT EXISTS idx_favorites_item ON favorites(item_type, item_id);
CREATE INDEX IF NOT EXISTS idx_categories_type ON categories(type);

-- Enable Row Level Security (RLS) - opcional, por enquanto sem autenticação
ALTER TABLE tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE subcategories ENABLE ROW LEVEL SECURITY;

-- Políticas RLS (permitir read/write público por enquanto)
CREATE POLICY "Allow public read/write tools" ON tools
  FOR ALL USING (true);

CREATE POLICY "Allow public read/write prompts" ON prompts
  FOR ALL USING (true);

CREATE POLICY "Allow public read/write workflows" ON workflows
  FOR ALL USING (true);

CREATE POLICY "Allow public read/write favorites" ON favorites
  FOR ALL USING (true);

CREATE POLICY "Allow public read/write categories" ON categories
  FOR ALL USING (true);

CREATE POLICY "Allow public read/write subcategories" ON subcategories
  FOR ALL USING (true);
