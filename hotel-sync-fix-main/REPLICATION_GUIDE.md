# 🔄 Guia de Replicação do Projeto para Novo Hotel

## 📋 Checklist Completo

### ✅ O que você precisa fazer:

1. ✅ Criar novo projeto no Supabase
2. ✅ Configurar variáveis de ambiente
3. ✅ Criar todas as tabelas (executar SQLs)
4. ✅ Criar primeiro usuário admin
5. ✅ Configurar RLS (opcional)
6. ✅ Personalizar logo e nome
7. ✅ Deploy

---

## 1️⃣ Criar Novo Projeto no Supabase

1. Acesse: https://supabase.com/dashboard
2. Clique em **"New Project"**
3. Preencha:
   - **Name:** hotel-nome-do-hotel
   - **Database Password:** (salve essa senha!)
   - **Region:** South America (São Paulo) - mais próximo do Brasil
4. Aguarde ~2 minutos para criar

5. Anote as credenciais em **Settings > API**:
   - **Project URL:** `https://xxxxxxxx.supabase.co`
   - **anon public key:** `eyJhbGc...` (chave longa)
   - **Project ID:** `xxxxxxxx`

---

## 2️⃣ Configurar Variáveis de Ambiente

Crie o arquivo `.env.local` na raiz do projeto:

```env
# Supabase
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sua_chave_anon_aqui
VITE_SUPABASE_PROJECT_ID=seu_project_id

# App (opcional)
VITE_APP_NAME=Hotel Nome do Hotel
VITE_APP_VERSION=1.0.0
VITE_APP_ENV=production
```

**⚠️ IMPORTANTE:**
- `.env.local` NÃO vai pro Git (está no .gitignore)
- Cada desenvolvedor/ambiente tem seu próprio `.env.local`

---

## 3️⃣ Criar Todas as Tabelas no Banco

Acesse: **Supabase Dashboard > SQL Editor**

Execute os SQLs na ordem:

### 📄 SQL 1: Tabelas Principais

```sql
-- ============================================
-- TABELAS PRINCIPAIS DO SISTEMA HOTELEIRO
-- ============================================

-- 1. QUARTOS
CREATE TABLE IF NOT EXISTS public.rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  number TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL,              -- solteiro, casal, familia
  price DECIMAL(10,2) NOT NULL,
  capacity INT NOT NULL,
  beds INT NOT NULL,
  status TEXT DEFAULT 'available', -- available, occupied, maintenance
  amenities JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. HÓSPEDES
CREATE TABLE IF NOT EXISTS public.guests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT,                      -- Pode ser NULL
  phone TEXT,
  cpf TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. RESERVAS
CREATE TABLE IF NOT EXISTS public.reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_id UUID NOT NULL REFERENCES public.guests(id) ON DELETE CASCADE,
  room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  num_guests INT NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'active',    -- active, future, completed, cancelled
  paid BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. DESPESAS DOS HÓSPEDES
CREATE TABLE IF NOT EXISTS public.expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_id UUID NOT NULL REFERENCES public.guests(id) ON DELETE CASCADE,
  reservation_id UUID REFERENCES public.reservations(id) ON DELETE SET NULL,
  description TEXT NOT NULL,
  value DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. DESPESAS OPERACIONAIS
CREATE TABLE IF NOT EXISTS public.operational_expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  description TEXT NOT NULL,
  value DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. PERFIS DE USUÁRIO
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. PAPÉIS DOS USUÁRIOS
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL,              -- admin, funcionario
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- ============================================
-- ÍNDICES PARA PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_reservations_status ON public.reservations(status);
CREATE INDEX IF NOT EXISTS idx_reservations_dates ON public.reservations(check_in, check_out);
CREATE INDEX IF NOT EXISTS idx_reservations_room ON public.reservations(room_id);
CREATE INDEX IF NOT EXISTS idx_reservations_guest ON public.reservations(guest_id);
CREATE INDEX IF NOT EXISTS idx_rooms_status ON public.rooms(status);
CREATE INDEX IF NOT EXISTS idx_expenses_created_at ON public.expenses(created_at);
CREATE INDEX IF NOT EXISTS idx_operational_expenses_created_at ON public.operational_expenses(created_at DESC);

-- ============================================
-- DESABILITAR RLS (Row Level Security)
-- ============================================
-- Facilita desenvolvimento. Para produção, considere habilitar com políticas.

ALTER TABLE public.rooms DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.guests DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservations DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.operational_expenses DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles DISABLE ROW LEVEL SECURITY;

-- ============================================
-- VERIFICAR SE FUNCIONOU
-- ============================================

SELECT 'Tabelas criadas com sucesso!' as status;
SELECT COUNT(*) as total_tables 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('rooms', 'guests', 'reservations', 'expenses', 'operational_expenses', 'profiles', 'user_roles');
```

