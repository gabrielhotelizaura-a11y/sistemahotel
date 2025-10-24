# Sistema Hoteleiro - Guia Completo de Produção

Sistema completo de gestão hoteleira com React, TypeScript, Supabase e shadcn/ui.

## 🚀 Tecnologias

- **Frontend:** React 18, TypeScript, Vite
- **UI:** shadcn/ui, Tailwind CSS, Radix UI
- **Backend:** Supabase (PostgreSQL, Auth, Realtime, Edge Functions)
- **Estado:** React Query (@tanstack/react-query)
- **Validação:** Zod
- **Formulários:** React Hook Form
- **Roteamento:** React Router v6

## 📋 Pré-requisitos

- Node.js 18+ ou Bun
- Conta no Supabase
- Git

## 🔧 Configuração Local

### 1. Clone o repositório

```bash
git clone https://github.com/Higor-Bachiao/hotel-sync-fix.git
cd hotel-sync-fix
```

### 2. Instale as dependências

```bash
npm install
# ou
bun install
```

### 3. Configure as variáveis de ambiente

Copie o arquivo `.env.example` para `.env`:

```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas credenciais do Supabase:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sua-chave-publica
VITE_SUPABASE_PROJECT_ID=seu-project-id
VITE_APP_ENV=development
```

### 4. Configure o banco de dados

Execute as migrations no Supabase:

```bash
# Instale o Supabase CLI
npm install -g supabase

# Faça login
supabase login

# Link com seu projeto
supabase link --project-ref seu-project-ref

# Execute as migrations
supabase db push
```

Ou execute manualmente no SQL Editor do Supabase:
1. `20251007185625_107c7000-bbcc-42b5-888d-50f80be2d4d5.sql`
2. `20251008142102_f5195ac5-9e05-4e25-b2e9-1d9fbcf5b3b4.sql`
3. `20251008150000_add_rls_policies.sql`
4. `20251008151000_add_triggers_and_validations.sql`

### 5. Inicie o servidor de desenvolvimento

```bash
npm run dev
# ou
bun dev
```

Acesse `http://localhost:8080`

## 🏗️ Build para Produção

### Build otimizado

```bash
npm run build
```

O build será gerado na pasta `dist/`

### Preview do build

```bash
npm run preview
```

## 🚢 Deploy

### Opção 1: Vercel (Recomendado)

1. Instale o Vercel CLI:
```bash
npm install -g vercel
```

2. Faça deploy:
```bash
vercel
```

3. Configure as variáveis de ambiente no painel da Vercel:
   - Settings → Environment Variables
   - Adicione todas as variáveis do `.env`

### Opção 2: Netlify

1. Instale o Netlify CLI:
```bash
npm install -g netlify-cli
```

2. Faça deploy:
```bash
netlify deploy --prod
```

3. Configure as variáveis de ambiente no painel da Netlify

### Opção 3: Hospedagem Estática (Nginx)

1. Faça o build:
```bash
npm run build
```

2. Configure o Nginx:

```nginx
server {
    listen 80;
    server_name seu-dominio.com;

    root /var/www/hotel-system/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cabeçalhos de segurança
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    
    # Cache para assets estáticos
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

3. Configure SSL com Let's Encrypt:
```bash
sudo certbot --nginx -d seu-dominio.com
```

## 🔐 Segurança

### Políticas RLS (Row Level Security)

O banco de dados está protegido com políticas RLS em todas as tabelas:

- ✅ Usuários só podem ver/editar seus próprios dados
- ✅ Apenas admin e funcionários podem gerenciar reservas
- ✅ Apenas admin pode gerenciar quartos e funções
- ✅ Validações de negócio implementadas via triggers

### Variáveis de Ambiente

**NUNCA** commite o arquivo `.env` com credenciais reais. Use:

- `.env.example` com valores de exemplo
- Variáveis de ambiente no servidor de produção
- Secrets do Supabase para Edge Functions

### Headers de Segurança

Configure no seu servidor/CDN:

```
X-Frame-Options: SAMEORIGIN
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Referrer-Policy: no-referrer-when-downgrade
Content-Security-Policy: default-src 'self'
```

## 📊 Monitoramento

### Health Check

Endpoint: `/functions/v1/health-check`

Monitore a saúde da aplicação:

```bash
curl https://seu-projeto.supabase.co/functions/v1/health-check
```

### Logs

- **Frontend:** Browser console, Sentry
- **Backend:** Supabase Dashboard → Logs
- **Edge Functions:** Supabase Dashboard → Edge Functions → Logs

## 🧪 Testes

```bash
# Linting
npm run lint

