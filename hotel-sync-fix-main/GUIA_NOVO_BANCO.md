# 🔄 Como Migrar para Novo Banco Supabase

## ⏱️ Tempo Total: ~10 minutos

---

## 📋 **Passo 1: Criar Novo Projeto no Supabase** (2 min)

1. Acesse: https://supabase.com/dashboard
2. Clique em **"New Project"** (ou escolha uma organização)
3. Preencha os dados:

```
Nome do Projeto: hotel-sync
Database Password: [ESCOLHA UMA SENHA FORTE - ANOTE!]
Region: South America (São Paulo) 🇧🇷
Pricing Plan: Free
```

4. Clique em **"Create new project"**
5. ☕ Aguarde ~2 minutos (Supabase provisiona tudo automaticamente)

---

## 🔑 **Passo 2: Copiar Credenciais** (1 min)

Quando o projeto estiver pronto:

1. Vá em **Settings** (⚙️ no menu lateral)
2. Clique em **API**
3. Copie as 3 informações:

### **Project URL:**
```
https://XXXXXXXXXXXXX.supabase.co
```

### **API Key (anon/public):**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### **Project ID (Reference ID):**
```
XXXXXXXXXXXXX
```
(É a primeira parte da URL, antes de `.supabase.co`)

---

## 📝 **Passo 3: Atualizar `.env` no Projeto** (1 min)

Na raiz do projeto, crie/edite o arquivo `.env`:

```bash
# Copie o .env.example primeiro (se não tiver .env ainda)
cp .env.example .env
```

Depois edite o `.env` com suas credenciais:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://XXXXXXXXXXXXX.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_SUPABASE_PROJECT_ID=XXXXXXXXXXXXX

# Application Environment
VITE_APP_ENV=development
VITE_APP_NAME="Sistema Hoteleiro"
VITE_APP_VERSION=1.0.0

# Feature Flags (optional)
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_ERROR_REPORTING=false
```

💡 **Dica:** Coloque suas credenciais reais no lugar de `XXXXXXXXXXXXX`

---

## 🗄️ **Passo 4: Rodar as Migrations (Criar Tabelas)** (2 min)

### **Opção A: Via SQL Editor (Mais Fácil)**

1. No Supabase Dashboard, vá em **SQL Editor**
2. Clique em **"+ New query"**
3. Cole o conteúdo deste arquivo:
   ```
   supabase/migrations/20251007185625_107c7000-bbcc-42b5-888d-50f80be2d4d5.sql
   ```
4. Clique em **RUN** (ou Ctrl+Enter)
5. ✅ Pronto! Tabelas criadas

### **Opção B: Via Supabase CLI** (Mais Profissional)

```bash
# 1. Instalar CLI (se ainda não tem)
brew install supabase/tap/supabase

# 2. Login
supabase login

# 3. Linkar projeto
supabase link --project-ref SEU_PROJECT_ID

# 4. Push das migrations
supabase db push
```

---

## 🔐 **Passo 5: Criar Primeiro Usuário Admin** (1 min)

1. No Supabase, vá em **Authentication** → **Users**
2. Clique em **"Add user"** → **"Create new user"**
3. Preencha:
   ```
   Email: admin@hotel.com
   Password: [escolha uma senha]
   Email Confirm: ✅ (marque como confirmado)
   ```
4. Clique em **"Create user"**

Agora você já pode fazer login no sistema! 🎉

---

## 🧪 **Passo 6: Testar o Sistema** (2 min)

```bash
# No terminal, na pasta do projeto:
cd "/Users/higorbachiao/Library/Mobile Documents/com~apple~CloudDocs/hotel-sync-fix"

# Instalar dependências (se ainda não fez)
bun install

# Rodar o projeto
bun run dev
```

Abra: http://localhost:5173

1. Faça login com o usuário que criou
2. ✅ Se aparecer o Dashboard, está funcionando!

---

## 🎯 **Passo 7: Adicionar Role de Admin** (1 min)

Para ter acesso completo, adicione a role de admin:

1. No Supabase, vá em **SQL Editor**
2. Execute:

```sql
-- Pegar o ID do usuário
SELECT id, email FROM auth.users;

