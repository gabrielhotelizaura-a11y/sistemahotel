# 🔓 SOLUÇÃO: Liberar Quartos 101 e 102

## ✅ 2 FORMAS DE RESOLVER

---

## 🖥️ **FORMA 1: Via Interface (MAIS FÁCIL)**

### **✨ NOVO! Botão "Liberar Quarto"**

Adicionei um botão vermelho nos quartos ocupados!

### **Passos:**

1. **Acesse:** http://localhost:8080/dashboard/rooms

2. **Encontre os quartos 101 e 102** (eles devem estar com badge vermelho "Ocupado")

3. **Clique no botão vermelho:** 🔓 **"Liberar Quarto"**

4. **Pronto!** ✅ O quarto será liberado automaticamente

### **O que o botão faz:**
- ✅ Cancela TODAS as reservas ativas/futuras do quarto
- ✅ Muda o status do quarto para "Disponível"
- ✅ Atualiza a interface automaticamente
- ✅ Mostra logs detalhados no console

### **Logs que você verá no console (F12):**
```
🔓 FORÇANDO liberação do quarto: { roomId: "...", roomNumber: "101" }
✅ Reservas canceladas
✅ Quarto liberado
```

---

## 💾 **FORMA 2: Via SQL (MAIS RÁPIDO)**

### **Acesse:** Supabase → SQL Editor → New Query

### **Cole este script:**

```sql
-- =====================================================
-- LIBERAR QUARTOS 101 E 102
-- =====================================================

-- 1️⃣ Cancelar todas as reservas ativas/futuras
UPDATE reservations
SET status = 'cancelled'
WHERE room_id IN (
    SELECT id FROM rooms WHERE number IN ('101', '102')
)
AND status IN ('active', 'future');

-- 2️⃣ Liberar os quartos
UPDATE rooms
SET status = 'available'
WHERE number IN ('101', '102');

-- 3️⃣ Corrigir amenities (se necessário)
UPDATE rooms 
SET amenities = ARRAY['Wi-Fi', 'TV', 'Ar-condicionado']
WHERE number IN ('101', '102')
  AND (amenities IS NULL OR array_length(amenities, 1) IS NULL);

-- ✅ VERIFICAÇÃO FINAL
SELECT 
    '✅ RESULTADO' as status,
    id,
    number,
    status,
    amenities
FROM rooms 
WHERE number IN ('101', '102');

-- Deve mostrar:
-- number | status     | amenities
-- 101    | available  | {Wi-Fi,TV,Ar-condicionado}
-- 102    | available  | {Wi-Fi,TV,Ar-condicionado}
```

### **Clique em "Run" ou pressione Ctrl+Enter**

---

## 🎯 **TESTE RÁPIDO**

### **Depois de liberar:**

1. **Recarregue a página de Quartos** (F5)

2. **Os quartos 101 e 102 devem estar:**
   - ✅ Badge **VERDE** com "Disponível"
   - ✅ Botão **"Reservar"** disponível
   - ✅ Sem botão "Detalhes"

3. **Teste fazer uma nova reserva:**
   - Clique em "Reservar"
   - Preencha os dados
   - Deve funcionar normalmente ✅

---

## 🔍 **VERIFICAR SE FUNCIONOU**

### **Via SQL:**

```sql
-- Ver status dos quartos
SELECT number, status 
FROM rooms 
WHERE number IN ('101', '102');

-- Resultado esperado:
-- 101 | available
-- 102 | available

-- Ver se ainda tem reservas ativas
SELECT r.status, room.number 
FROM reservations r
JOIN rooms room ON r.room_id = room.id
WHERE room.number IN ('101', '102')
  AND r.status IN ('active', 'future');

-- Resultado esperado: 0 linhas (nenhuma reserva ativa)
```

---

## 🚨 **SE AINDA NÃO FUNCIONAR**

### **Problema: Botão não aparece ou não funciona**

**Solução:**

1. **Recarregue a página** (Ctrl+R ou F5)
2. **Limpe o cache:** Ctrl+Shift+R (Windows/Linux) ou Cmd+Shift+R (Mac)
3. **Abra o console** (F12) e veja se há erros
4. **Use a Forma 2 (SQL)** como backup

---

### **Problema: SQL não funciona**

**Solução - Reset Completo:**

```sql
-- ⚠️ RESET TOTAL (use com cuidado)

-- 1. Deletar TODAS as reservas dos quartos (incluindo histórico)
DELETE FROM reservations
WHERE room_id IN (SELECT id FROM rooms WHERE number IN ('101', '102'));

-- 2. Resetar os quartos
UPDATE rooms
SET 
    status = 'available',
    amenities = ARRAY['Wi-Fi', 'TV', 'Ar-condicionado']
WHERE number IN ('101', '102');

-- 3. Verificar
SELECT * FROM rooms WHERE number IN ('101', '102');
```

---

### **Problema: Quartos não existem**

**Solução - Recriar:**

```sql
-- Deletar (se existir)
DELETE FROM rooms WHERE number IN ('101', '102');

-- Criar novamente
INSERT INTO rooms (number, type, capacity, beds, price, amenities, status)
VALUES 
    ('101', 'Standard', 2, 1, 150.00, ARRAY['Wi-Fi', 'TV', 'Ar-condicionado'], 'available'),
    ('102', 'Standard', 2, 1, 150.00, ARRAY['Wi-Fi', 'TV', 'Ar-condicionado'], 'available');

-- Verificar
SELECT * FROM rooms WHERE number IN ('101', '102');
```

---

## 📊 **DIAGNÓSTICO COMPLETO**

Se nada funcionar, rode este SQL para diagnóstico:

```sql
-- Ver tudo sobre os quartos 101 e 102
SELECT 
    'ROOMS' as tabela,
    r.id,
    r.number,
    r.status,
    r.amenities,
    (SELECT COUNT(*) FROM reservations res WHERE res.room_id = r.id AND res.status IN ('active', 'future')) as reservas_ativas
FROM rooms r
WHERE r.number IN ('101', '102')

UNION ALL

SELECT 
    'RESERVATIONS' as tabela,
    res.id,
    room.number,
    res.status,
    NULL as amenities,
    NULL as reservas_ativas
FROM reservations res
JOIN rooms room ON res.room_id = room.id
WHERE room.number IN ('101', '102')
ORDER BY tabela, number;
```

---

## 💡 **DICA PRO**

### **Para evitar esse problema no futuro:**

Sempre use o botão **"Check-out"** na página de **Reservas** para finalizar uma estadia.

### **Onde encontrar:**
```
Dashboard → Reservas → Botão "Check-out" (verde)
```

O check-out correto:
- ✅ Muda reserva para "completed"
- ✅ Libera o quarto automaticamente
- ✅ Mantém o histórico

---

## 🎯 **RESUMO**

### **✅ Jeito Fácil (Recomendado):**
1. Abra http://localhost:8080/dashboard/rooms
2. Clique no botão vermelho **"🔓 Liberar Quarto"** nos quartos 101 e 102
3. Pronto!

### **✅ Jeito Direto (SQL):**
1. Supabase → SQL Editor
2. Cole o script da seção "FORMA 2"
3. Execute
4. Pronto!

---

## 📞 **AINDA COM PROBLEMA?**

Me envie:
1. ✅ Print da tela dos quartos 101 e 102
2. ✅ Resultado do SQL de diagnóstico completo
3. ✅ Logs do console (F12) ao clicar em "Liberar Quarto"

---

**O botão "Liberar Quarto" já está disponível!** 🎉

**Teste agora:** http://localhost:8080/dashboard/rooms 🚀