---

### 📄 SQL 2: Dados Iniciais (Quartos)

```sql
-- ============================================
-- INSERIR QUARTOS INICIAIS
-- ============================================
-- Customize conforme os quartos do hotel

INSERT INTO public.rooms (number, type, price, capacity, beds, status) VALUES
  ('101', 'solteiro', 150.00, 1, 1, 'available'),
  ('102', 'solteiro', 150.00, 1, 1, 'available'),
  ('103', 'casal', 200.00, 2, 1, 'available'),
  ('104', 'casal', 200.00, 2, 1, 'available'),
  ('201', 'familia', 300.00, 4, 2, 'available'),
  ('202', 'familia', 300.00, 4, 2, 'available'),
  ('203', 'familia', 350.00, 5, 3, 'available'),
  ('301', 'solteiro', 150.00, 1, 1, 'available'),
  ('302', 'casal', 220.00, 2, 1, 'available'),
  ('303', 'familia', 320.00, 4, 2, 'available')
ON CONFLICT (number) DO NOTHING;

SELECT * FROM public.rooms ORDER BY number;
```

**⚠️ IMPORTANTE:** Edite os quartos conforme a estrutura do novo hotel!

---

## 4️⃣ Criar Primeiro Usuário Admin

### Opção A: Via Interface Supabase (Recomendado)

1. **Supabase Dashboard > Authentication > Users**
2. Clique em **"Add user"** > **"Create new user"**
3. Preencha:
   - Email: `admin@hotel.com`
   - Password: `senha123` (ou outra senha forte)
   - Auto Confirm: ✅ Marque
4. Clique em **"Create user"**

5. **Copie o User ID** (UUID)

6. Execute este SQL para definir como admin:

```sql
-- Substitua 'USER_ID_AQUI' pelo UUID copiado
INSERT INTO public.profiles (id, email) 
VALUES ('USER_ID_AQUI', 'admin@hotel.com');

INSERT INTO public.user_roles (user_id, role) 
VALUES ('USER_ID_AQUI', 'admin');
```

### Opção B: Via SQL (Automático)

```sql
-- Criar usuário admin automaticamente
DO $$
DECLARE
  new_user_id UUID;
BEGIN
  -- Inserir na tabela auth.users (requer permissões especiais)
  -- Se der erro, use a Opção A
  
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'admin@hotel.com',
    crypt('senha123', gen_salt('bf')),  -- Senha: senha123
    NOW(),
    NOW(),
    NOW()
  ) RETURNING id INTO new_user_id;
  
  -- Criar profile
  INSERT INTO public.profiles (id, email) VALUES (new_user_id, 'admin@hotel.com');
  
  -- Definir role como admin
  INSERT INTO public.user_roles (user_id, role) VALUES (new_user_id, 'admin');
  
  RAISE NOTICE 'Admin criado com sucesso! Email: admin@hotel.com | Senha: senha123';
END $$;
```

---

## 5️⃣ Testar Login

