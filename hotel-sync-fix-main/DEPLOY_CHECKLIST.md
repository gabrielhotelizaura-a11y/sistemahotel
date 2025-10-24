# Checklist de Deploy para Produção

Use este checklist antes de fazer deploy para garantir que tudo está configurado corretamente.

## 📋 Antes do Deploy

### 1. Ambiente e Variáveis ✅

- [ ] Arquivo `.env.example` está atualizado com todas as variáveis necessárias
- [ ] Arquivo `.env` está no `.gitignore` (nunca commitar credenciais)
- [ ] Variáveis de ambiente configuradas no serviço de hospedagem (Vercel/Netlify)
- [ ] `VITE_APP_ENV` definido como `production`
- [ ] Credenciais do Supabase corretas e testadas

### 2. Banco de Dados ✅

- [ ] Todas as migrations executadas no Supabase
- [ ] Políticas RLS (Row Level Security) ativadas e testadas
- [ ] Triggers e validações funcionando corretamente
- [ ] Índices criados para performance
- [ ] Primeiro usuário admin criado no banco

### 3. Segurança ✅

- [ ] RLS policies em todas as tabelas
- [ ] Validações no frontend E backend
- [ ] Headers de segurança configurados
- [ ] CORS configurado corretamente
- [ ] Secrets do Supabase configurados para Edge Functions
- [ ] Credenciais sensíveis NUNCA no código

### 4. Performance ✅

- [ ] Build de produção testado (`npm run build:production`)
- [ ] Assets otimizados (imagens comprimidas)
- [ ] Cache configurado para assets estáticos
- [ ] React Query configurado para cache eficiente
- [ ] Bundle size verificado (recomendado < 500KB gzipped)

### 5. Funcionalidades ✅

- [ ] Autenticação funcionando (login/logout/signup)
- [ ] Criação de reservas funcionando
- [ ] Check-in/check-out funcionando
- [ ] Gestão de quartos funcionando
- [ ] Estatísticas carregando corretamente
- [ ] Reservas futuras sendo ativadas automaticamente
- [ ] Realtime subscriptions funcionando

### 6. UX/UI ✅

- [ ] Loading states em todas as operações
- [ ] Error boundaries implementados
- [ ] Mensagens de erro amigáveis
- [ ] Toasts/notificações funcionando
- [ ] Responsivo em mobile, tablet e desktop
- [ ] Acessibilidade básica (keyboard navigation, aria-labels)

### 7. Monitoramento ✅

- [ ] Health check endpoint funcionando
- [ ] Logs configurados (Supabase Dashboard)
- [ ] Alertas configurados para erros críticos (opcional)
- [ ] Analytics configurado (opcional)

### 8. Documentação ✅

- [ ] README.md atualizado
- [ ] PRODUCTION_GUIDE.md completo
- [ ] Comentários em código complexo
- [ ] Documentação de APIs/Edge Functions

### 9. Testes ✅

- [ ] Lint sem erros (`npm run lint`)
- [ ] Type check sem erros (`npm run type-check`)
- [ ] Build sem erros (`npm run build`)
- [ ] Testes manuais de fluxos principais

### 10. Deploy ✅

- [ ] Build de produção gerado com sucesso
- [ ] Preview testado antes do deploy final
- [ ] DNS configurado (se custom domain)
- [ ] SSL/HTTPS configurado
- [ ] Redirect de www para não-www (ou vice-versa)

## 🚀 Comandos de Deploy

### Vercel
```bash
vercel --prod
```

### Netlify
```bash
netlify deploy --prod
```

### Manual (SSH)
```bash
npm run build:production
rsync -avz dist/ user@server:/var/www/hotel-system/
```

## 🔍 Pós-Deploy

### Verificações Imediatas

- [ ] Site carrega corretamente
- [ ] Login funciona
- [ ] Criar uma reserva de teste
- [ ] Health check retorna status 200
- [ ] Assets estão carregando (verificar network tab)
- [ ] Console sem erros críticos

### Teste de Performance

```bash
# Lighthouse
npm install -g lighthouse
lighthouse https://seu-dominio.com --view

# PageSpeed Insights
# https://pagespeed.web.dev/
```

### Monitoramento Contínuo

- [ ] Verificar logs do Supabase nos primeiros 30 minutos
- [ ] Monitorar métricas de performance
- [ ] Verificar se não há picos de erro

## 🆘 Rollback Plan

Se algo der errado:

### Vercel
```bash
vercel rollback
```

### Netlify
Dashboard → Deploys → Escolher deploy anterior → Publish deploy

### Manual
```bash
# Restaurar backup anterior
rsync -avz backup/dist/ user@server:/var/www/hotel-system/
```

## 📞 Contatos de Emergência

- Supabase Status: https://status.supabase.com/
- Vercel Status: https://www.vercel-status.com/
- Documentação: Ver PRODUCTION_GUIDE.md

## ✅ Checklist Final

Antes de marcar como completo, certifique-se de que:

1. ✅ Todas as verificações acima foram feitas
2. ✅ Site está acessível e funcionando
3. ✅ Backup do banco foi feito
4. ✅ Documentação está atualizada
5. ✅ Equipe foi notificada sobre o deploy

---

**Data do Deploy:** _____________

**Responsável:** _____________

**Versão:** _____________

**Notas:** 
_____________________________________________
_____________________________________________
_____________________________________________
