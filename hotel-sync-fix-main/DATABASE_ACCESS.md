# 🗄️ Guia de Acesso ao Banco de Dados

## 📊 Via Supabase Dashboard (Interface Visual)

### Passo a Passo:

1. **Acesse:** https://supabase.com/dashboard
2. **Login** com sua conta
3. **Selecione** seu projeto

### Principais Seções:

#### 📋 **Table Editor** - Ver e editar dados
```
Menu → Table Editor → Selecione uma tabela
```
- `guests` - Hóspedes cadastrados
- `reservations` - Todas as reservas
- `rooms` - Quartos do hotel
- `user_roles` - Funções dos usuários (admin, funcionario)
- `expenses` - Despesas (se usar)
- `profiles` - Perfis de usuários

**Dicas:**
- Clique em qualquer célula para editar
- Use o botão "+ Insert row" para adicionar
- Filtros no topo da tabela
- Export para CSV/JSON

#### 💻 **SQL Editor** - Executar queries SQL
```
Menu → SQL Editor → New Query
```

**Queries Úteis:**

```sql
-- Ver todas as reservas ativas
SELECT 
  r.*,
  g.name as guest_name,
  rm.number as room_number
FROM reservations r
JOIN guests g ON r.guest_id = g.id
JOIN rooms rm ON r.room_id = rm.id
WHERE r.status = 'active';

-- Ver reservas futuras
SELECT * FROM reservations 
WHERE status = 'future'
ORDER BY check_in;

-- Ver quartos disponíveis
SELECT * FROM rooms 
WHERE status = 'available';

-- Ver total de receita do mês
SELECT 
  SUM(total_price) as total_revenue,
  COUNT(*) as total_reservations
FROM reservations
WHERE created_at >= date_trunc('month', NOW())
  AND status != 'cancelled';

-- Ver hóspedes mais frequentes
SELECT 
  g.name,
  g.email,
  COUNT(r.id) as total_reservations
FROM guests g
JOIN reservations r ON r.guest_id = g.id
GROUP BY g.id, g.name, g.email
ORDER BY total_reservations DESC
LIMIT 10;

-- Criar primeiro usuário admin
-- (Execute DEPOIS de criar usuário no app)
UPDATE user_roles 
SET role = 'admin' 
WHERE user_id = (
  SELECT id FROM auth.users 
  WHERE email = 'seu-email@exemplo.com'
);

-- Ver todos os usuários e suas roles
SELECT 
  au.email,
  ur.role,
  au.created_at
FROM auth.users au
LEFT JOIN user_roles ur ON ur.user_id = au.id
ORDER BY au.created_at DESC;
```

#### 🔐 **Authentication** - Gerenciar usuários
```
Menu → Authentication → Users
```
- Ver todos os usuários cadastrados
- Email e data de criação
- Status (confirmado/pendente)
- Deletar ou editar usuários

#### 📊 **Database** - Estrutura do banco
```
Menu → Database → Tables
```
- Ver schema das tabelas
- Colunas, tipos, constraints
- Relationships (foreign keys)
- Indexes

#### 🔒 **Policies** - Segurança RLS
```
Menu → Authentication → Policies
```
- Ver todas as políticas RLS
- Testar permissões
- Criar novas políticas

---

## 💻 Via Código (No Projeto)

### 1. **Usando o Supabase Client (Já configurado)**

O arquivo `src/integrations/supabase/client.ts` já está configurado!

```typescript
import { supabase } from '@/integrations/supabase/client';

// Ver todas as reservas
const { data, error } = await supabase
  .from('reservations')
  .select('*');

// Com JOIN (relacionamento)
const { data, error } = await supabase
  .from('reservations')
  .select(`
    *,
    guest:guests(*),
    room:rooms(*)
  `);

// Filtrar
const { data, error } = await supabase
  .from('reservations')
  .select('*')
  .eq('status', 'active')
  .order('check_in', { ascending: true });

// Inserir
const { data, error } = await supabase
  .from('guests')
  .insert({
    name: 'João Silva',
    email: 'joao@email.com',
    phone: '(11) 98765-4321'
  });

// Atualizar
const { data, error } = await supabase
  .from('rooms')
  .update({ status: 'maintenance' })
  .eq('id', 'room-id-aqui');

// Deletar
const { data, error } = await supabase
  .from('reservations')
  .delete()
  .eq('id', 'reservation-id-aqui');
```

### 2. **Criar um Script de Debug**

Crie um arquivo `src/scripts/db-test.ts`:

