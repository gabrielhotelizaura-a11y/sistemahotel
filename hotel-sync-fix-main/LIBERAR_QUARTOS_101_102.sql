-- =====================================================
-- SCRIPT PARA LIBERAR QUARTOS 101 E 102
-- =====================================================
-- Este script vai:
-- 1. Cancelar todas as reservas ativas
-- 2. Liberar os quartos para status 'available'
-- 3. Corrigir amenities se necessário
-- =====================================================

-- PASSO 1: Ver o que está bloqueando os quartos
SELECT 
    '🔍 DIAGNÓSTICO' as acao,
    r.id as reservation_id,
    r.status as reservation_status,
    r.check_in,
    r.check_out,
    room.id as room_id,
    room.number as room_number,
    room.status as room_status,
    g.name as guest_name
FROM reservations r
JOIN rooms room ON r.room_id = room.id
LEFT JOIN guests g ON r.guest_id = g.id
WHERE room.number IN ('101', '102')
  AND r.status IN ('active', 'future')
ORDER BY r.created_at DESC;

-- =====================================================
-- PASSO 2: CANCELAR TODAS AS RESERVAS ATIVAS
-- =====================================================

-- Cancelar reservas dos quartos 101 e 102
UPDATE reservations
SET status = 'cancelled'
WHERE room_id IN (
    SELECT id FROM rooms WHERE number IN ('101', '102')
)
AND status IN ('active', 'future');

-- Verificar quantas foram canceladas
SELECT 
    '✅ RESERVAS CANCELADAS' as acao,
    COUNT(*) as total_canceladas
FROM reservations
WHERE room_id IN (
    SELECT id FROM rooms WHERE number IN ('101', '102')
)
AND status = 'cancelled';

-- =====================================================
-- PASSO 3: LIBERAR OS QUARTOS
-- =====================================================

-- Atualizar status dos quartos para disponível
UPDATE rooms
SET status = 'available'
WHERE number IN ('101', '102');

-- =====================================================
-- PASSO 4: CORRIGIR AMENITIES (se necessário)
-- =====================================================

-- Garantir que amenities está correto
UPDATE rooms 
SET amenities = ARRAY['Wi-Fi', 'TV', 'Ar-condicionado']
WHERE number IN ('101', '102')
  AND (
    amenities IS NULL 
    OR array_length(amenities, 1) IS NULL 
    OR array_length(amenities, 1) = 0
  );

-- =====================================================
-- PASSO 5: VERIFICAÇÃO FINAL
-- =====================================================

-- Ver status final dos quartos
SELECT 
    '✅ STATUS FINAL' as acao,
    id,
    number,
    type,
    status,
    price,
    amenities,
    array_length(amenities, 1) as total_amenities
FROM rooms 
WHERE number IN ('101', '102');

-- Ver se ainda há reservas ativas (não deveria ter nenhuma)
SELECT 
    '🔍 RESERVAS RESTANTES' as acao,
    r.id,
    r.status,
    room.number
FROM reservations r
JOIN rooms room ON r.room_id = room.id
WHERE room.number IN ('101', '102')
  AND r.status IN ('active', 'future');

-- =====================================================
-- RESULTADO ESPERADO
-- =====================================================
-- ✅ Quartos 101 e 102 com status = 'available'
-- ✅ Amenities = ['Wi-Fi', 'TV', 'Ar-condicionado']
-- ✅ Nenhuma reserva ativa
-- =====================================================

-- OPCIONAL: Ver histórico completo
SELECT 
    '📊 HISTÓRICO COMPLETO' as acao,
    r.id,
    r.status,
    r.check_in,
    r.check_out,
    room.number,
    g.name,
    r.created_at
FROM reservations r
JOIN rooms room ON r.room_id = room.id
LEFT JOIN guests g ON r.guest_id = g.id
WHERE room.number IN ('101', '102')
ORDER BY r.created_at DESC
LIMIT 10;
