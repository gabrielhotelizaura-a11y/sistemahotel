-- 🔄 RECUPERAR DADOS DAS TABELAS UNRESTRICTED

-- ⚠️ Este script vai COPIAR os dados de volta

BEGIN;

-- 1️⃣ ROOMS: Copiar dados de rooms_unrestricted para rooms
TRUNCATE public.rooms CASCADE; -- Limpar a tabela normal
INSERT INTO public.rooms (id, room_number, type, floor, price, amenities, status, created_at, updated_at)
SELECT id, room_number, type, floor, price, amenities, status, created_at, updated_at
FROM public.rooms_unrestricted;

-- 2️⃣ GUESTS: Copiar dados
TRUNCATE public.guests CASCADE;
INSERT INTO public.guests (id, name, email, phone, cpf, created_at, updated_at)
SELECT id, name, email, phone, cpf, created_at, updated_at
FROM public.guests_unrestricted;

-- 3️⃣ RESERVATIONS: Copiar dados
TRUNCATE public.reservations CASCADE;
INSERT INTO public.reservations (id, guest_id, room_id, check_in, check_out, num_guests, total_price, status, created_at, updated_at)
SELECT id, guest_id, room_id, check_in, check_out, num_guests, total_price, status, created_at, updated_at
FROM public.reservations_unrestricted;

-- 4️⃣ USER_ROLES: Copiar dados
TRUNCATE public.user_roles CASCADE;
INSERT INTO public.user_roles (user_id, role, created_at, updated_at)
SELECT user_id, role, created_at, updated_at
FROM public.user_roles_unrestricted;

-- 5️⃣ PROFILES: Copiar dados
TRUNCATE public.profiles CASCADE;
INSERT INTO public.profiles (id, nome, created_at, updated_at)
SELECT id, nome, created_at, updated_at
FROM public.profiles_unrestricted;

COMMIT;

-- 6️⃣ Desabilitar RLS em todas
ALTER TABLE public.rooms DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.guests DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservations DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- 7️⃣ Verificar se recuperou
SELECT 'rooms' as tabela, COUNT(*) as registros FROM public.rooms
UNION ALL
SELECT 'guests', COUNT(*) FROM public.guests
UNION ALL
SELECT 'reservations', COUNT(*) FROM public.reservations
UNION ALL
SELECT 'user_roles', COUNT(*) FROM public.user_roles
UNION ALL
SELECT 'profiles', COUNT(*) FROM public.profiles;

-- 8️⃣ Ver os quartos recuperados
SELECT * FROM public.rooms ORDER BY room_number;
