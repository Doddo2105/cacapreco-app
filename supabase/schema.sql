-- ============================================================================
-- ORÇAPRO - SCHEMA DO BANCO DE DADOS (SUPABASE / POSTGRESQL)
-- Aplicado automaticamente no projeto OrcaPro-BD (vltnkxamypbzowtuwrkl)
-- ============================================================================

-- 1. Tabela de Perfil do Profissional / Empresa
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  device_id TEXT UNIQUE,
  business_name TEXT NOT NULL DEFAULT 'Meu Negócio Técnico',
  professional_name TEXT NOT NULL DEFAULT 'Profissional',
  profession_id TEXT NOT NULL DEFAULT 'eletricista',
  phone TEXT DEFAULT '',
  pix_key TEXT DEFAULT '',
  pix_key_type TEXT DEFAULT 'CPF/CNPJ',
  default_warranty_days INTEGER DEFAULT 90,
  is_pro BOOLEAN DEFAULT FALSE,
  pro_plan TEXT DEFAULT NULL,
  monthly_quotes_used INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabela de Clientes (CRM Simples)
CREATE TABLE IF NOT EXISTS public.clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL DEFAULT '',
  address TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabela de Orçamentos, Ordens de Serviço (OS) e Recibos
CREATE TABLE IF NOT EXISTS public.quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  number INTEGER NOT NULL DEFAULT 1,
  client_name TEXT NOT NULL,
  client_phone TEXT NOT NULL DEFAULT '',
  client_address TEXT DEFAULT '',
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'aprovado', 'concluido', 'pago')),
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  discount NUMERIC(10, 2) DEFAULT 0,
  total NUMERIC(10, 2) NOT NULL DEFAULT 0,
  warranty_days INTEGER DEFAULT 90,
  notes TEXT DEFAULT '',
  payment_terms TEXT DEFAULT '50% de sinal via Pix e 50% na conclusão',
  client_signature_svg TEXT DEFAULT NULL,
  signed_at TIMESTAMPTZ DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices de performance e Foreign Keys
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_quotes_profile_id ON public.quotes(profile_id);
CREATE INDEX IF NOT EXISTS idx_quotes_status ON public.quotes(status);
CREATE INDEX IF NOT EXISTS idx_clients_profile_id ON public.clients(profile_id);

-- Permissões para Data API
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.profiles TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.clients TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.quotes TO anon, authenticated;

-- Habilitar Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso para o MVP (anon e authenticated)
CREATE POLICY "Acesso perfis MVP" ON public.profiles
  FOR ALL TO anon, authenticated
  USING (true) WITH CHECK (true);

CREATE POLICY "Acesso clientes MVP" ON public.quotes
  FOR ALL TO anon, authenticated
  USING (true) WITH CHECK (true);

CREATE POLICY "Acesso orcamentos MVP" ON public.clients
  FOR ALL TO anon, authenticated
  USING (true) WITH CHECK (true);
