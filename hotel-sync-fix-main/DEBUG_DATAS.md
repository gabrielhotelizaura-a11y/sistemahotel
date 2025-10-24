# 🐛 DEBUG: Reservas com Data Errada

## 📅 Problema Reportado
- **Input:** Check-in: 10/10, Check-out: 11/10
- **Salvo:** Check-in: 09/10, Check-out: 10/10
- **Diferença:** -1 dia em ambos

## 🔍 Investigação

### Causa Raiz
O PostgreSQL coluna `DATE` pode sofrer conversão de timezone quando:
1. Browser envia string "2025-10-10"
2. PostgreSQL interpreta como "2025-10-10 00:00:00 UTC"
3. No Brasil (UTC-3), isso vira "2025-10-09 21:00:00"
4. PostgreSQL extrai apenas a data → "2025-10-09"

### Evidências no Código

#### ❌ Código Atual (com problema):
```typescript
// Input HTML:
<input type="date" value={checkIn} /> // "2025-10-10"

// Enviado para Supabase:
check_in: checkIn  // "2025-10-10" (string)

// PostgreSQL salva:
check_in: "2025-10-09" (após conversão timezone)
```

## ✅ Soluções Aplicadas

### 1. **Frontend: Enviar NULL para campos opcionais**
```typescript
// src/pages/dashboard/Rooms.tsx
{ 
  name: guestName, 
  email: guestEmail || '', 
  phone: guestPhone || null,  // ✅ Corrigido
  cpf: guestCpf || null       // ✅ Corrigido
}
```

### 2. **Backend: Trigger SQL para sanitizar dados**
```sql
-- supabase/migrations/20251009000000_fix_dates_and_optional_fields.sql
CREATE OR REPLACE FUNCTION public.sanitize_guest_data()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.cpf = '' THEN
    NEW.cpf := NULL;
  END IF;
  
  IF NEW.phone = '' THEN
    NEW.phone := NULL;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### 3. **Logs Detalhados Adicionados**
```typescript
// src/hooks/useReservations.tsx
console.log('📅 Check-in enviado:', checkIn);
console.log('📅 Check-out enviado:', checkOut);
console.log('📅 Timezone do navegador:', Intl.DateTimeFormat().resolvedOptions().timeZone);
console.log('📅 Check-in salvo no banco:', insertedData[0].check_in);
console.log('📅 Check-out salvo no banco:', insertedData[0].check_out);
```

## 🧪 Como Testar

### Teste 1: CPF Opcional
```
1. Abra um quarto disponível
2. Clique em "Reservar"
3. Preencha APENAS o nome (deixe CPF vazio)
4. Escolha datas
5. Clique em "Confirmar Reserva"
6. ✅ Não deve dar erro "CPF duplicado"
```

### Teste 2: Data Correta
```
1. Crie uma reserva para AMANHÃ (10/10)
2. Abra o Console (F12)
3. Veja os logs:
   📅 Check-in enviado: 2025-10-10
   📅 Timezone do navegador: America/Sao_Paulo
   📅 Check-in salvo no banco: ????
4. Verifique se a data salva está CORRETA
```

## 🔧 Próximos Passos

### Se a data AINDA estiver errada:

**Opção A: Forçar formato sem timezone**
```typescript
// Enviar como objeto Date com timezone explícito
const checkInDate = new Date(`${checkIn}T12:00:00-03:00`);
check_in: checkInDate.toISOString().split('T')[0]
```

**Opção B: Usar função SQL**
```sql
-- Alterar coluna para usar timezone awareness
ALTER TABLE public.reservations 
  ALTER COLUMN check_in TYPE DATE USING check_in AT TIME ZONE 'America/Sao_Paulo';
```

**Opção C: Mudar tipo de DATE para TEXT**
```sql
-- Salvar como texto puro (sem conversão)
ALTER TABLE public.reservations 
  ALTER COLUMN check_in TYPE TEXT;
```

## 📊 Status Atual

- ✅ CPF opcional corrigido (frontend + SQL trigger)
- ✅ Logs detalhados adicionados
- ⏳ Data correta aguardando teste (logs vão revelar problema exato)
- ⏳ Migration SQL criada (precisa ser aplicada no Supabase)

## 🚀 Ação Necessária

**VOCÊ PRECISA:**
1. Aplicar a migration SQL no Supabase Dashboard
2. Testar criar uma reserva
3. Verificar os logs no console (F12)
4. Me avisar o que aparece nos logs de data

**Veja o guia completo em:** `COMO_APLICAR_CORRECOES.md`
