-- 🔍 DIAGNÓSTICO COMPLETO

-- 1️⃣ Ver TODAS as tabelas e status do RLS
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_ativo,
  CASE 
    WHEN rowsecurity THEN '🔒 RLS ATIVO'
    ELSE '🔓 RLS DESATIVADO'
  END as status
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- 2️⃣ Ver todas as políticas ativas
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 3️⃣ Verificar se user_roles existe e tem dados
SELECT 
  COUNT(*) as total_roles,
  COUNT(CASE WHEN role = 'admin' THEN 1 END) as admins,
  COUNT(CASE WHEN role = 'funcionario' THEN 1 END) as funcionarios
FROM public.user_roles;

-- 4️⃣ Ver todos os usuários e suas roles
SELECT 
  u.id,
  u.email,
  ur.role,
  ur.created_at
FROM auth.users u
LEFT JOIN public.user_roles ur ON u.id = ur.user_id
ORDER BY u.created_at DESC;

-- 5️⃣ Buscar tabelas com nome "unrestricted"
SELECT 
  table_schema,
  table_name,
  table_type
FROM information_schema.tables
WHERE table_name LIKE '%unrestricted%'
  OR table_name LIKE '%unrest%'
ORDER BY table_name;
