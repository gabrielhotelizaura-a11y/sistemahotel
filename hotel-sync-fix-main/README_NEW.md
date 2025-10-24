# 🏨 Sistema Hoteleiro - Hotel Sync

Sistema completo de gestão hoteleira desenvolvido com React, TypeScript e Supabase.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-Proprietary-red.svg)
![Status](https://img.shields.io/badge/status-Production%20Ready-green.svg)

## 🚀 Setup Rápido (5 minutos)

```bash
# 1. Instalar dependências
npm install

# 2. Configurar variáveis de ambiente
cp .env.example .env
# Edite .env com suas credenciais do Supabase

# 3. Executar migrations (via Supabase Dashboard)
# 4. Criar primeiro admin (SQL no Supabase)
# 5. Iniciar servidor
npm run dev
```

📖 **Veja [QUICK_START.md](./QUICK_START.md) para instruções detalhadas**

## ✨ Funcionalidades

### Para Administradores
- ✅ Gestão completa de quartos (criar, editar, excluir)
- ✅ Gestão de reservas e check-in/check-out
- ✅ Dashboard com estatísticas em tempo real
- ✅ Controle de preços e disponibilidade
- ✅ Gestão de usuários e permissões
- ✅ Relatórios e histórico de reservas

### Para Funcionários
- ✅ Criar e gerenciar reservas
- ✅ Realizar check-in e check-out
- ✅ Visualizar disponibilidade de quartos
- ✅ Acompanhar reservas ativas e futuras

### Recursos Técnicos
- 🔐 Autenticação segura com Supabase Auth
- 🔄 Atualizações em tempo real (Realtime)
- ✅ Validação de dados (frontend + backend)
- ⚡ Cache inteligente com React Query
- 🎨 UI moderna com shadcn/ui + Tailwind
- 📱 100% Responsivo (mobile-first)
- 🛡️ Row Level Security (RLS) completo
- 🚀 Edge Functions para lógica de negócio

## 🛠️ Tecnologias

- **Frontend:** React 18, TypeScript, Vite
- **UI:** shadcn/ui, Tailwind CSS, Radix UI
- **Backend:** Supabase (PostgreSQL, Auth, Realtime, Edge Functions)
- **Estado:** React Query (@tanstack/react-query)
- **Validação:** Zod
- **Formulários:** React Hook Form
- **Roteamento:** React Router v6

## 📁 Estrutura do Projeto

```
hotel-sync-fix/
├── src/
│   ├── components/       # Componentes reutilizáveis
│   │   ├── ui/          # shadcn/ui components
│   │   ├── ErrorBoundary.tsx
│   │   ├── LoadingSpinner.tsx
│   │   └── ProtectedRoute.tsx
│   ├── hooks/           # Custom hooks
│   │   ├── useAuth.tsx
│   │   ├── useReservations.tsx
│   │   └── useRooms.tsx
│   ├── integrations/    # Supabase client
│   ├── lib/            # Utilitários
│   │   ├── constants.ts
│   │   ├── env.ts
│   │   ├── helpers.ts
│   │   └── validations.ts
│   ├── pages/          # Páginas da aplicação
│   └── types/          # TypeScript types
├── supabase/
│   ├── functions/      # Edge Functions (backend)
│   └── migrations/     # Database migrations
└── public/            # Assets estáticos
```

## 🔧 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev              # Servidor de desenvolvimento (porta 8080)

# Build
npm run build            # Build de produção
npm run build:dev        # Build de desenvolvimento
npm run preview          # Preview do build local

# Qualidade de Código
npm run lint             # Verificar erros
npm run lint:fix         # Corrigir erros automaticamente
npm run type-check       # Verificar tipos TypeScript

# Limpeza
npm run clean            # Limpar cache e build
```

## 🌐 Deploy

### Vercel (Recomendado)
```bash
npm install -g vercel
vercel --prod
```

### Netlify
```bash
npm install -g netlify-cli
netlify deploy --prod
```

📖 **Veja [PRODUCTION_GUIDE.md](./PRODUCTION_GUIDE.md) para instruções completas de deploy**

## 📚 Documentação

- **[QUICK_START.md](./QUICK_START.md)** - Setup em 5 minutos
- **[PRODUCTION_GUIDE.md](./PRODUCTION_GUIDE.md)** - Guia completo de produção
- **[DEPLOY_CHECKLIST.md](./DEPLOY_CHECKLIST.md)** - Checklist antes do deploy
- **[IMPROVEMENTS_SUMMARY.md](./IMPROVEMENTS_SUMMARY.md)** - Resumo de melhorias

## 🔐 Segurança

- ✅ Row Level Security (RLS) em todas as tabelas
- ✅ Validação de dados no frontend e backend
- ✅ Autenticação JWT via Supabase
- ✅ Variáveis de ambiente protegidas
- ✅ Headers de segurança configurados
- ✅ CORS configurado corretamente

## 📊 Requisitos

- Node.js 18+ ou Bun
- Conta no Supabase (free tier funciona)
- Git

## 🆘 Suporte e Troubleshooting

Veja a seção **Troubleshooting** no [PRODUCTION_GUIDE.md](./PRODUCTION_GUIDE.md)

## 📄 Licença

Este projeto é privado e proprietário.

## 👨‍💻 Autor

**Higor Bachiao**

---

## 🎯 Status do Projeto

✅ **PRODUCTION-READY**

- ✅ Todas as funcionalidades implementadas
- ✅ Segurança enterprise-grade
- ✅ Documentação completa
- ✅ Deploy configurado
- ✅ Testes realizados

**Pronto para hospedar para clientes!** 🚀
