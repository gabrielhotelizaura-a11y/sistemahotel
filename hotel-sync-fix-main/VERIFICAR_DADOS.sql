-- 🚨 RECUPERAÇÃO DE EMERGÊNCIA

-- 1️⃣ Ver quais tabelas ainda existem
SELECT 
  table_name,
  table_type
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- 2️⃣ Verificar se as "_unrestricted" ainda têm dados
SELECT 'rooms_unrestricted' as tabela, COUNT(*) as registros 
FROM public.rooms_unrestricted
UNION ALL
SELECT 'guests_unrestricted', COUNT(*) FROM public.guests_unrestricted
UNION ALL
SELECT 'reservations_unrestricted', COUNT(*) FROM public.reservations_unrestricted
UNION ALL
SELECT 'user_roles_unrestricted', COUNT(*) FROM public.user_roles_unrestricted
UNION ALL
SELECT 'profiles_unrestricted', COUNT(*) FROM public.profiles_unrestricted;

-- 3️⃣ Ver se a tabela rooms normal existe e está vazia
SELECT 'rooms (normal)' as tabela, COUNT(*) as registros 
FROM public.rooms;
