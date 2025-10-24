# 🔍 Diagnóstico: Quartos 101 e 102 com Problema de Reserva

## ❌ **Problema Reportado**
Não é possível concluir reservas para os quartos 101 e 102.

---

## 🔧 **Verificações Necessárias**

### 1. **Verificar dados dos quartos no banco**

Acesse o Supabase SQL Editor e execute:

```sql
-- Ver detalhes dos quartos 101 e 102
SELECT 
  id,
  number,
  type,
  capacity,
  beds,
  price,
  status,
  amenities,
  description,
  created_at
FROM rooms 
WHERE number IN ('101', '102');
```

**O que verificar:**
- ✅ Os quartos existem?
- ✅ O campo `amenities` é um array válido?
- ✅ O campo `price` é um número válido?
- ✅ O `status` é 'available'?

---

### 2. **Verificar reservas existentes**

```sql
-- Ver se há reservas ativas/pendentes para esses quartos
SELECT 
  r.id,
  r.status,
  r.check_in,
  r.check_out,
  room.number as room_number,
  g.name as guest_name
FROM reservations r
JOIN rooms room ON r.room_id = room.id
LEFT JOIN guests g ON r.guest_id = g.id
WHERE room.number IN ('101', '102')
  AND r.status IN ('active', 'future')
ORDER BY r.created_at DESC;
```

**O que verificar:**
- ❌ Se retornar resultados, o quarto já tem reserva ativa
- ✅ Se não retornar, o quarto está livre

---

### 3. **Verificar estrutura de amenities**

```sql
-- Verificar se amenities tem formato correto
SELECT 
  number,
  amenities,
  pg_typeof(amenities) as type
FROM rooms 
WHERE number IN ('101', '102');
```

**Formato esperado:**
```json
["Wi-Fi", "TV", "Ar-condicionado"]
```

---

### 4. **Verificar console do navegador**

Abra o Developer Tools (F12) e veja se aparece:

#### **Erros comuns:**
```
❌ "Cannot read property 'id' of undefined"
❌ "amenities is not iterable"
❌ "Invalid room data"
❌ "Failed to create reservation"
❌ "duplicate key value violates unique constraint"
```

---

## 🛠️ **Soluções Possíveis**

### **Solução 1: Amenities inválido**

Se o array de amenities estiver vazio ou null:

```sql
-- Corrigir amenities vazios
UPDATE rooms 
SET amenities = ARRAY['Wi-Fi', 'TV', 'Ar-condicionado']
WHERE number IN ('101', '102')
  AND (amenities IS NULL OR array_length(amenities, 1) IS NULL);
```

---

### **Solução 2: Status incorreto**

Se o status não for 'available':

```sql
-- Resetar status para disponível
UPDATE rooms 
SET status = 'available'
WHERE number IN ('101', '102');
```

---

### **Solução 3: Reserva fantasma**

Se houver uma reserva "presa" no banco:

```sql
-- Ver reservas problemáticas
SELECT * FROM reservations 
WHERE room_id IN (
  SELECT id FROM rooms WHERE number IN ('101', '102')
)
AND status NOT IN ('completed', 'cancelled');

-- Se encontrar, cancelar manualmente:
UPDATE reservations
SET status = 'cancelled'
WHERE id = 'ID_DA_RESERVA_AQUI';

-- Depois liberar o quarto:
UPDATE rooms
SET status = 'available'
WHERE number IN ('101', '102');
```

---

### **Solução 4: Recriar os quartos**

Se nada funcionar, delete e recrie:

```sql
-- CUIDADO: Só faça se NÃO houver histórico de reservas importantes

-- 1. Backup dos dados
SELECT * FROM rooms WHERE number IN ('101', '102');

-- 2. Deletar
DELETE FROM rooms WHERE number IN ('101', '102');

-- 3. Recriar
INSERT INTO rooms (number, type, capacity, beds, price, amenities, status, description)
VALUES 
  ('101', 'Standard', 2, 1, 150.00, ARRAY['Wi-Fi', 'TV', 'Ar-condicionado'], 'available', 'Quarto standard renovado'),
  ('102', 'Standard', 2, 1, 150.00, ARRAY['Wi-Fi', 'TV', 'Ar-condicionado'], 'available', 'Quarto standard renovado');
```

