-- 🔍 VERIFICAR E CORRIGIR ROLES

-- 1. Ver todos os usuários e suas roles
SELECT 
    u.id,
    u.email,
    u.created_at,
    ur.role as role_atual,
    CASE 
        WHEN ur.role = 'admin' THEN '👑 Admin'
        WHEN ur.role = 'funcionario' THEN '👤 Funcionário'
        ELSE '❌ SEM ROLE'
    END as status
FROM auth.users u
LEFT JOIN public.user_roles ur ON ur.user_id = u.id
ORDER BY u.created_at DESC;


-- 2. CORRIGIR: Transformar um usuário específico em ADMIN
-- (Cole o ID do usuário que você quer tornar admin)
DO $$ 
DECLARE
    target_user_id UUID := 'COLE_O_USER_ID_AQUI'; -- ← COLE O ID AQUI
BEGIN
    -- Deletar role antiga se existir
    DELETE FROM public.user_roles WHERE user_id = target_user_id;
    
    -- Adicionar role de admin
    INSERT INTO public.user_roles (user_id, role)
    VALUES (target_user_id, 'admin');
    
    -- Atualizar perfil
    INSERT INTO public.profiles (id, email, nome)
    SELECT id, email, 'Administrador'
    FROM auth.users
    WHERE id = target_user_id
    ON CONFLICT (id) DO UPDATE 
    SET nome = 'Administrador';
    
    RAISE NOTICE '✅ Usuário transformado em ADMIN com sucesso!';
END $$;


-- 3. ALTERNATIVA: Transformar todos os usuários sem role em funcionário
INSERT INTO public.user_roles (user_id, role)
SELECT u.id, 'funcionario'
FROM auth.users u
LEFT JOIN public.user_roles ur ON ur.user_id = u.id
WHERE ur.role IS NULL
ON CONFLICT (user_id, role) DO NOTHING;


-- 4. Verificar novamente após correção
SELECT 
    u.id,
    u.email,
    ur.role,
    CASE 
        WHEN ur.role = 'admin' THEN '👑 Admin - Acesso total'
        WHEN ur.role = 'funcionario' THEN '👤 Funcionário - Pode reservar quartos'
        ELSE '❌ SEM ROLE'
    END as permissoes
FROM auth.users u
LEFT JOIN public.user_roles ur ON ur.user_id = u.id
ORDER BY ur.role DESC NULLS LAST, u.created_at DESC;
