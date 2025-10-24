-- 🔓 DESABILITAR RLS EM TODAS AS TABELAS DO PROJETO

-- Lista de todas as tabelas do projeto
ALTER TABLE public.guests DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservations DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses DISABLE ROW LEVEL SECURITY;

-- Dropar TODAS as políticas de TODAS as tabelas
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN 
        SELECT schemaname, tablename, policyname
        FROM pg_policies 
        WHERE schemaname = 'public'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON ' || r.schemaname || '.' || r.tablename;
    END LOOP;
END $$;

-- Verificar status de TODAS as tabelas
SELECT 
  tablename,
  rowsecurity as rls_ativo,
  CASE 
    WHEN rowsecurity THEN '❌ RLS ATIVO'
    ELSE '✅ RLS DESATIVADO'
  END as status
FROM pg_tables
WHERE schemaname = 'public'
  AND table_type = 'BASE TABLE'
ORDER BY tablename;

-- Ver se ainda tem alguma política ativa
SELECT 
  schemaname,
  tablename,
  policyname
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename;
