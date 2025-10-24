# 🏨 Sistema de Gerenciamento Hoteleiro - Documentação Completa

## 📋 Índice
1. [Visão Geral](#visão-geral)
2. [Arquitetura do Sistema](#arquitetura-do-sistema)
3. [Tecnologias Utilizadas](#tecnologias-utilizadas)
4. [Estrutura de Pastas](#estrutura-de-pastas)
5. [Funcionalidades](#funcionalidades)
6. [Guia de Manutenção](#guia-de-manutenção)
7. [Banco de Dados](#banco-de-dados)
8. [Fluxos do Sistema](#fluxos-do-sistema)
9. [Segurança](#segurança)
10. [Deploy e Ambiente](#deploy-e-ambiente)

---

## 🎯 Visão Geral

Sistema completo de gerenciamento hoteleiro desenvolvido em React + TypeScript com Supabase como backend.

### Principais Recursos:
- ✅ Gerenciamento de quartos e disponibilidade
- ✅ Sistema de reservas (criar, editar, cancelar)
- ✅ Check-in e check-out automatizados
- ✅ Controle de pagamentos
- ✅ Reservas futuras com ativação inteligente
- ✅ Despesas operacionais e de hóspedes
- ✅ Estatísticas e relatórios mensais
- ✅ Controle de acesso por perfil (Admin/Funcionário)
- ✅ Interface responsiva (Desktop e Mobile)

---

## 🏗️ Arquitetura do Sistema

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (React)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Páginas    │  │    Hooks     │  │ Componentes  │  │
│  │  (UI/UX)     │◄─┤   (Lógica)   │◄─┤    (UI)      │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│         │                  │                             │
│         └──────────────────┼─────────────────────────────┤
│                            ▼                             │
│                   Supabase Client                        │
└────────────────────────────┬────────────────────────────┘
                             │ HTTPS
                             ▼
┌─────────────────────────────────────────────────────────┐
│              BACKEND (Supabase Cloud)                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ PostgreSQL   │  │     Auth     │  │  Real-time   │  │
│  │  Database    │  │  (Sessões)   │  │ (WebSocket)  │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### Por que não tem API tradicional?

O **Supabase** funciona como um **BaaS (Backend as a Service)**, oferecendo:
- API REST automática para cada tabela
- Autenticação pronta
- Real-time subscriptions
- Queries simplificadas via client

**Você NÃO precisa criar:**
- ❌ Servidor Node.js/Express
- ❌ Rotas de API manualmente
- ❌ Controllers e middlewares
- ❌ Configuração de CORS
- ❌ Gerenciamento de WebSockets

---

## 🛠️ Tecnologias Utilizadas

### Frontend
- **React 18** - Framework UI
- **TypeScript** - Tipagem estática
- **Vite** - Build tool e dev server
- **Tailwind CSS** - Estilização
- **shadcn/ui** - Componentes UI
- **React Router** - Navegação
- **date-fns** - Manipulação de datas
- **Sonner** - Toast notifications

### Backend (Supabase)
- **PostgreSQL** - Banco de dados
- **PostgREST** - API REST automática
- **GoTrue** - Autenticação
- **Realtime** - WebSocket subscriptions

### Ferramentas
- **Bun** - Package manager
- **ESLint** - Linting
- **Git** - Controle de versão

---

## 📁 Estrutura de Pastas

```
hotel-sync-fix/
│
├── public/                          # Arquivos estáticos
│   ├── favicon.ico
│   └── placeholder.svg
│
├── src/
│   ├── components/                  # Componentes reutilizáveis
│   │   ├── AppSidebar.tsx          # Menu lateral com controle de permissões
│   │   └── ui/                      # shadcn/ui components (30+ componentes)
│   │
│   ├── hooks/                       # 🎯 LÓGICA DE NEGÓCIO (CORE)
│   │   ├── useAuth.tsx             # Autenticação e controle de usuário
│   │   ├── useReservations.tsx     # Gerenciamento completo de reservas
│   │   ├── useRooms.tsx            # Gerenciamento de quartos
│   │   └── useExpenses.tsx         # Despesas operacionais
│   │
│   ├── integrations/supabase/       # Conexão com backend
│   │   ├── client.ts               # Cliente Supabase configurado
│   │   └── types.ts                # Tipos gerados do banco
│   │
│   ├── lib/                         # Utilitários
│   │   ├── utils.ts                # Helpers gerais
│   │   └── dateUtils.ts            # Manipulação de datas (timezone BR)
│   │
│   ├── pages/                       # 🖥️ INTERFACE DO USUÁRIO
│   │   ├── Index.tsx               # Página inicial
│   │   ├── Auth.tsx                # Tela de login
│   │   ├── Dashboard.tsx           # Layout do dashboard
│   │   └── dashboard/              # Páginas do dashboard
│   │       ├── Rooms.tsx           # Visualizar quartos
│   │       ├── Reservations.tsx    # Gerenciar reservas ativas
│   │       ├── FutureReservations.tsx  # Reservas futuras
│   │       ├── Prices.tsx          # Configurar preços
│   │       ├── Statistics.tsx      # Estatísticas e histórico
│   │       └── Expenses.tsx        # Despesas operacionais
│   │
│   ├── types/                       # Tipos TypeScript customizados
│   │   └── hotel.ts                # Room, Guest, Reservation, etc
│   │
│   ├── App.tsx                      # Componente raiz + rotas
│   ├── main.tsx                     # Entry point
│   └── index.css                    # Estilos globais
│
├── supabase/                        # Configurações do banco
│   ├── config.toml                 # Config local do Supabase
│   └── migrations/                 # Migrações SQL
│
├── ADD_PAYMENT_STATUS.sql          # SQL: Adicionar campo "paid"
├── CREATE_OPERATIONAL_EXPENSES.sql # SQL: Criar tabela despesas
│
├── package.json                     # Dependências
├── vite.config.ts                  # Config do Vite
├── tailwind.config.ts              # Config do Tailwind
└── tsconfig.json                   # Config do TypeScript
```

---

## ⚙️ Funcionalidades

### 1. 🚪 Gerenciamento de Quartos (`src/pages/dashboard/Rooms.tsx`)
**O que faz:**
- Visualiza todos os quartos
- Mostra status: Disponível / Ocupado / Manutenção
- Filtro por número do quarto ou tipo
- Permite criar reserva diretamente de um quarto

**Onde mexer:**
- **Layout/UI:** `src/pages/dashboard/Rooms.tsx`
- **Dados:** `src/hooks/useRooms.tsx`
- **Banco:** Tabela `rooms`

---

### 2. 📅 Reservas Ativas (`src/pages/dashboard/Reservations.tsx`)
**O que faz:**
- Lista todas as reservas ativas e futuras
- **Editar:** Nome, quarto, pessoas, datas (recalcula preço)
- **Check-out:** Finaliza e ativa próxima reserva automaticamente
- **Cancelar:** Libera quarto
- **Pagamento:** Marca como pago/não pago

**Smart Checkout:**
Quando faz check-out, o sistema verifica se há reserva futura para hoje no mesmo quarto e ativa automaticamente.

**Onde mexer:**
- **UI:** `src/pages/dashboard/Reservations.tsx`
- **Lógica:** `src/hooks/useReservations.tsx`
  - `completeReservation()` - Check-out + smart activation
  - `updateReservation()` - Editar reserva
  - `cancelReservation()` - Cancelar
  - `togglePaymentStatus()` - Marcar pagamento
- **Banco:** Tabelas `reservations`, `guests`, `rooms`

---

### 3. 🔮 Reservas Futuras (`src/pages/dashboard/FutureReservations.tsx`)
**O que faz:**
- Mostra reservas agendadas para o futuro
- Aguarda ativação automática no check-in

**Onde mexer:**
- **UI:** `src/pages/dashboard/FutureReservations.tsx`
- **Lógica:** `src/hooks/useReservations.tsx`
- **Ativação automática:** Verifica a cada 30 segundos se alguma reserva deve ser ativada

---

### 4. 💰 Preços (`src/pages/dashboard/Prices.tsx`)
**O que faz:**
- Configura preço por noite de cada quarto
- Admin pode editar valores

**Onde mexer:**
- **UI:** `src/pages/dashboard/Prices.tsx`
- **Banco:** Tabela `rooms` → campo `price`

---

### 5. 📊 Estatísticas (`src/pages/dashboard/Statistics.tsx`)
**O que faz:**
- **Seletor de mês:** Visualiza estatísticas dos últimos 12 meses
- Receita total do mês
- Total de reservas
- Taxa de ocupação
- Média de dias de estadia
- Estatísticas por tipo de quarto
- Histórico completo com busca por nome

**Onde mexer:**
- **UI + Lógica:** `src/pages/dashboard/Statistics.tsx`
- **Cálculos:** Dentro de `fetchStatistics()`
- **Filtro de mês:** Estado `selectedMonth`

---

### 6. 🧾 Despesas Operacionais (`src/pages/dashboard/Expenses.tsx`)
**O que faz:**
- Adiciona despesas do hotel (salários, contas, etc)
- Mostra despesas do mês atual
- Calcula total automaticamente
- Interface responsiva (cards no mobile, tabela no desktop)

**Onde mexer:**
- **UI:** `src/pages/dashboard/Expenses.tsx`
- **Lógica:** `src/hooks/useExpenses.tsx`
- **Banco:** Tabela `operational_expenses`

---

### 7. 🔐 Autenticação e Permissões (`src/hooks/useAuth.tsx`)
**O que faz:**
- Login/Logout
- Controle de perfil: Admin vs Funcionário
- Admin vê tudo, Funcionário vê menos opções

**Perfis:**
- **Admin:** Acesso total (Preços, Estatísticas, Despesas)
- **Funcionário:** Quartos, Reservas, Futuras

**Onde mexer:**
- **Lógica de auth:** `src/hooks/useAuth.tsx`
- **Menu lateral:** `src/components/AppSidebar.tsx`
- **Banco:** Tabelas `profiles`, `user_roles`

---

## 🔧 Guia de Manutenção

### 🐛 Como adicionar uma nova funcionalidade?

#### Exemplo: Adicionar campo "Observações" nas reservas

**1. Atualizar Banco de Dados:**
```sql
-- Execute no Supabase SQL Editor
ALTER TABLE reservations ADD COLUMN observations TEXT;
```

**2. Atualizar Tipos:**
```typescript
// src/types/hotel.ts
export interface Reservation {
  // ... campos existentes
  observations?: string; // Adicionar
}
```

**3. Atualizar Hook:**
```typescript
// src/hooks/useReservations.tsx
const createReservation = async (
  // ... parâmetros existentes
  observations: string
) => {
  const { error } = await supabase
    .from('reservations')
    .insert({
      // ... campos existentes
      observations,
    });
}
```

**4. Atualizar UI:**
```tsx
// src/pages/dashboard/Reservations.tsx
<Input
  placeholder="Observações"
  value={observations}
  onChange={(e) => setObservations(e.target.value)}
/>
```

---

### 🔍 Problemas Comuns e Soluções

#### ❌ Erro: "Column does not exist"
**Causa:** Tabela no banco não tem a coluna que o código tenta acessar.

**Solução:**
1. Verifique o SQL executado no Supabase
2. Execute a migração faltante
3. Recarregue a página

---

#### ❌ Erro: "RLS policy violation"
**Causa:** Row Level Security habilitado sem políticas.

**Solução:**
```sql
-- Desabilitar RLS na tabela problemática
ALTER TABLE nome_da_tabela DISABLE ROW LEVEL SECURITY;
```

---

#### ❌ Reserva não ativa automaticamente
**Causa:** Polling não está rodando ou data está incorreta.

**Solução:**
1. Verifique console: deve ter logs `⏰ [AUTO-CHECK]`
2. Verifique timezone: `src/lib/dateUtils.ts`
3. Verifique campo `check_in` no banco

---

#### ❌ Real-time não funciona
**Causa:** Subscription desconectada ou RLS bloqueando.

**Solução:**
1. Verifique conexão Supabase no console
2. Desabilite RLS se necessário
3. Recarregue a página

---

### 📝 Como modificar cada parte:

| Quero modificar... | Arquivo(s) a editar |
|-------------------|---------------------|
| **Layout do menu** | `src/components/AppSidebar.tsx` |
| **Adicionar nova página** | 1. Criar em `src/pages/dashboard/`<br>2. Adicionar rota em `src/App.tsx`<br>3. Adicionar item no menu |
| **Lógica de reservas** | `src/hooks/useReservations.tsx` |
| **Lógica de quartos** | `src/hooks/useRooms.tsx` |
| **Cálculo de preços** | `src/hooks/useReservations.tsx` → funções `create` e `update` |
| **Visual dos cards** | `src/pages/dashboard/*.tsx` + Tailwind classes |
| **Adicionar campo no banco** | 1. SQL no Supabase<br>2. Atualizar tipos em `src/types/`<br>3. Atualizar hooks |
| **Mudar cores/tema** | `src/index.css` + `tailwind.config.ts` |
| **Adicionar validação** | Hooks (`useReservations`, etc) → dentro das funções |
| **Mudar timezone** | `src/lib/dateUtils.ts` |

---

## 🗄️ Banco de Dados

### Estrutura das Tabelas

#### `rooms` - Quartos
```sql
CREATE TABLE rooms (
  id UUID PRIMARY KEY,
  number TEXT,           -- Número do quarto
  type TEXT,             -- solteiro, casal, familia
  price DECIMAL,         -- Preço por noite
  capacity INT,          -- Capacidade de pessoas
  beds INT,              -- Número de camas
  status TEXT,           -- available, occupied, maintenance
  amenities JSON,        -- Comodidades
  created_at TIMESTAMP
);
```

#### `guests` - Hóspedes
```sql
CREATE TABLE guests (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,            -- Pode ser NULL
  phone TEXT,
  cpf TEXT,
  created_at TIMESTAMP
);
```

#### `reservations` - Reservas
```sql
CREATE TABLE reservations (
  id UUID PRIMARY KEY,
  guest_id UUID REFERENCES guests(id),
  room_id UUID REFERENCES rooms(id),
  check_in DATE,
  check_out DATE,
  num_guests INT,
  total_price DECIMAL,
  status TEXT,           -- active, future, completed, cancelled
  paid BOOLEAN,          -- Status de pagamento
  created_at TIMESTAMP
);
```

#### `expenses` - Despesas dos Hóspedes
```sql
CREATE TABLE expenses (
  id UUID PRIMARY KEY,
  guest_id UUID REFERENCES guests(id),
  reservation_id UUID REFERENCES reservations(id),
  description TEXT,
  value DECIMAL,
  created_at TIMESTAMP
);
```

#### `operational_expenses` - Despesas Operacionais
```sql
CREATE TABLE operational_expenses (
  id UUID PRIMARY KEY,
  description TEXT NOT NULL,
  value DECIMAL NOT NULL,
  created_at TIMESTAMP
);
```

#### `profiles` - Perfis de Usuário
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT,
  created_at TIMESTAMP
);
```

#### `user_roles` - Papéis dos Usuários
```sql
CREATE TABLE user_roles (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  role TEXT              -- admin, funcionario
);
```

---

### Relacionamentos

```
guests (1) ──┬── (N) reservations
             │
             └── (N) expenses

reservations (N) ── (1) rooms

reservations (1) ── (N) expenses

users (1) ── (1) profiles

users (1) ── (1) user_roles
```

---

## 🔄 Fluxos do Sistema

### Fluxo: Criar uma Reserva

```
1. Usuário acessa "Quartos"
   ↓
2. Clica em "Reservar" em um quarto disponível
   ↓
3. Preenche formulário:
   - Nome do hóspede
   - Email (opcional)
   - Telefone, CPF
   - Número de pessoas
   - Check-in e Check-out
   ↓
4. Sistema calcula:
   - Número de noites
   - Preço total = preço_quarto × noites × pessoas
   ↓
5. useReservations.createReservation():
   - Cria guest no banco
   - Cria reservation
   - Determina status (active se hoje, future se futuro)
   - Atualiza status do quarto
   ↓
6. Real-time notifica outros clientes
   ↓
7. UI atualiza automaticamente
   ↓
8. Toast de sucesso
```

---

### Fluxo: Smart Checkout

```
1. Usuário clica "Check-out" em uma reserva
   ↓
2. useReservations.completeReservation():
   ↓
3. Marca reserva como "completed"
   ↓
4. Busca reservas futuras:
   - Mesmo quarto
   - Check-in = hoje
   ↓
5. Se encontrou reserva futura:
   ├─ Ativa reserva (status = active)
   ├─ Mantém quarto ocupado
   └─ Toast: "Check-out + nova reserva ativada"
   ↓
6. Se NÃO encontrou:
   ├─ Libera quarto (status = available)
   └─ Toast: "Check-out concluído"
   ↓
7. UI atualiza
```

---

### Fluxo: Editar Reserva

```
1. Usuário clica "Editar" em reserva ativa
   ↓
2. Dialog abre com dados atuais
   ↓
3. Usuário altera:
   - Nome
   - Quarto
   - Pessoas
   - Datas
   ↓
4. Clica "Salvar Alterações"
   ↓
5. useReservations.updateReservation():
   ├─ Atualiza nome do guest
   ├─ Busca preço do novo quarto
   ├─ Recalcula total
   ├─ Atualiza reservation
   └─ Se mudou quarto:
       ├─ Libera quarto antigo
       └─ Ocupa novo quarto
   ↓
6. Toast de sucesso
   ↓
7. Dialog fecha
   ↓
8. UI atualiza
```

---

## 🔒 Segurança

### Estado Atual
- **RLS (Row Level Security):** DESABILITADO em todas as tabelas
- **Motivo:** Simplicidade de desenvolvimento e uso interno

```sql
-- Todas as tabelas têm:
ALTER TABLE nome_tabela DISABLE ROW LEVEL SECURITY;
```

### ⚠️ Para Produção (Recomendado)

Se for disponibilizar publicamente, **HABILITE RLS**:

```sql
-- 1. Habilitar RLS
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;

-- 2. Criar políticas
CREATE POLICY "Admin full access" ON reservations
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role = 'admin'
  )
);

CREATE POLICY "Staff read only" ON reservations
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role = 'funcionario'
  )
);
```

### Variáveis de Ambiente

**NÃO COMMITE** as chaves do Supabase no Git!

Crie `.env.local`:
```env
VITE_SUPABASE_URL=sua_url
VITE_SUPABASE_ANON_KEY=sua_chave
```

---

## 🚀 Deploy e Ambiente

### Desenvolvimento Local

```bash
# Instalar dependências
bun install

# Rodar dev server
bun run dev

# Build para produção
bun run build
```

### Deploy Frontend

Recomendado: **Vercel** ou **Netlify**

1. Conecte repositório GitHub
2. Configure variáveis de ambiente
3. Deploy automático a cada push

### Backend (Supabase)

- Já está em produção: `kenmyxsnzwjamequalww.supabase.co`
- Backups automáticos diários
- Monitoramento no dashboard

---

## 📊 Monitoramento

### Supabase Dashboard
https://supabase.com/dashboard/project/kenmyxsnzwjamequalww

**O que monitorar:**
- **Database:** Uso de espaço (limite: 500MB no free)
- **Auth:** Número de usuários
- **API:** Requisições por hora
- **Logs:** Erros e queries lentas

### Limites Free Tier
- ✅ 500 MB banco de dados
- ✅ 1 GB armazenamento
- ✅ 2 GB transferência/mês
- ✅ 50.000 requisições auth/mês

**Estimativa:** Aguenta 3-5 anos de uso tranquilo em hotel pequeno/médio

---

## 🆘 Suporte e Contatos

### Recursos Úteis
- **Supabase Docs:** https://supabase.com/docs
- **Shadcn/ui:** https://ui.shadcn.com
- **Tailwind CSS:** https://tailwindcss.com/docs
- **React Docs:** https://react.dev

### Troubleshooting Rápido

**Sistema não carrega:**
→ Verifique console do navegador
→ Verifique conexão Supabase

**Dados não aparecem:**
→ Verifique RLS no Supabase
→ Verifique queries no hook correspondente

**Erro de build:**
→ `bun install` novamente
→ Verifique versão do Node/Bun

**Erro de tipos TypeScript:**
→ Regenere tipos: `npx supabase gen types typescript`

---

## 📝 Changelog

### v1.0 - Sistema Completo
- ✅ CRUD de quartos
- ✅ Sistema de reservas
- ✅ Check-in/Check-out
- ✅ Smart checkout automático
- ✅ Sistema de pagamento
- ✅ Despesas operacionais
- ✅ Estatísticas por mês
- ✅ Edição de reservas
- ✅ Interface responsiva

---

## 👨‍💻 Desenvolvido por

**Higor Bachião**  
Com assistência de GitHub Copilot

---

**Última atualização:** 17 de outubro de 2025