# Type checking
npm run build
```

## 📱 Funcionalidades

### Para Administradores
- ✅ Gerenciamento completo de quartos
- ✅ Gerenciamento de reservas (criar, editar, cancelar)
- ✅ Visualização de estatísticas e relatórios
- ✅ Gerenciamento de preços
- ✅ Controle de usuários e permissões

### Para Funcionários
- ✅ Criar e gerenciar reservas
- ✅ Check-in e check-out de hóspedes
- ✅ Visualizar disponibilidade de quartos
- ✅ Acompanhar reservas futuras

### Funcionalidades Técnicas
- ✅ Autenticação segura com Supabase Auth
- ✅ Atualizações em tempo real (Realtime)
- ✅ Validação de dados no cliente e servidor
- ✅ Cache inteligente com React Query
- ✅ Loading states e error boundaries
- ✅ Responsivo (mobile-first)
- ✅ Dark mode (opcional)

## 🔄 Fluxo de Trabalho

### Desenvolvimento

1. Crie uma branch:
```bash
git checkout -b feature/nova-funcionalidade
```

2. Faça suas alterações e commite:
```bash
git add .
git commit -m "feat: adiciona nova funcionalidade"
```

3. Push e crie um Pull Request:
```bash
git push origin feature/nova-funcionalidade
```

### Deploy Automático

Configure GitHub Actions ou Vercel/Netlify para deploy automático:

1. Push para `main` → deploy em produção
2. Push para `develop` → deploy em staging

## 📞 Suporte

Para problemas ou dúvidas:

1. Verifique a documentação do Supabase: https://supabase.com/docs
2. Consulte os logs de erro
3. Abra uma issue no repositório

## 📄 Licença

Este projeto é privado e proprietário.

## 🎯 Próximos Passos

### Melhorias Sugeridas

1. **Analytics**
   - Integrar Google Analytics ou Plausible
   - Métricas de uso e conversão

2. **Notificações**
   - Emails de confirmação (SendGrid, Resend)
   - Notificações push

3. **Relatórios**
   - Exportar para PDF
   - Gerar relatórios mensais automaticamente

4. **Multi-idioma**
   - i18n para português e inglês

5. **Integração de Pagamentos**
   - Stripe ou Mercado Pago
   - Pagamento online de reservas

6. **Sistema de Reviews**
   - Avaliações de hóspedes
   - Feedback sobre quartos

## 🛠️ Troubleshooting

### Erro: "Missing environment variables"

Verifique se o arquivo `.env` existe e contém todas as variáveis necessárias.

### Erro de conexão com Supabase

1. Verifique se as credenciais estão corretas
2. Confirme que o projeto Supabase está ativo
3. Verifique se as migrations foram executadas

### Build falha

1. Limpe o cache: `rm -rf node_modules dist && npm install`
2. Verifique erros de TypeScript: `npm run build`
3. Atualize as dependências: `npm update`

### Problemas de permissão

Verifique as políticas RLS no Supabase Dashboard:
- SQL Editor → Execute as migrations de políticas novamente

## 📚 Estrutura do Projeto

```
hotel-sync-fix/
├── src/
│   ├── components/       # Componentes reutilizáveis
│   │   ├── ui/          # shadcn/ui components
│   │   ├── ErrorBoundary.tsx
│   │   └── LoadingSpinner.tsx
│   ├── hooks/           # Custom hooks
│   │   ├── useAuth.tsx
│   │   ├── useReservations.tsx
│   │   └── useRooms.tsx
│   ├── integrations/    # Integrações externas
│   │   └── supabase/
│   ├── lib/            # Utilitários
│   │   ├── constants.ts
│   │   ├── env.ts
│   │   ├── helpers.ts
│   │   ├── utils.ts
│   │   └── validations.ts
│   ├── pages/          # Páginas da aplicação
│   │   ├── dashboard/
│   │   ├── Auth.tsx
│   │   └── Index.tsx
│   └── types/          # TypeScript types
├── supabase/
│   ├── functions/      # Edge Functions
│   └── migrations/     # Database migrations
├── public/            # Assets estáticos
└── docs/             # Documentação adicional
```

## 🎓 Convenções de Código

- Use TypeScript para type safety
- Componentes em PascalCase
- Funções e variáveis em camelCase
- Constantes em UPPER_SNAKE_CASE
- Use hooks customizados para lógica reutilizável
- Mantenha componentes pequenos e focados
- Documente funções complexas
- Use comentários JSDoc quando necessário

---

**Desenvolvido com ❤️ para gestão hoteleira profissional**
