# 🚨 DIAGNÓSTICO ESPECÍFICO: Quartos 101 e 102

## 🔍 Problema Reportado

1. ❌ **Erro ao carregar detalhes da reserva** (quando clica em "Detalhes")
2. ❌ **Não consegue concluir a reserva** (Check-out não funciona)

---

## 📊 SCRIPT SQL DE DIAGNÓSTICO COMPLETO

**Acesse:** Supabase → SQL Editor → New Query

Cole este SQL e execute:

\`\`\`sql
-- ================================================================
-- DIAGNÓSTICO COMPLETO DOS QUARTOS 101 E 102
-- ================================================================

-- 1️⃣ VERIFICAR SE OS QUARTOS EXISTEM
SELECT 
    '1️⃣ DADOS DOS QUARTOS' as secao,
    id,
    number,
    type,
    status,
    price,
    amenities,
    created_at
FROM rooms 
WHERE number IN ('101', '102')
ORDER BY number;

-- 2️⃣ VERIFICAR RESERVAS ATIVAS
SELECT 
    '2️⃣ RESERVAS ATIVAS' as secao,
    r.id as reservation_id,
    r.status,
    r.check_in,
    r.check_out,
    r.total_price,
    room.id as room_id,
    room.number as room_number,
    room.status as room_status,
    g.id as guest_id,
    g.name as guest_name,
    g.email as guest_email
FROM reservations r
JOIN rooms room ON r.room_id = room.id
LEFT JOIN guests g ON r.guest_id = g.id
WHERE room.number IN ('101', '102')
  AND r.status = 'active'
ORDER BY r.created_at DESC;

-- 3️⃣ VERIFICAR RESERVAS FUTURAS
SELECT 
    '3️⃣ RESERVAS FUTURAS' as secao,
    r.id as reservation_id,
    r.status,
    r.check_in,
    r.check_out,
    room.number as room_number,
    g.name as guest_name
FROM reservations r
JOIN rooms room ON r.room_id = room.id
LEFT JOIN guests g ON r.guest_id = g.id
WHERE room.number IN ('101', '102')
  AND r.status = 'future'
ORDER BY r.check_in;

-- 4️⃣ VERIFICAR HISTÓRICO COMPLETO
SELECT 
    '4️⃣ HISTÓRICO COMPLETO' as secao,
    r.id as reservation_id,
    r.status,
    r.check_in,
    r.check_out,
    room.number as room_number,
    g.name as guest_name,
    r.created_at
FROM reservations r
JOIN rooms room ON r.room_id = room.id
LEFT JOIN guests g ON r.guest_id = g.id
WHERE room.number IN ('101', '102')
ORDER BY r.created_at DESC
LIMIT 10;

-- 5️⃣ VALIDAÇÕES E DIAGNÓSTICO
SELECT 
    '5️⃣ VALIDAÇÕES' as secao,
    number,
    CASE 
        WHEN amenities IS NULL THEN '❌ ERRO: Amenities NULL'
        WHEN array_length(amenities, 1) IS NULL THEN '❌ ERRO: Array vazio'
        WHEN array_length(amenities, 1) = 0 THEN '⚠️ AVISO: Nenhuma amenity'
        ELSE '✅ OK: ' || array_length(amenities, 1)::text || ' amenities'
    END as amenities_status,
    CASE 
        WHEN status = 'available' THEN '✅ OK: Disponível'
        WHEN status = 'occupied' THEN '🔴 Ocupado'
        WHEN status = 'maintenance' THEN '🛠️ Manutenção'
        ELSE '❌ Status inválido: ' || status
    END as status_check,
    CASE 
        WHEN price > 0 THEN '✅ OK: R$ ' || price::text
        ELSE '❌ ERRO: Preço inválido'
    END as price_check
FROM rooms 
WHERE number IN ('101', '102');

-- 6️⃣ VERIFICAR MÚLTIPLAS RESERVAS ATIVAS (INCONSISTÊNCIA)
SELECT 
    '6️⃣ MÚLTIPLAS RESERVAS ATIVAS' as secao,
    room.number,
    COUNT(*) as total_reservas_ativas,
    CASE 
        WHEN COUNT(*) > 1 THEN '❌ ERRO: Múltiplas reservas ativas para o mesmo quarto!'
        WHEN COUNT(*) = 1 THEN '✅ OK: Apenas 1 reserva ativa'
        ELSE '✅ OK: Nenhuma reserva ativa'
    END as status
FROM reservations r
JOIN rooms room ON r.room_id = room.id
WHERE room.number IN ('101', '102')
  AND r.status IN ('active', 'future')
GROUP BY room.number;

-- 7️⃣ VERIFICAR GUESTS ÓRFÃOS (SEM RELAÇÃO)
SELECT 
    '7️⃣ GUESTS ÓRFÃOS' as secao,
    r.id as reservation_id,
    r.guest_id,
    r.status,
    room.number,
    CASE 
        WHEN g.id IS NULL THEN '❌ ERRO: Guest não encontrado na tabela guests'
        ELSE '✅ OK: Guest existe'
    END as guest_status
FROM reservations r
JOIN rooms room ON r.room_id = room.id
LEFT JOIN guests g ON r.guest_id = g.id
WHERE room.number IN ('101', '102')
  AND r.status = 'active'
ORDER BY r.created_at DESC;

-- 8️⃣ VERIFICAR INCONSISTÊNCIA: Quarto disponível com reserva ativa
SELECT 
    '8️⃣ INCONSISTÊNCIAS' as secao,
    room.number,
    room.status as room_status,
    r.status as reservation_status,
    CASE 
        WHEN room.status = 'available' AND r.status = 'active' 
            THEN '❌ ERRO CRÍTICO: Quarto disponível mas tem reserva ativa!'
        WHEN room.status = 'occupied' AND r.status IS NULL 
            THEN '❌ ERRO: Quarto ocupado mas sem reserva ativa!'
        WHEN room.status = 'occupied' AND r.status = 'active' 
            THEN '✅ OK: Consistente'
        ELSE '⚠️ Verificar manualmente'
    END as diagnostico
FROM rooms room
LEFT JOIN reservations r ON r.room_id = room.id AND r.status = 'active'
WHERE room.number IN ('101', '102');
\`\`\`

---

## 🔧 SOLUÇÕES RÁPIDAS

### **Problema 1: Amenities inválido**

\`\`\`sql
-- Corrigir amenities NULL ou vazio
UPDATE rooms 
SET amenities = ARRAY['Wi-Fi', 'TV', 'Ar-condicionado']
WHERE number IN ('101', '102')
  AND (
    amenities IS NULL 
    OR array_length(amenities, 1) IS NULL 
    OR array_length(amenities, 1) = 0
  );
\`\`\`

---

### **Problema 2: Múltiplas reservas ativas**

\`\`\`sql
-- Ver todas as reservas ativas duplicadas
SELECT r.id, r.status, r.check_in, room.number, g.name
FROM reservations r
JOIN rooms room ON r.room_id = room.id
JOIN guests g ON r.guest_id = g.id
WHERE room.number IN ('101', '102')
  AND r.status IN ('active', 'future')
ORDER BY room.number, r.created_at DESC;

-- Cancelar a mais antiga (mantenha apenas a mais recente)
-- SUBSTITUA 'ID_DA_RESERVA_ANTIGA' pelo ID correto
UPDATE reservations 
SET status = 'cancelled' 
WHERE id = 'ID_DA_RESERVA_ANTIGA';
\`\`\`

---

### **Problema 3: Guest órfão (reserva sem guest)**

\`\`\`sql
-- Ver reservas com guest_id inválido
SELECT r.*, room.number
FROM reservations r
JOIN rooms room ON r.room_id = room.id
WHERE room.number IN ('101', '102')
  AND r.guest_id NOT IN (SELECT id FROM guests);

-- Cancelar essas reservas problemáticas
UPDATE reservations
SET status = 'cancelled'
WHERE id IN (
  SELECT r.id
  FROM reservations r
  JOIN rooms room ON r.room_id = room.id
  WHERE room.number IN ('101', '102')
    AND r.guest_id NOT IN (SELECT id FROM guests)
);
\`\`\`

---

### **Problema 4: Inconsistência de status**

\`\`\`sql
-- Sincronizar status do quarto com reservas ativas
UPDATE rooms
SET status = CASE
  WHEN EXISTS (
    SELECT 1 FROM reservations 
    WHERE room_id = rooms.id 
    AND status = 'active'
  ) THEN 'occupied'
  ELSE 'available'
END
WHERE number IN ('101', '102');
\`\`\`

---

### **Problema 5: Reset completo (ÚLTIMA OPÇÃO)**

\`\`\`sql
-- ⚠️ CUIDADO: Isso vai cancelar todas as reservas e resetar os quartos

-- 1. Cancelar todas as reservas ativas
UPDATE reservations
SET status = 'cancelled'
WHERE room_id IN (SELECT id FROM rooms WHERE number IN ('101', '102'))
  AND status IN ('active', 'future');

-- 2. Liberar os quartos
UPDATE rooms
SET status = 'available'
WHERE number IN ('101', '102');

-- 3. Verificar
SELECT 
  room.number,
  room.status,
  COUNT(r.id) as reservas_ativas
FROM rooms room
LEFT JOIN reservations r ON r.room_id = room.id AND r.status IN ('active', 'future')
WHERE room.number IN ('101', '102')
GROUP BY room.number, room.status;
\`\`\`

---

## 📱 TESTE NO NAVEGADOR

### **1. Abra o Console (F12)**

### **2. Acesse a página de Quartos**

\`\`\`
http://localhost:8080/dashboard/rooms
\`\`\`

### **3. Para testar "Erro ao carregar detalhes":**

1. Encontre o quarto 101 ou 102 (se estiver ocupado)
2. Clique em **"Detalhes"**
3. **Observe o console:**

**Se funcionar:**
\`\`\`
🔍 Carregando detalhes da reserva para room_id: abc-123
📥 Resultado da query: { data: {...}, error: null }
✅ Detalhes carregados: {...}
\`\`\`

**Se der erro:**
\`\`\`
🔍 Carregando detalhes da reserva para room_id: abc-123
📥 Resultado da query: { data: null, error: {...} }
❌ Erro na query: { message: "...", code: "..." }
\`\`\`

---

### **4. Para testar "Não consegue concluir":**

1. Vá em **Reservas** (menu lateral)
2. Encontre a reserva do quarto 101 ou 102
3. Clique em **"Check-out"**
4. **Observe o console:**

**Se funcionar:**
\`\`\`
✅ Completando reserva (Check-out): { reservationId: "...", roomId: "..." }
✅ Status da reserva atualizado para completed
🚪 Liberando quarto (status -> available)...
✅ Quarto liberado com sucesso!
🎉 Check-out concluído!
\`\`\`

**Se der erro:**
\`\`\`
✅ Completando reserva (Check-out): { reservationId: "...", roomId: "..." }
❌ Erro ao atualizar status da reserva: { message: "...", code: "PGRST116" }
\`\`\`

---

## 🎯 CHECKLIST DE DIAGNÓSTICO

Execute na ordem:

- [ ] 1. Execute o **SQL de diagnóstico completo**
- [ ] 2. Copie TODOS os resultados
- [ ] 3. Procure por ❌ (erros) nos resultados
- [ ] 4. Abra o navegador com Console (F12)
- [ ] 5. Tente clicar em "Detalhes" no quarto ocupado
- [ ] 6. Copie os logs do console
- [ ] 7. Vá em Reservas → Clique em "Check-out"
- [ ] 8. Copie os logs do console
- [ ] 9. Envie todos os resultados

---

## 🚨 ERROS MAIS COMUNS

### **1. PGRST116 - No rows found**
**Causa:** Usando \`.single()\` mas não há exatamente 1 resultado.  
**Fix:** Já corrigi usando \`.maybeSingle()\` no código!

### **2. Multiple rows returned**
**Causa:** Há mais de uma reserva ativa para o mesmo quarto.  
**Fix:** Use o SQL da seção "Problema 2" acima.

### **3. Foreign key violation**
**Causa:** guest_id ou room_id não existe.  
**Fix:** Use o SQL da seção "Problema 3" acima.

### **4. Null value in column**
**Causa:** Campo obrigatório está NULL.  
**Fix:** Use o SQL da seção "Problema 1" acima.

---

## 📞 PRÓXIMOS PASSOS

1. ✅ **Execute o SQL de diagnóstico**
2. ✅ **Copie todos os 8 resultados**
3. ✅ **Teste no navegador com console aberto**
4. ✅ **Copie os logs do console**
5. ✅ **Me envie tudo**

Com isso, vou identificar **exatamente** o que está errado! 🎯
