-- ============================================
-- POPULAR TABELA USER_ROLES COM USUÁRIOS EXISTENTES
-- ============================================

-- 1. Ver quantos usuários existem sem role
SELECT 
  u.id,
  u.email,
  CASE 
    WHEN r.user_id IS NULL THEN '❌ SEM ROLE'
    ELSE '✅ ROLE: ' || r.role
  END as status
FROM auth.users u
LEFT JOIN public.user_roles r ON r.user_id = u.id
ORDER BY u.created_at;

-- 2. Inserir role 'funcionario' para TODOS os usuários que não têm role
INSERT INTO public.user_roles (user_id, role)
SELECT 
  u.id,
  'funcionario'
FROM auth.users u
LEFT JOIN public.user_roles r ON r.user_id = u.id
WHERE r.user_id IS NULL
ON CONFLICT (user_id) DO NOTHING;

-- 3. Verificar se funcionou
SELECT 
  u.id,
  u.email,
  r.role,
  r.created_at
FROM auth.users u
INNER JOIN public.user_roles r ON r.user_id = u.id
ORDER BY r.created_at DESC;

-- 4. Contar
SELECT 
  (SELECT COUNT(*) FROM auth.users) as total_usuarios,
  (SELECT COUNT(*) FROM public.user_roles) as total_roles,
  (SELECT COUNT(*) FROM public.user_roles WHERE role = 'admin') as total_admins,
  (SELECT COUNT(*) FROM public.user_roles WHERE role = 'funcionario') as total_funcionarios;

SELECT '✅ Roles criadas com sucesso! Todos começam como FUNCIONARIO.' as status;
SELECT '⚠️ IMPORTANTE: Agora você precisa promover manualmente quem será ADMIN!' as aviso;

-- ============================================
-- PROMOVER USUÁRIO PARA ADMIN
-- ============================================
-- Substitua 'email@do.usuario' pelo email de quem você quer tornar admin

-- Exemplo: Para tornar admin@hotel.com um administrador:
-- UPDATE public.user_roles
-- SET role = 'admin'
-- WHERE user_id = (SELECT id FROM auth.users WHERE email = 'admin@hotel.com');

-- OU se você sabe o UUID do usuário:
-- UPDATE public.user_roles
-- SET role = 'admin'
-- WHERE user_id = 'UUID-DO-USUARIO-AQUI';

-- Verificar admins
SELECT 
  u.email,
  r.role
FROM public.user_roles r
INNER JOIN auth.users u ON u.id = r.user_id
WHERE r.role = 'admin';
