-- 🔥 DESABILITAR RLS EM TODAS AS TABELAS

-- Execute isso para garantir que nada está bloqueado

ALTER TABLE public.guests DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservations DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles DISABLE ROW LEVEL SECURITY;

-- Dropar todas as políticas RLS
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN 
        SELECT schemaname, tablename, policyname
        FROM pg_policies 
        WHERE schemaname = 'public'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON ' || r.schemaname || '.' || r.tablename;
    END LOOP;
END $$;

-- Verificar se resolveu
SELECT 
  tablename,
  rowsecurity as rls_ativo
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- Testar query que o useReservations faz
SELECT 
  r.*,
  rm.room_number,
  rm.type as room_type,
  g.name as guest_name,
  g.email as guest_email,
  g.phone as guest_phone
FROM public.reservations r
LEFT JOIN public.rooms rm ON rm.id = r.room_id
LEFT JOIN public.guests g ON g.id = r.guest_id
ORDER BY r.check_in DESC;
