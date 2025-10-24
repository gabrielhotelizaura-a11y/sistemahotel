-- Verificar usuários e suas roles
SELECT 
  u.id,
  u.email,
  u.created_at,
  ur.role,
  CASE 
    WHEN ur.role = 'admin' THEN '✅ ADMIN'
    WHEN ur.role = 'funcionario' THEN '👤 FUNCIONÁRIO'
    ELSE '❌ SEM ROLE'
  END as status
FROM auth.users u
LEFT JOIN public.user_roles ur ON u.id = ur.user_id
ORDER BY u.created_at DESC;

-- Verificar se a role está como ENUM correto
SELECT 
  user_id,
  role::text as role_texto,
  pg_typeof(role) as tipo_coluna
FROM public.user_roles;