```typescript
import { supabase } from '@/integrations/supabase/client';

async function testDatabase() {
  console.log('🔍 Testando conexão com banco...');

  // Testar conexão
  const { data: rooms, error } = await supabase
    .from('rooms')
    .select('*');

  if (error) {
    console.error('❌ Erro:', error);
  } else {
    console.log('✅ Conexão OK!');
    console.log('📊 Quartos:', rooms);
  }

  // Ver todas as reservas
  const { data: reservations } = await supabase
    .from('reservations')
    .select(`
      *,
      guest:guests(name, email),
      room:rooms(number, type)
    `)
    .limit(10);

  console.log('📋 Últimas 10 reservas:', reservations);
}

testDatabase();
```

---

## 🗄️ Via Ferramenta Externa (Cliente PostgreSQL)

### **Opção A: DBeaver (Grátis e Completo)**

1. **Baixe:** https://dbeaver.io/download/
2. **Instale** o DBeaver Community
3. **Nova Conexão:**
   - Database → New Connection
   - Selecione **PostgreSQL**

4. **Credenciais (pegue no Supabase Dashboard):**
   ```
   Menu → Settings → Database → Connection info
   
   Host:     db.xxxxxxx.supabase.co
   Port:     5432
   Database: postgres
   User:     postgres
   Password: [sua senha do projeto]
   ```

5. **Teste** e conecte!

### **Opção B: TablePlus (Interface Bonita - Mac/Windows)**

1. **Baixe:** https://tableplus.com/
2. **Nova Conexão → PostgreSQL**
3. **Use as mesmas credenciais** do Supabase

### **Opção C: psql (Terminal)**

```bash
# Instale o PostgreSQL client
brew install postgresql  # macOS
# ou
sudo apt install postgresql-client  # Linux

# Conecte (pegue a connection string no Supabase)
psql "postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:5432/postgres"

# Comandos úteis:
\dt              # Listar tabelas
\d reservations  # Descrever tabela
SELECT * FROM rooms;
\q               # Sair
```

---

## 🔑 Onde Encontrar as Credenciais?

### No Supabase Dashboard:

1. **Project URL e Keys:**
   ```
   Settings → API
   - Project URL
   - anon/public key
   - service_role key (NUNCA exponha!)
   ```

2. **Database Password:**
   ```
   Settings → Database → Connection string
   - Clique em "Reset database password" se esqueceu
   ```

3. **Connection Info:**
   ```
   Settings → Database → Connection info
   - Host
   - Port
   - Database name
   - User
   ```

---

## 📊 Queries Prontas para Usar

### Ver Estatísticas do Hotel:

```sql
-- Dashboard resumo
SELECT 
  (SELECT COUNT(*) FROM rooms) as total_rooms,
  (SELECT COUNT(*) FROM rooms WHERE status = 'available') as available_rooms,
  (SELECT COUNT(*) FROM reservations WHERE status = 'active') as active_reservations,
  (SELECT COUNT(*) FROM reservations WHERE status = 'future') as future_reservations,
  (SELECT SUM(total_price) FROM reservations WHERE status != 'cancelled') as total_revenue;
```

### Ver Quartos com Próxima Disponibilidade:

```sql
SELECT 
  r.*,
  COALESCE(
    (SELECT MIN(check_out) 
     FROM reservations 
     WHERE room_id = r.id 
       AND status IN ('active', 'future')
    ),
    NOW()
  ) as next_available
FROM rooms r
WHERE r.status = 'occupied'
ORDER BY next_available;
```

### Backup Simples (Export):

```sql
-- No SQL Editor do Supabase, você pode exportar:
-- 1. Execute a query
-- 2. Clique em "Download" no resultado
-- 3. Escolha CSV ou JSON

-- Ou use pg_dump (terminal):
pg_dump "postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:5432/postgres" > backup.sql
```

---

## 🎯 Resumo Rápido

| Método | Quando Usar | Dificuldade |
|--------|-------------|-------------|
| **Supabase Dashboard** | Dia a dia | ⭐ Fácil |
| **Table Editor** | Ver/editar dados rapidamente | ⭐ Fácil |
| **SQL Editor** | Queries complexas | ⭐⭐ Médio |
| **Código (supabase client)** | Automatizar, integrar | ⭐⭐ Médio |
| **DBeaver/TablePlus** | Análise profunda, reports | ⭐⭐⭐ Avançado |
| **psql (Terminal)** | Scripts, backups | ⭐⭐⭐ Avançado |

---

## 🆘 Precisa de Ajuda?

Se tiver algum problema:

1. Verifique se as credenciais estão corretas
2. Confirme que o projeto Supabase está ativo
3. Veja os logs: Dashboard → Logs
4. Teste a conexão: Dashboard → SQL Editor → `SELECT NOW();`

**Pronto para começar?** Acesse https://supabase.com/dashboard agora! 🚀
