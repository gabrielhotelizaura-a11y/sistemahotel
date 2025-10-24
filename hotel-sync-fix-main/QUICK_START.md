# 🚀 Setup Rápido - 5 Minutos

Siga estes passos para ter o sistema rodando localmente em 5 minutos.

## 1️⃣ Instalar Dependências (30s)

```bash
npm install
```

## 2️⃣ Configurar Variáveis de Ambiente (2min)

Copie o arquivo de exemplo:
```bash
cp .env.example .env
```

Edite `.env` e adicione suas credenciais do Supabase:

```env
VITE_SUPABASE_URL=https://SEU-PROJETO.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sua-chave-aqui
VITE_SUPABASE_PROJECT_ID=seu-id-aqui
```

**Onde encontrar:**
1. Acesse [supabase.com/dashboard](https://supabase.com/dashboard)
2. Selecione seu projeto (ou crie um novo)
3. Vá em **Settings** → **API**
4. Copie:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **Project API keys** → `anon public` → `VITE_SUPABASE_PUBLISHABLE_KEY`
   - **Project ref** (na URL) → `VITE_SUPABASE_PROJECT_ID`

## 3️⃣ Executar Migrations do Banco (2min)

### Opção A: Via SQL Editor (Recomendado)

1. Acesse seu projeto no Supabase Dashboard
2. Vá em **SQL Editor**
3. Clique em **New Query**
4. Cole e execute UM POR VEZ, nesta ordem:

**Migration 1:**
```bash
# Copie o conteúdo de:
supabase/migrations/20251007185625_107c7000-bbcc-42b5-888d-50f80be2d4d5.sql
```

**Migration 2:**
```bash
# Copie o conteúdo de:
supabase/migrations/20251008142102_f5195ac5-9e05-4e25-b2e9-1d9fbcf5b3b4.sql
```

**Migration 3:**
```bash
# Copie o conteúdo de:
supabase/migrations/20251008150000_add_rls_policies.sql
```

**Migration 4:**
```bash
# Copie o conteúdo de:
supabase/migrations/20251008151000_add_triggers_and_validations.sql
```

### Opção B: Via CLI

```bash
# Instale o Supabase CLI
npm install -g supabase

# Faça login
supabase login

# Link com seu projeto
supabase link --project-ref SEU-PROJECT-REF

# Execute as migrations
supabase db push
```

## 4️⃣ Criar Primeiro Usuário Admin (30s)

No **SQL Editor** do Supabase, execute:

```sql
-- Primeiro, cadastre-se na aplicação normalmente
-- Depois, promova seu usuário a admin:

UPDATE user_roles 
SET role = 'admin' 
WHERE user_id = (
  SELECT id FROM auth.users 
  WHERE email = 'seu-email@exemplo.com'
);
```

## 5️⃣ Iniciar o Servidor de Desenvolvimento (10s)

```bash
npm run dev
```

Acesse: **http://localhost:8080**

---

## ✅ Pronto!

Você deve ver a tela de login. Use as credenciais que acabou de criar.

## 🎯 Verificação Rápida

Teste se tudo está funcionando:

1. ✅ Faz login com sucesso
2. ✅ Vê o dashboard
3. ✅ Consegue criar um quarto
4. ✅ Consegue criar uma reserva

## 🆘 Problemas?

### Erro: "Missing environment variables"
- Verifique se o `.env` existe e tem todas as variáveis
- Reinicie o servidor: `Ctrl+C` e `npm run dev`

### Erro: "Network error" ou "Failed to fetch"
- Verifique se as credenciais do Supabase estão corretas
- Confirme que o projeto Supabase está ativo

### Erro: "Unauthorized" ou "Forbidden"
- Execute as migrations RLS (migration 3)
- Certifique-se de que seu usuário foi promovido a admin

### Erro ao fazer login
- Verifique no Supabase Dashboard → Authentication se o usuário existe
- Confirme que o email foi verificado (ou desabilite verificação em Auth Settings)

## 📚 Próximos Passos

Depois que estiver funcionando localmente:

1. Leia o **PRODUCTION_GUIDE.md** para deploy
2. Siga o **DEPLOY_CHECKLIST.md** antes de ir para produção
3. Configure domínio e SSL
4. Configure emails (opcional)

## 🚀 Deploy Rápido

### Vercel (Mais fácil)

```bash
# Instale a CLI
npm install -g vercel

# Deploy
vercel

# Configure as variáveis de ambiente no dashboard da Vercel
```

### Netlify

```bash
# Instale a CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod

# Configure as variáveis de ambiente no dashboard da Netlify
```

---

## 📊 Comandos Úteis

```bash
# Desenvolvimento
npm run dev              # Inicia servidor dev (porta 8080)

# Build
npm run build            # Build de produção
npm run build:dev        # Build de desenvolvimento
npm run preview          # Preview do build

# Qualidade
npm run lint             # Verifica erros de código
npm run lint:fix         # Corrige erros automáticos
npm run type-check       # Verifica tipos TypeScript

# Limpeza
npm run clean            # Limpa cache e build
```

## 🎓 Estrutura do Projeto

```
hotel-sync-fix/
├── src/
│   ├── components/       # Componentes React
│   ├── hooks/           # Custom hooks
│   ├── integrations/    # Supabase client
│   ├── lib/            # Utilitários
│   ├── pages/          # Páginas da aplicação
│   └── types/          # TypeScript types
├── supabase/
│   ├── functions/      # Edge Functions (backend)
│   └── migrations/     # SQL migrations
└── public/            # Assets estáticos
```

## 💡 Dicas

- Use **Ctrl+C** para parar o servidor
- Use **Ctrl+Shift+R** para forçar reload no navegador
- Abra **DevTools** (F12) para ver erros
- Verifique o **Supabase Dashboard** → **Logs** para erros de backend

---

**Tempo total estimado: 5 minutos** ⏱️

**Dificuldade: Fácil** ⭐

**Suporte:** Veja PRODUCTION_GUIDE.md para documentação completa
