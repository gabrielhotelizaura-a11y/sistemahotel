-- ============================================
-- POPULAR TABELA PROFILES COM USUÁRIOS EXISTENTES
-- ============================================

-- 1. Verificar estrutura da tabela profiles
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'profiles'
ORDER BY ordinal_position;

-- 2. Ver quantos usuários existem em auth.users
SELECT COUNT(*) as total_users FROM auth.users;

-- 3. Ver quantos perfis existem em profiles
SELECT COUNT(*) as total_profiles FROM public.profiles;

-- 4. Inserir TODOS os usuários na tabela profiles
INSERT INTO public.profiles (id, email)
SELECT 
  u.id,
  u.email
FROM auth.users u
ON CONFLICT (id) DO UPDATE 
SET email = EXCLUDED.email;

-- 5. Verificar se funcionou
SELECT 
  p.id,
  p.email,
  p.created_at,
  u.email as email_auth
FROM public.profiles p
INNER JOIN auth.users u ON u.id = p.id
ORDER BY p.created_at DESC;

-- 6. Contar novamente
SELECT 
  (SELECT COUNT(*) FROM auth.users) as usuarios_auth,
  (SELECT COUNT(*) FROM public.profiles) as usuarios_profiles,
  (SELECT COUNT(*) FROM public.user_roles) as usuarios_roles;

SELECT '✅ Profiles populados com sucesso!' as status;
