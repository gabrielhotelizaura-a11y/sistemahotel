# 🔑 COMO PEGAR A API KEY CORRETA DO SUPABASE

## Passo a Passo:

1. **Acesse:** https://supabase.com/dashboard/project/kenmyxsnzwjamequalww/settings/api

2. **Na seção "Project API keys"**, copie:
   - ✅ **anon/public** (URL safe) - essa é a que precisamos!
   - ❌ NÃO use a service_role (é secreta!)

3. **Também pegue o Project URL:**
   - Procure por "Project URL" ou "API URL"
   - Deve ser: `https://kenmyxsnzwjamequalww.supabase.co`

## Me envie:

```
VITE_SUPABASE_URL=https://kenmyxsnzwjamequalww.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGci...
```

Ou tire um print da página de API settings!
