-- 🔍 DEBUG: Verificar status do usuário e permissões

-- 1. Ver usuário logado e suas roles
SELECT 
    u.id,
    u.email,
    ur.role,
    p.nome
FROM auth.users u
LEFT JOIN public.user_roles ur ON ur.user_id = u.id
LEFT JOIN public.profiles p ON p.id = u.id
ORDER BY u.created_at DESC;

-- 2. Ver se RLS está habilitado nas tabelas
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- 3. Ver policies existentes
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 4. Contar dados em cada tabela
SELECT 'rooms' as tabela, COUNT(*) as total FROM rooms
UNION ALL
SELECT 'reservations', COUNT(*) FROM reservations
UNION ALL
SELECT 'guests', COUNT(*) FROM guests
UNION ALL
SELECT 'user_roles', COUNT(*) FROM user_roles
UNION ALL
SELECT 'profiles', COUNT(*) FROM profiles;
