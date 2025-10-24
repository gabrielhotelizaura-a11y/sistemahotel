-- 🔧 CORRIGIR: Permissões e dados faltando

-- PARTE 1: Garantir que seu usuário tem role de admin
-- (Execute primeiro para ver seu user_id)
SELECT id, email FROM auth.users ORDER BY created_at DESC LIMIT 5;

-- Depois cole seu user_id aqui:
DO $$ 
DECLARE
    admin_user_id UUID := 'COLE_SEU_USER_ID_AQUI'; -- ← IMPORTANTE!
BEGIN
    -- Adicionar role de admin
    INSERT INTO public.user_roles (user_id, role)
    VALUES (admin_user_id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
    
    -- Criar/atualizar perfil
    INSERT INTO public.profiles (id, email, nome)
    SELECT id, email, 'Administrador'
    FROM auth.users
    WHERE id = admin_user_id
    ON CONFLICT (id) DO UPDATE 
    SET nome = 'Administrador';
    
    RAISE NOTICE 'Admin configurado!';
END $$;


-- PARTE 2: Desabilitar RLS temporariamente (para debug)
-- ⚠️ Só use isso em desenvolvimento! Em produção, mantenha RLS ativo

-- Desabilitar RLS em todas as tabelas (TEMPORÁRIO para testar)
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.guests DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservations DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses DISABLE ROW LEVEL SECURITY;


-- PARTE 3: Se quiser RE-HABILITAR RLS depois (com policies corretas)
/*
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
*/
