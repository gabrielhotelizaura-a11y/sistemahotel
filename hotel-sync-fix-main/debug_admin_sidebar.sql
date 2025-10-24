-- 🔍 VERIFICAR POR QUE ADMIN NÃO VÊ PREÇOS E ESTATÍSTICAS

-- 1. Ver EXATAMENTE qual é a role do usuário
SELECT 
    u.id,
    u.email,
    ur.role,
    ur.role = 'admin' as is_admin_check,
    LENGTH(ur.role) as role_length,
    ASCII(ur.role) as role_ascii_first_char
FROM auth.users u
LEFT JOIN public.user_roles ur ON ur.user_id = u.id
ORDER BY u.created_at DESC;

-- 2. Ver se tem espaços ou caracteres estranhos na role
SELECT 
    user_id,
    role,
    CONCAT('''', role, '''') as role_with_quotes,
    LENGTH(role) as length,
    role = 'admin' as equals_admin,
    role LIKE '%admin%' as contains_admin
FROM public.user_roles;

-- 3. CORRIGIR: Limpar e recriar role de admin
DO $$ 
DECLARE
    admin_email TEXT := 'seuemail@exemplo.com'; -- ← MUDE AQUI
    target_user_id UUID;
BEGIN
    -- Buscar user_id
    SELECT id INTO target_user_id
    FROM auth.users
    WHERE email = admin_email;
    
    IF target_user_id IS NULL THEN
        RAISE EXCEPTION 'Email % não encontrado!', admin_email;
    END IF;
    
    -- Deletar TODAS as roles antigas
    DELETE FROM public.user_roles WHERE user_id = target_user_id;
    
    -- Inserir role nova e limpa
    INSERT INTO public.user_roles (user_id, role)
    VALUES (target_user_id, 'admin');
    
    -- Verificar
    RAISE NOTICE '✅ Role configurada! Verificando...';
    
    -- Mostrar resultado
    PERFORM 
        u.email,
        ur.role
    FROM auth.users u
    JOIN public.user_roles ur ON ur.user_id = u.id
    WHERE u.id = target_user_id;
    
    RAISE NOTICE 'Email: %, Role: admin', admin_email;
END $$;

-- 4. Verificar novamente após correção
SELECT 
    u.email,
    ur.role,
    ur.role = 'admin' as is_admin,
    'Deve ser TRUE ☝️' as observacao
FROM auth.users u
JOIN public.user_roles ur ON ur.user_id = u.id
ORDER BY u.created_at DESC;