---

## 🧪 **Teste Manual**

### **Passo a Passo:**

1. **Abra:** http://localhost:8080
2. **Login como admin**
3. **Vá em Quartos**
4. **Encontre o quarto 101**
5. **Abra o console do navegador (F12)**
6. **Clique em "Reservar"**
7. **Preencha:**
   - Nome: Teste Debug
   - Email: teste@debug.com
   - Check-in: Amanhã
   - Check-out: Depois de amanhã
   - Hóspedes: 1

8. **Clique em "Confirmar Reserva"**

9. **Observe:**
   - ✅ Apareceu mensagem de sucesso?
   - ❌ Apareceu erro no toast?
   - ❌ Apareceu erro no console?

---

## 📋 **Checklist de Debug**

Execute na ordem:

- [ ] Ver dados dos quartos 101 e 102 no SQL Editor
- [ ] Verificar se amenities é um array válido
- [ ] Verificar se não há reserva ativa
- [ ] Verificar status = 'available'
- [ ] Abrir console do navegador (F12)
- [ ] Tentar fazer reserva e observar erros
- [ ] Copiar mensagem de erro completa
- [ ] Verificar aba Network → Filter: Fetch/XHR
- [ ] Ver se request para Supabase falhou

---

## 🔍 **Script de Diagnóstico Completo**

Cole este SQL para fazer diagnóstico completo:

```sql
-- ========================================
-- DIAGNÓSTICO COMPLETO: Quartos 101 e 102
-- ========================================

-- 1. Dados dos quartos
SELECT 
  '=== DADOS DOS QUARTOS ===' as section,
  id,
  number,
  type,
  capacity,
  beds,
  price,
  status,
  amenities,
  array_length(amenities, 1) as amenities_count,
  created_at
FROM rooms 
WHERE number IN ('101', '102');

-- 2. Reservas ativas
SELECT 
  '=== RESERVAS ATIVAS ===' as section,
  r.id,
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
  AND r.status IN ('active', 'future')
ORDER BY r.created_at DESC;

-- 3. Histórico completo de reservas
SELECT 
  '=== HISTÓRICO COMPLETO ===' as section,
  r.id,
  r.status,
  r.check_in,
  r.check_out,
  r.total_price,
  room.number as room_number,
  g.name as guest_name,
  r.created_at
FROM reservations r
JOIN rooms room ON r.room_id = room.id
LEFT JOIN guests g ON r.guest_id = g.id
WHERE room.number IN ('101', '102')
ORDER BY r.created_at DESC
LIMIT 10;

-- 4. Validações
SELECT 
  '=== VALIDAÇÕES ===' as section,
  number,
  CASE 
    WHEN amenities IS NULL THEN '❌ Amenities NULL'
    WHEN array_length(amenities, 1) IS NULL THEN '❌ Amenities vazio'
    WHEN array_length(amenities, 1) = 0 THEN '❌ Amenities sem itens'
    ELSE '✅ Amenities OK (' || array_length(amenities, 1)::text || ' itens)'
  END as amenities_status,
  CASE 
    WHEN status = 'available' THEN '✅ Status OK'
    ELSE '❌ Status: ' || status
  END as status_check,
  CASE 
    WHEN price > 0 THEN '✅ Preço OK (R$ ' || price::text || ')'
    ELSE '❌ Preço inválido'
  END as price_check
FROM rooms 
WHERE number IN ('101', '102');
```

---

## 💡 **Erro mais Comum**

### **"amenities is not iterable"**

**Causa:** O campo `amenities` não é um array válido.

**Fix rápido:**
```sql
UPDATE rooms 
SET amenities = ARRAY['Wi-Fi', 'TV', 'Ar-condicionado']
WHERE number IN ('101', '102')
  AND (
    amenities IS NULL 
    OR array_length(amenities, 1) IS NULL 
    OR array_length(amenities, 1) = 0
  );
```

---

## 📞 **Próximos Passos**

1. **Execute o script de diagnóstico completo**
2. **Copie os resultados aqui**
3. **Copie qualquer erro do console do navegador**
4. **Diga qual erro aparece no toast (se houver)**

Com essas informações, posso identificar exatamente o problema! 🎯
