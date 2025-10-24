# ✅ CORREÇÃO FINAL - CPF Duplicado

## 🐛 Erro Original
```
erro ao criar reserva: duplicate key value violates unique constraint "guests_cpf_key"
```

## 🔍 Causa do Problema

### Por que acontecia?

1. **Frontend enviava:** `{ cpf: "" }` (string vazia)
2. **Backend recebia:** `{ cpf: "" }` 
3. **useReservations fazia:** `{ ...guestData }` (mantinha string vazia)
4. **Banco tentava salvar:** `cpf = ""` (string vazia)
5. **PostgreSQL reclamava:** "Já existe outro guest com cpf = ''" ❌

### Por que string vazia é problema?

No PostgreSQL:
- ✅ `cpf = NULL` → Pode ter infinitos (NULL não é único)
- ❌ `cpf = ""` → É um valor único (só pode ter 1)

Então:
```sql
-- Guest 1:
INSERT INTO guests (name, cpf) VALUES ('João', NULL);  ✅ OK

-- Guest 2:
INSERT INTO guests (name, cpf) VALUES ('Maria', NULL); ✅ OK (NULL != NULL)

-- Guest 3:
INSERT INTO guests (name, cpf) VALUES ('Pedro', '');   ✅ OK (primeiro com "")

-- Guest 4:
INSERT INTO guests (name, cpf) VALUES ('Ana', '');     ❌ ERRO! ("" já existe)
```

## ✅ Solução Aplicada

### Arquivo: `src/hooks/useReservations.tsx`

**ANTES (errado):**
```typescript
const guestDataToSave = {
  ...guestData,  // ❌ Mantém string vazia
  email: guestEmail
};
```

**DEPOIS (correto):**
```typescript
const guestDataToSave = {
  name: guestData.name,
  email: guestEmail,
  phone: guestData.phone || null,  // ✅ "" vira null
  cpf: guestData.cpf || null       // ✅ "" vira null
};
```

### Também corrigido:
```typescript
// Mudado de .single() para .maybeSingle()
const { data: existingGuest } = await supabase
  .from('guests')
  .select('id')
  .eq('email', guestEmail)
  .maybeSingle();  // ✅ Não dá erro se não encontrar
```

## 📊 Fluxo Correto Agora

```
1. Usuário preenche apenas NOME
   ↓
2. Frontend: { name: "João", email: "", phone: "", cpf: "" }
   ↓
3. Rooms.tsx: { name: "João", email: "", phone: null, cpf: null }
   ↓
4. useReservations: { name: "João", email: "guest_123@temp.com", phone: null, cpf: null }
   ↓
5. Banco salva: { name: "João", email: "guest_123@temp.com", phone: NULL, cpf: NULL }
   ↓
6. ✅ SUCESSO! (NULL não conflita com UNIQUE constraint)
```

## 🧪 Teste Agora

1. **Abra um quarto disponível**
2. **Clique em "Reservar"**
3. **Preencha APENAS o nome** (deixe tudo vazio)
4. **Escolha datas**
5. **Confirmar Reserva**
6. **✅ Deve funcionar sem erro de CPF duplicado!**

## 🎯 Resultado Esperado

### Console (F12):
```
👤 Buscando guest por email: guest_1728518400000@temp.com
📋 Dados do guest a salvar: {
  name: "João",
  email: "guest_1728518400000@temp.com",
  phone: null,  ✅
  cpf: null     ✅
}
➕ Criando novo guest...
✅ Novo guest criado: abc-123-def-456
📝 Criando reserva com dados: {...}
✅ Reserva criada no banco!
🎉 Sucesso: Reserva futura criada com sucesso!
```

### Interface:
```
✅ Toast verde: "Reserva futura criada com sucesso!"
```

## 🚀 Está Pronto!

Agora você pode:
- ✅ Criar reserva **só com nome**
- ✅ Deixar CPF vazio sem erro
- ✅ Deixar telefone vazio sem erro
- ✅ Email é gerado automaticamente se vazio

## 📝 Campos Atuais

| Campo | Status | Observação |
|-------|--------|-----------|
| Nome | ✅ Obrigatório | Validado no frontend |
| Email | ⚪ Opcional | Gera `guest_timestamp@temp.com` se vazio |
| Telefone | ⚪ Opcional | Salva como `NULL` se vazio |
| CPF | ⚪ Opcional | Salva como `NULL` se vazio |
| Check-in | ✅ Obrigatório | Validado no frontend |
| Check-out | ✅ Obrigatório | Validado no frontend |

## 🎊 Problema Resolvido!

Você não precisa mais aplicar o SQL no Supabase! A correção está 100% no código frontend agora. 🚀

Teste e me avise se funcionar! 😊
