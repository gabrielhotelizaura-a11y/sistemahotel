-- ✅ SQL corrigido para atualizar se já existir

DO $$ 
DECLARE
    user_id_var UUID := '3701d615-13a8-445a-8b43-5a624659cd42'; -- Seu User ID
BEGIN
    -- Adicionar role de admin (ignora se já existir)
    INSERT INTO public.user_roles (user_id, role)
    VALUES (user_id_var, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
    
    -- Criar/atualizar perfil (atualiza se já existir)
    INSERT INTO public.profiles (id, email, nome)
    VALUES (user_id_var, 'admin@hotel.com', 'Administrador')
    ON CONFLICT (id) DO UPDATE 
    SET 
        email = EXCLUDED.email,
        nome = EXCLUDED.nome;
    
    RAISE NOTICE '✅ Usuário admin configurado com sucesso!';
END $$;
