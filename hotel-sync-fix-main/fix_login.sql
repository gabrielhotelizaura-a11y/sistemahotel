-- 🔧 Corrigir problema de login - Confirmar email do usuário

-- Opção 1: Confirmar email do usuário que você criou
UPDATE auth.users 
SET email_confirmed_at = NOW(),
    confirmed_at = NOW()
WHERE email = 'admin@hotel.com';  -- ← Mude para seu email

-- Opção 2: Ver todos os usuários e seus status
SELECT 
    id,
    email,
    email_confirmed_at,
    confirmed_at,
    created_at
FROM auth.users
ORDER BY created_at DESC;

-- Opção 3: Confirmar TODOS os usuários de uma vez
UPDATE auth.users 
SET email_confirmed_at = NOW(),
    confirmed_at = NOW()
WHERE email_confirmed_at IS NULL;
