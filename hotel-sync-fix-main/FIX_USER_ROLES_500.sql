-- 🔥 SOLUÇÃO DEFINITIVA: Desabilitar RLS em user_roles

-- 1️⃣ Desabilitar RLS na tabela user_roles
ALTER TABLE public.user_roles DISABLE ROW LEVEL SECURITY;

-- 2️⃣ Verificar se funcionou
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_ativo
FROM pg_tables
WHERE tablename = 'user_roles';

-- 3️⃣ Testar se consegue buscar roles agora
SELECT * FROM public.user_roles;

-- Se ainda der erro 500, precisa criar uma política permissiva:
DROP POLICY IF EXISTS "Allow authenticated users to read their own role" ON public.user_roles;
DROP POLICY IF EXISTS "Users can read their own role" ON public.user_roles;

CREATE POLICY "Todos podem ler roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (true);

-- E garantir que RLS está habilitado COM a política permissiva
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Verificar políticas
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename = 'user_roles';
