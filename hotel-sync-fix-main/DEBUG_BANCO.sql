-- 🔍 VERIFICAR STATUS DO BANCO kenmyxsnzwjamequalww

-- 1️⃣ Verificar se as tabelas existem
SELECT 
  table_name,
  table_type
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- 2️⃣ Verificar RLS (Row Level Security)
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_ativo,
  CASE 
    WHEN rowsecurity THEN '🔒 RLS ATIVO (pode bloquear)'
    ELSE '🔓 RLS DESATIVADO (ok)'
  END as status
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- 3️⃣ Contar registros
SELECT 'rooms' as tabela, COUNT(*) as registros FROM public.rooms
UNION ALL
SELECT 'guests', COUNT(*) FROM public.guests
UNION ALL
SELECT 'reservations', COUNT(*) FROM public.reservations
UNION ALL
SELECT 'user_roles', COUNT(*) FROM public.user_roles
UNION ALL
SELECT 'profiles', COUNT(*) FROM public.profiles;

-- 4️⃣ Testar busca de reservations
SELECT 
  r.id,
  r.room_id,
  r.guest_id,
  r.check_in,
  r.check_out,
  r.status,
  rm.room_number,
  g.name as guest_name
FROM public.reservations r
LEFT JOIN public.rooms rm ON rm.id = r.room_id
LEFT JOIN public.guests g ON g.id = r.guest_id
ORDER BY r.created_at DESC
LIMIT 5;

-- 5️⃣ Ver políticas RLS ativas
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
