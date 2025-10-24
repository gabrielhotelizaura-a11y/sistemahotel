-- ============================================
-- CORRIGIR CRIAÇÃO AUTOMÁTICA DE USUÁRIOS
-- ============================================
-- Execute este SQL no Supabase SQL Editor para garantir que
-- novos usuários sejam automaticamente cadastrados nas tabelas

-- 1. Remover triggers antigos (se existirem)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_created_role ON auth.users;

-- 2. Remover funções antigas
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user_role() CASCADE;

-- ============================================
-- CRIAR FUNÇÃO UNIFICADA PARA NOVOS USUÁRIOS
-- ============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- 1. Criar perfil do usuário
  INSERT INTO public.profiles (id, email)
  VALUES (
    NEW.id,
    NEW.email
  )
  ON CONFLICT (id) DO NOTHING;

  -- 2. Criar role padrão 'funcionario'
  -- (o primeiro usuário você deve promover manualmente para 'admin')
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'funcionario')
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$;

-- ============================================
-- CRIAR TRIGGER
-- ============================================

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- VERIFICAR SE FUNCIONOU
-- ============================================

SELECT 'Trigger criado com sucesso! ✅' AS status;

-- Listar todos os triggers ativos
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

-- ============================================
-- VERIFICAR USUÁRIOS EXISTENTES SEM PERFIL
-- ============================================

SELECT 
  u.id,
  u.email,
  u.created_at,
  CASE 
    WHEN p.id IS NULL THEN '❌ SEM PERFIL'
    ELSE '✅ COM PERFIL'
  END as status_perfil,
  CASE 
    WHEN r.user_id IS NULL THEN '❌ SEM ROLE'
    ELSE '✅ ROLE: ' || r.role
  END as status_role
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
LEFT JOIN public.user_roles r ON r.user_id = u.id
ORDER BY u.created_at DESC;

-- ============================================
-- CORRIGIR USUÁRIOS EXISTENTES (se necessário)
-- ============================================
-- Se você tem usuários que já foram criados mas não têm perfil/role,
-- execute este bloco para corrigi-los:

DO $$
DECLARE
  user_record RECORD;
BEGIN
  FOR user_record IN 
    SELECT u.id, u.email
    FROM auth.users u
    LEFT JOIN public.profiles p ON p.id = u.id
    WHERE p.id IS NULL
  LOOP
    -- Criar perfil
    INSERT INTO public.profiles (id, email)
    VALUES (user_record.id, user_record.email)
    ON CONFLICT (id) DO NOTHING;
    
    -- Criar role
    INSERT INTO public.user_roles (user_id, role)
    VALUES (user_record.id, 'funcionario')
    ON CONFLICT (user_id) DO NOTHING;
    
    RAISE NOTICE 'Corrigido usuário: % (%)', user_record.email, user_record.id;
  END LOOP;
END $$;

-- Verificar novamente após correção
SELECT 
  u.id,
  u.email,
  p.id as profile_id,
  r.role
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
LEFT JOIN public.user_roles r ON r.user_id = u.id
ORDER BY u.created_at DESC;

-- ============================================
-- PRONTO! ✅
-- ============================================
-- Agora quando você criar um novo usuário via interface,
-- ele automaticamente terá:
-- 1. Perfil criado em 'profiles'
-- 2. Role 'funcionario' em 'user_roles'
