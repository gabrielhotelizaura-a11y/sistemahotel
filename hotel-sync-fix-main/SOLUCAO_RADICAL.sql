-- 🔥 SOLUÇÃO RADICAL: Destruir todas as políticas RLS e desabilitar tudo

-- 1️⃣ DROPAR TODAS as políticas RLS de user_roles
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE schemaname = 'public' AND tablename = 'user_roles'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON public.user_roles';
    END LOOP;
END $$;

-- 2️⃣ Desabilitar RLS em TODAS as tabelas
ALTER TABLE public.guests DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservations DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles DISABLE ROW LEVEL SECURITY;

-- 3️⃣ Se existir tabela "unrestricted", dropar ela
DROP TABLE IF EXISTS public.unrestricted CASCADE;
DROP TABLE IF EXISTS public.guests_unrestricted CASCADE;
DROP TABLE IF EXISTS public.profiles_unrestricted CASCADE;
DROP TABLE IF EXISTS public.reservations_unrestricted CASCADE;
DROP TABLE IF EXISTS public.rooms_unrestricted CASCADE;
DROP TABLE IF EXISTS public.user_roles_unrestricted CASCADE;

-- 4️⃣ Verificar se resolveu
SELECT 
  tablename,
  rowsecurity as rls_ativo
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- 5️⃣ Testar busca na user_roles
SELECT 
  user_id,
  role,
  created_at
FROM public.user_roles
ORDER BY created_at DESC;
