# 🔧 Como Testar e Ver os Logs de Debug

## ✅ Logs Adicionados ao Código

Adicionei logs detalhados em:
- ✅ `handleReservation` em Rooms.tsx
- ✅ `createReservation` em useReservations.tsx

---

## 📋 Passo a Passo para Testar

### **1. Abra o Console do Navegador**

**Chrome/Edge/Brave:**
- Pressione `F12` ou `Cmd+Option+I` (Mac)
- Clique na aba **Console**

**Safari:**
- `Cmd+Option+C`

---

### **2. Limpe o Console**

- Clique no ícone de 🗑️ (Clear console)
- Ou pressione `Cmd+K` (Mac) / `Ctrl+L` (Windows)

---

### **3. Tente Fazer uma Reserva no Quarto 101**

1. **Acesse:** http://localhost:8080
2. **Login**
3. **Vá em "Quartos"**
4. **Encontre o Quarto 101**
5. **Clique em "Reservar"**
6. **Preencha os dados:**
   - Nome: `Teste Debug`
   - Email: `teste@debug.com`
   - Check-in: Escolha amanhã
   - Check-out: Escolha depois de amanhã
   - Hóspedes: `1`

7. **Clique em "Confirmar Reserva"**

---

### **4. Observe os Logs no Console**

Você deverá ver uma sequência de logs assim:

```
🔍 DEBUG: Iniciando reserva... { selectedRoom: {...}, guestName: "Teste Debug", ... }
💰 Cálculo de preço: { days: 1, pricePerNight: 150, totalPrice: 150 }
📤 Enviando reserva para createReservation...
🏨 createReservation chamado com: { roomId: "...", guestData: {...}, ... }
📅 Tipo de reserva: { today: "...", checkInDate: "...", isFutureReservation: true, ... }
👤 Buscando guest por email: teste@debug.com
✅ Guest existente encontrado: abc-123 (OU ➕ Criando novo guest...)
📝 Criando reserva com dados: { room_id: "...", guest_id: "...", ... }
✅ Reserva criada no banco!
⏭️ Reserva futura - não atualizando status do quarto
🎉 Sucesso: Reserva futura criada com sucesso!
✅ Reserva criada com sucesso!
```

---

### **5. Se Aparecer ERRO:**

Você verá logs vermelhos tipo:

```
❌ ERRO COMPLETO ao criar reserva: {...}
❌ Error message: "duplicate key value violates unique constraint"
❌ Error details: "Key (guest_id, room_id) already exists"
❌ Error hint: "..."
```

---

## 🎯 O Que Fazer com os Logs

### **Cenário 1: Sucesso ✅**

Se você ver todos os logs verdes (✅) e o toast "Reserva criada com sucesso!":
- **O sistema está funcionando!**
- **O problema pode ser específico dos quartos 101 e 102**
- **Execute o diagnóstico SQL** (veja abaixo)

---

### **Cenário 2: Erro no Console ❌**

Se aparecer erro vermelho:

1. **Copie TODO o erro do console**
2. **Tire um print da mensagem**
3. **Procure por essas palavras-chave:**
   - `duplicate key` → Já existe reserva para esse guest/quarto
   - `violates foreign key constraint` → Room_id ou guest_id inválido
   - `null value in column` → Campo obrigatório faltando
   - `invalid input syntax` → Formato de data/número errado

---

## 🔍 Diagnóstico SQL Rápido

Se o erro estiver relacionado aos quartos 101 e 102, execute este SQL:

### **Acesse:** Supabase → SQL Editor → New Query

```sql
-- Verificar se os quartos existem e estão OK
SELECT 
  id,
  number,
  type,
  capacity,
  beds,
  price,
  status,
  amenities,
  CASE 
    WHEN amenities IS NULL OR array_length(amenities, 1) IS NULL THEN '❌ PROBLEMA: Amenities inválido'
    ELSE '✅ OK'
  END as amenities_check
FROM rooms 
WHERE number IN ('101', '102');

-- Ver se há reservas ativas bugadas
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

---

## 🛠️ Soluções Rápidas

### **Se o erro for: "amenities is not iterable"**

```sql
UPDATE rooms 
SET amenities = ARRAY['Wi-Fi', 'TV', 'Ar-condicionado']
WHERE number IN ('101', '102')
  AND (amenities IS NULL OR array_length(amenities, 1) IS NULL);
```

---

### **Se o erro for: "duplicate key constraint"**

Significa que já existe uma reserva ativa. Cancele primeiro:

```sql
-- Ver qual reserva está bugada
SELECT * FROM reservations 
WHERE room_id IN (SELECT id FROM rooms WHERE number IN ('101', '102'))
  AND status IN ('active', 'future');

-- Cancelar (substitua o ID)
UPDATE reservations 
SET status = 'cancelled' 
WHERE id = 'COLE_O_ID_AQUI';

-- Liberar o quarto
UPDATE rooms 
SET status = 'available' 
WHERE number IN ('101', '102');
```

---

### **Se o erro for: "room_id does not exist"**

Os quartos 101 ou 102 não existem no banco. Recrie:

```sql
-- Verificar se existem
SELECT id, number FROM rooms WHERE number IN ('101', '102');

-- Se não existir, criar:
INSERT INTO rooms (number, type, capacity, beds, price, amenities, status)
VALUES 
  ('101', 'Standard', 2, 1, 150.00, ARRAY['Wi-Fi', 'TV', 'Ar-condicionado'], 'available'),
  ('102', 'Standard', 2, 1, 150.00, ARRAY['Wi-Fi', 'TV', 'Ar-condicionado'], 'available');
```

---

## 📸 Screenshots Úteis

Quando você testar, tire prints de:

1. ✅ **Console do navegador** (com todos os logs)
2. ✅ **Mensagem de erro** (toast vermelho na tela)
3. ✅ **Aba Network** (F12 → Network → Filter: Fetch/XHR → Clique no request que falhou)
4. ✅ **Resultado do SQL de diagnóstico**

---

## 🎯 Teste Agora!

1. **Abra o navegador:** http://localhost:8080
2. **Pressione F12** (Console)
3. **Tente reservar o quarto 101**
4. **Observe os logs**
5. **Copie qualquer erro vermelho**

---

**Me envie:**
- ✅ Os logs do console (copie/cole o texto)
- ✅ A mensagem de erro (se houver)
- ✅ O resultado do SQL de diagnóstico

Com isso, vou identificar exatamente o problema! 🚀