-- Adicionar como admin (substitua USER_ID pelo ID real)
INSERT INTO public.user_roles (user_id, role)
VALUES ('USER_ID_AQUI', 'admin');

-- Criar perfil
INSERT INTO public.profiles (id, email, nome)
VALUES ('USER_ID_AQUI', 'admin@hotel.com', 'Administrador');
```

---

## 📊 **Estrutura de Tabelas Criadas**

Depois das migrations, você terá:

```
✅ profiles          - Perfis de usuários
✅ user_roles        - Roles (admin, funcionario)
✅ rooms             - Quartos do hotel
✅ guests            - Hóspedes
✅ reservations      - Reservas
✅ expenses          - Despesas extras
```

---

## 🔄 **Para Atualizar Banco em Produção**

Se você já tem um banco antigo e quer migrar:

### **Exportar dados do banco antigo:**
```sql
-- No SQL Editor do banco ANTIGO:
COPY (SELECT * FROM rooms) TO STDOUT WITH CSV HEADER;
COPY (SELECT * FROM guests) TO STDOUT WITH CSV HEADER;
COPY (SELECT * FROM reservations) TO STDOUT WITH CSV HEADER;
```

### **Importar no banco novo:**
1. Salve os CSVs
2. No banco NOVO, vá em **Table Editor**
3. Selecione a tabela → **Import data via spreadsheet**
4. Upload do CSV

---

## ✅ **Checklist Final**

- [ ] Projeto criado no Supabase
- [ ] Credenciais copiadas (URL + API Key)
- [ ] Arquivo `.env` configurado
- [ ] Migrations executadas (tabelas criadas)
- [ ] Primeiro usuário admin criado
- [ ] Sistema testado localmente
- [ ] Role de admin adicionada

---

## 🆘 **Problemas Comuns**

### **"Failed to fetch"**
- ✅ Verifique se o `.env` tem as credenciais corretas
- ✅ Reinicie o servidor: `Ctrl+C` → `bun run dev`

### **"User not found"**
- ✅ Crie usuário no Authentication do Supabase
- ✅ Adicione role de admin no SQL

### **"Table does not exist"**
- ✅ Execute as migrations no SQL Editor
- ✅ Verifique se as tabelas aparecem no Table Editor

### **Erro ao fazer login**
- ✅ Marque "Email Confirm" ao criar usuário
- ✅ Use a senha correta

---

## 📚 **Arquivos Importantes**

| Arquivo | O que faz |
|---------|-----------|
| `.env` | Credenciais do Supabase (nunca commitar!) |
| `.env.example` | Template do .env (pode commitar) |
| `supabase/migrations/*.sql` | Estrutura do banco (tabelas, RLS, etc) |
| `src/integrations/supabase/client.ts` | Conexão com Supabase |
| `src/integrations/supabase/types.ts` | Types do TypeScript |

---

## 🎊 **Está Pronto!**

Seu novo banco está configurado e funcionando!

**Dúvidas?** Me chama! 😊

---

## 💡 **Dicas Extras**

### **Para Deploy em Produção (Netlify/Vercel):**

1. No dashboard do Netlify/Vercel
2. Vá em **Environment Variables**
3. Adicione:
   ```
   VITE_SUPABASE_URL = https://....supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY = eyJhbGci...
   ```
4. Redeploy o site

### **Habilitar Row Level Security (RLS):**

As migrations já vêm com RLS configurado! Mas se precisar ajustar:

```sql
-- Ver policies ativas
SELECT * FROM pg_policies WHERE schemaname = 'public';

-- Criar nova policy (exemplo)
CREATE POLICY "Users can view all rooms"
  ON rooms FOR SELECT
  TO authenticated
  USING (true);
```

### **Backup Automático:**

O Supabase faz backup diário automaticamente no plano Free! 🎉
- Retenção: 7 dias
- Para restaurar: Settings → Database → Backups
