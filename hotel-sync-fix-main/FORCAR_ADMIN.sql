-- ⚠️ FORÇAR SEU USUÁRIO COMO ADMIN
-- Substitua 'SEU_EMAIL@example.com' pelo seu email real

-- 1️⃣ Primeiro, verificar qual é o seu ID
SELECT id, email FROM auth.users WHERE email = 'SEU_EMAIL@example.com';

-- 2️⃣ Atualizar para admin (use o ID que apareceu acima)
UPDATE public.user_roles 
SET role = 'admin'::app_role
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'SEU_EMAIL@example.com');

-- 3️⃣ Se não existir a linha, criar:
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role
FROM auth.users 
WHERE email = 'SEU_EMAIL@example.com'
ON CONFLICT (user_id) 
DO UPDATE SET role = 'admin'::app_role;

-- 4️⃣ Verificar se funcionou
SELECT 
  u.email,
  ur.role,
  CASE 
    WHEN ur.role = 'admin' THEN '✅ ADMIN CONFIGURADO!'
    ELSE '❌ AINDA NÃO É ADMIN'
  END as status
FROM auth.users u
LEFT JOIN public.user_roles ur ON u.id = ur.user_id
WHERE u.email = 'SEU_EMAIL@example.com';
