-- Criar tabela de despesas operacionais do hotel
CREATE TABLE IF NOT EXISTS public.operational_expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  description TEXT NOT NULL,
  value DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Criar índice para ordenação por data
CREATE INDEX IF NOT EXISTS idx_operational_expenses_created_at 
ON public.operational_expenses(created_at DESC);

-- DESABILITAR RLS para permitir acesso total (como nas outras tabelas)
ALTER TABLE public.operational_expenses DISABLE ROW LEVEL SECURITY;

-- Verificar se funcionou
SELECT * FROM public.operational_expenses ORDER BY created_at DESC LIMIT 10;