1. Execute o projeto localmente:
```bash
bun install
bun run dev
```

2. Acesse: http://localhost:8080

3. Faça login com:
   - Email: `admin@hotel.com`
   - Senha: `senha123` (ou a que você definiu)

4. **✅ Se entrou:** Tudo funcionando!

5. **❌ Se deu erro:** Verifique:
   - `.env.local` está configurado corretamente?
   - As tabelas foram criadas?
   - O usuário foi criado no Supabase Auth?

---

## 6️⃣ Personalizar para o Novo Hotel

### Logo e Nome

1. **Adicionar logo:**
   - Coloque `logo.png` em `/public/logo.png`
   - Coloque `favicon.ico` em `/public/favicon.ico`

2. **Atualizar nome no `.env.local`:**
```env
VITE_APP_NAME=Hotel Nome do Seu Hotel
```

3. **Atualizar título no `index.html`:**
```html
<title>Hotel Nome do Seu Hotel</title>
```

---

## 7️⃣ Deploy (Colocar Online)

### Opção A: Vercel (Recomendado)

1. Crie conta: https://vercel.com
2. Conecte o GitHub
3. Importe o repositório
4. Configure Environment Variables:
   ```
   VITE_SUPABASE_URL=...
   VITE_SUPABASE_PUBLISHABLE_KEY=...
   VITE_SUPABASE_PROJECT_ID=...
   ```
5. Deploy!

### Opção B: Netlify

1. Crie conta: https://netlify.com
2. Arraste a pasta `dist/` após fazer build
3. Configure variáveis de ambiente
4. Deploy!

---

## 📊 Resumo: O que muda entre hotéis?

| Item | Muda? | Como mudar |
|------|-------|------------|
| **Código fonte** | ❌ Não | Usa o mesmo |
| **Supabase Project** | ✅ Sim | Criar novo |
| **Variáveis .env** | ✅ Sim | Novo `.env.local` |
| **Tabelas do banco** | ✅ Sim | Executar SQLs |
| **Quartos** | ✅ Sim | Customizar INSERT |
| **Logo** | ✅ Sim | Substituir `/public/logo.png` |
| **Nome do hotel** | ✅ Sim | Editar `.env.local` |
| **Usuário admin** | ✅ Sim | Criar novo |

---

## ⏱️ Tempo Estimado

- **Criar projeto Supabase:** 5 minutos
- **Executar SQLs:** 5 minutos
- **Configurar .env:** 2 minutos
- **Criar admin:** 3 minutos
- **Testar:** 5 minutos
- **Personalizar:** 10 minutos
- **Deploy:** 10 minutos

**Total:** ~40 minutos para replicar completamente! ⚡

---

## 🆘 Problemas Comuns

### ❌ "Cannot read properties of undefined"
**Causa:** `.env.local` não configurado ou com valores errados

**Solução:**
```bash
# Verificar se existe
cat .env.local

# Deve ter as 3 variáveis VITE_SUPABASE_*
```

---

### ❌ "relation 'rooms' does not exist"
**Causa:** SQLs não foram executados no Supabase

**Solução:**
1. Abra SQL Editor no Supabase
2. Execute o SQL 1 (criar tabelas)

---

### ❌ Login não funciona
**Causa:** Usuário não foi criado ou role não foi definida

**Solução:**
```sql
-- Verificar se usuário existe
SELECT * FROM auth.users WHERE email = 'admin@hotel.com';

-- Verificar se tem role
SELECT * FROM user_roles WHERE user_id = 'USER_ID';
```

---

## 🎯 Pronto!

Agora você tem um **novo sistema completo** rodando para outro hotel! 🏨🎉

**Cada hotel terá:**
- ✅ Seu próprio banco de dados
- ✅ Seus próprios usuários
- ✅ Seus próprios dados
- ✅ Totalmente isolado dos outros

É só replicar esse processo para quantos hotéis precisar! 🚀
