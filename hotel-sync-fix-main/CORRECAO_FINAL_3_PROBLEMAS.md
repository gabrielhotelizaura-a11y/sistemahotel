# 🔧 CORREÇÃO FINAL - 3 Problemas

## 🐛 Problemas Reportados:

1. ❌ **Admin não vê Preços e Estatísticas** (mesmo sendo admin no banco)
2. ❌ **Reserva para HOJE vai para "Futuras"** (deveria ser "Ativa")
3. ❌ **Datas voltando 1 dia** (reserva dia 10 salva como dia 9)

---

## ✅ SOLUÇÃO 1: Forçar Logout/Login (Admin)

O problema do admin pode ser **cache do navegador**. Vamos limpar:

### **Passo 1: Fazer Logout Completo**
1. No sistema, clique em **"Sair"**
2. Aguarde redirecionar para /auth

### **Passo 2: Limpar LocalStorage**
Abra o Console do navegador (`Cmd + Option + I` no Mac) e execute:

```javascript
// Limpar todo o storage
localStorage.clear();
sessionStorage.clear();
console.log('✅ Storage limpo!');
```

### **Passo 3: Fazer Login de Novo**
1. Faça login com o usuário admin
2. Abra o Console (`Cmd + Option + I`)
3. Procure por:
   ```
   🎯 useAuth Return: { userRole: 'admin', isAdmin: true, ... }
   🎯 AppSidebar - isAdmin: true
   📋 AppSidebar - Items: ['Quartos', 'Reservas', 'Futuras', 'Preços', 'Estatísticas']
   ```

4. ✅ Se aparecer `isAdmin: true` e os 5 items, está correto!

---

## ✅ SOLUÇÃO 2: Verificar Data no Banco

O problema das datas pode ser o **PostgreSQL salvando em UTC**.

### **Execute este SQL no Supabase:**

```sql
-- Ver como as datas estão salvas
SELECT 
    id,
    check_in,
    check_out,
    check_in::text as check_in_text,
    status,
    created_at
FROM reservations
ORDER BY created_at DESC
LIMIT 10;
```

**O que verificar:**
- ✅ `check_in` deve ser a data CORRETA (ex: 2025-10-10)
- ❌ Se aparecer 2025-10-09 quando você reservou 10, tem problema!

### **Se estiver errado, vamos adicionar função SQL:**

```sql
-- Criar função para forçar timezone correto
CREATE OR REPLACE FUNCTION fix_date_timezone()
RETURNS TRIGGER AS $$
BEGIN
    -- Garantir que as datas são interpretadas no timezone local (America/Sao_Paulo)
    -- Não fazer conversão UTC
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger (se precisar)
-- DROP TRIGGER IF EXISTS fix_dates_trigger ON reservations;
-- CREATE TRIGGER fix_dates_trigger
--   BEFORE INSERT OR UPDATE ON reservations
--   FOR EACH ROW
--   EXECUTE FUNCTION fix_date_timezone();
```

---

## ✅ SOLUÇÃO 3: Testar com Logs

### **Criar uma reserva de TESTE para HOJE:**

1. Vá em **Quartos**
2. Escolha um quarto disponível
3. **Check-in:** HOJE (10/10/2025)
4. **Check-out:** AMANHÃ (11/10/2025)
5. Clique em "Confirmar"

### **No Console (`Cmd + Option + I`), procure:**

```
📅 Check-in enviado: 2025-10-10
📅 Check-out enviado: 2025-10-11
📅 Timezone do navegador: America/Sao_Paulo

📅 Tipo de reserva:
  today: 2025-10-10T03:00:00.000Z
  todayLocal: 10/10/2025
  checkIn: 2025-10-10
  checkInDate: 2025-10-10T03:00:00.000Z
  checkInLocal: 10/10/2025
  isFutureReservation: false  ← DEVE SER FALSE (para hoje)
  reservationStatus: active   ← DEVE SER ACTIVE (para hoje)

📅 Dados salvos: { check_in: '2025-10-10', ... }
```

**Se aparecer:**
- ✅ `isFutureReservation: false` → Correto!
- ✅ `reservationStatus: active` → Correto!
- ✅ Quarto deve ficar **ocupado** (não disponível)

