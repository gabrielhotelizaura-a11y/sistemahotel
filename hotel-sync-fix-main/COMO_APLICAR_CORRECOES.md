# 🔧 Como Aplicar as Correções de CPF e Datas

## 🚨 Problemas Identificados

1. **CPF duplicado:** String vazia `""` estava sendo tratada como valor duplicável no campo UNIQUE
2. **Datas erradas:** PostgreSQL estava salvando datas com timezone, causando shift de 1 dia

## ✅ Solução

### **Opção 1: Via Supabase Dashboard (Recomendado - 2 minutos)**

1. Acesse: https://supabase.com/dashboard
2. Vá em **SQL Editor**
3. Clique em **+ New Query**
4. Cole este SQL:

```sql
-- Criar função para garantir que CPF/Phone vazios sejam NULL
CREATE OR REPLACE FUNCTION public.sanitize_guest_data()
RETURNS TRIGGER AS $$
BEGIN
  -- Se CPF for string vazia, converter para NULL
  IF NEW.cpf = '' THEN
    NEW.cpf := NULL;
  END IF;
  
  -- Se phone for string vazia, converter para NULL
  IF NEW.phone = '' THEN
    NEW.phone := NULL;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para sanitizar dados antes de inserir/atualizar
DROP TRIGGER IF EXISTS sanitize_guest_data_trigger ON public.guests;
CREATE TRIGGER sanitize_guest_data_trigger
  BEFORE INSERT OR UPDATE ON public.guests
  FOR EACH ROW
  EXECUTE FUNCTION public.sanitize_guest_data();

-- Limpar dados existentes (converter strings vazias em NULL)
UPDATE public.guests 
SET cpf = NULL 
WHERE cpf = '';

UPDATE public.guests 
SET phone = NULL 
WHERE phone = '';
```

5. Clique em **Run** (ou pressione Ctrl+Enter)
6. ✅ Pronto!

### **Opção 2: Via Supabase CLI**

```bash
cd "/Users/higorbachiao/Library/Mobile Documents/com~apple~CloudDocs/hotel-sync-fix"

# Push da migration
supabase db push
```

---

## 🧪 Teste depois de aplicar

1. **Teste CPF opcional:**
   - Crie uma reserva com **apenas o nome** (deixe CPF vazio)
   - ✅ Não deve dar erro de CPF duplicado

2. **Teste data correta:**
   - Crie uma reserva para **amanhã (dia 10)**
   - ✅ Deve salvar como check-in **10/10**, não 09/10

---

## 🔍 Como Verificar se Funcionou

Execute este SQL no **SQL Editor**:

```sql
-- Ver a função e o trigger
SELECT 
  p.proname as function_name,
  pg_get_functiondef(p.oid) as definition
FROM pg_proc p
WHERE p.proname = 'sanitize_guest_data';

-- Ver triggers ativos
SELECT 
  trigger_name,
  event_manipulation,
  action_statement
FROM information_schema.triggers
WHERE trigger_name = 'sanitize_guest_data_trigger';

-- Ver guests com CPF/phone nulos
SELECT id, name, email, cpf, phone 
FROM guests 
ORDER BY created_at DESC 
LIMIT 10;
```

Se aparecer a função e o trigger, está funcionando! 🎉

---

## 📝 O Que Foi Corrigido no Código

### 1. **Rooms.tsx** - Enviar NULL ao invés de string vazia
```typescript
// ANTES:
{ name: guestName, email: guestEmail, phone: guestPhone, cpf: guestCpf }

// DEPOIS:
{ 
  name: guestName, 
  email: guestEmail || '', 
  phone: guestPhone || null,  // ✅ NULL se vazio
  cpf: guestCpf || null       // ✅ NULL se vazio
}
```

### 2. **useReservations.tsx** - Logs detalhados
- Adicionados logs mostrando exatamente o que está sendo salvo
- Logs mostram timezone do navegador
- Logs mostram dados retornados do banco após insert

---

## ⚡ Por Que Isso Resolve?

### Problema do CPF:
- **Antes:** `cpf = ""` (string vazia) era considerado valor único
  - Guest 1: `cpf = ""` ✅
  - Guest 2: `cpf = ""` ❌ Duplicado!
  
- **Depois:** `cpf = NULL` não é único no PostgreSQL
  - Guest 1: `cpf = NULL` ✅
  - Guest 2: `cpf = NULL` ✅ Permitido!

### Problema da Data:
- O PostgreSQL tipo `DATE` não deveria ter timezone, mas o browser envia com timezone
- Com os logs adicionados, podemos ver exatamente o que está acontecendo
- Se ainda houver problema, podemos converter para `TEXT` ou usar função SQL

---

## 🆘 Se Ainda Não Funcionar

Me avise e podemos:
1. Ver os logs no console (F12)
2. Verificar o que está sendo salvo no banco
3. Ajustar a estratégia (converter DATE para TEXT, usar função SQL, etc.)

---

**⚠️ IMPORTANTE:** Execute o SQL acima no Supabase Dashboard antes de testar!