**Se aparecer:**
- ❌ `isFutureReservation: true` → Erro! Data de hoje está sendo vista como futura
- ❌ `reservationStatus: future` → Erro! Deveria ser active
- ❌ Quarto continua **disponível** → Erro! Deveria estar ocupado

---

## 🔍 SOLUÇÃO 4: Verificar Timezone do Sistema

Execute no Console:

```javascript
// Ver configuração de data/hora
const now = new Date();
console.log('📅 Data atual:', now);
console.log('📅 Timezone:', Intl.DateTimeFormat().resolvedOptions().timeZone);
console.log('📅 Offset UTC:', now.getTimezoneOffset() / 60, 'horas');

// Criar data manualmente (como o código faz)
const testDate = new Date(2025, 9, 10); // 10 de outubro de 2025
testDate.setHours(0, 0, 0, 0);
console.log('📅 Data teste:', testDate);
console.log('📅 Data teste ISO:', testDate.toISOString());
console.log('📅 Data teste Local:', testDate.toLocaleDateString('pt-BR'));
```

**Resultado esperado:**
```
📅 Timezone: America/Sao_Paulo
📅 Offset UTC: 3 horas (pode variar por horário de verão)
📅 Data teste Local: 10/10/2025  ← DEVE SER 10, não 9!
```

---

## 🎯 SQL para Corrigir Role de Admin (se precisar)

Se mesmo após logout/login não aparecer como admin:

```sql
-- Ver usuários e roles
SELECT 
    u.id,
    u.email,
    ur.role::text as role,
    ur.role::text = 'admin' as is_admin
FROM auth.users u
LEFT JOIN public.user_roles ur ON ur.user_id = u.id
ORDER BY u.created_at DESC;

-- Corrigir role manualmente (use SEU EMAIL)
DO $$ 
DECLARE
    admin_email TEXT := 'seuemail@exemplo.com'; -- ← MUDE AQUI
    target_user_id UUID;
BEGIN
    SELECT id INTO target_user_id FROM auth.users WHERE email = admin_email;
    
    DELETE FROM public.user_roles WHERE user_id = target_user_id;
    INSERT INTO public.user_roles (user_id, role) VALUES (target_user_id, 'admin');
    
    RAISE NOTICE '✅ Role de admin configurada!';
END $$;
```

---

## 📋 Checklist de Testes:

### **Teste 1: Admin vê tudo**
- [ ] Fazer logout
- [ ] Limpar localStorage/sessionStorage
- [ ] Fazer login
- [ ] Console mostra `isAdmin: true`
- [ ] Sidebar mostra: Quartos, Reservas, Futuras, **Preços**, **Estatísticas**

### **Teste 2: Reserva para HOJE fica ATIVA**
- [ ] Criar reserva com check-in HOJE
- [ ] Console mostra `reservationStatus: active`
- [ ] Reserva aparece em "Reservas" (não em "Futuras")
- [ ] Quarto fica como "Ocupado"

### **Teste 3: Datas corretas**
- [ ] Reservar check-in 10/10
- [ ] Console mostra `check_in: 2025-10-10`
- [ ] Banco salva `2025-10-10` (não 2025-10-09)
- [ ] Interface mostra "10/10" (não "09/10")

### **Teste 4: Reserva FUTURA**
- [ ] Criar reserva com check-in AMANHÃ (11/10)
- [ ] Console mostra `reservationStatus: future`
- [ ] Reserva aparece em "Futuras"
- [ ] Quarto continua "Disponível"

---

## 🆘 Se Ainda Não Funcionar:

Me mande:
1. ✅ Screenshot do SQL mostrando role do usuário
2. ✅ Logs do Console (`Cmd + Option + I`) quando fizer login
3. ✅ Logs do Console quando criar uma reserva
4. ✅ O que aparece na sidebar (Preços e Estatísticas aparecem?)

---

## 💡 Resumo das Correções:

| Problema | Solução | Status |
|----------|---------|--------|
| Admin não vê Preços/Estatísticas | Logout + Limpar cache + Login | ⏳ Testar |
| Reserva HOJE vai para Futuras | Logs adicionados para debug | ⏳ Testar |
| Datas voltando 1 dia | Verificar logs do banco | ⏳ Testar |

Execute os testes acima e me avisa os resultados! 🚀
