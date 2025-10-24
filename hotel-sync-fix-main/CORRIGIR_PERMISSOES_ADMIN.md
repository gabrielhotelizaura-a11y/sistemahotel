# 🔧 Corrigir Permissões de Admin e Funcionário

## 🐛 Problemas Reportados:

1. ❌ Admin não vê funcionalidades de admin (Preços, Estatísticas, etc)
2. ❌ Funcionário não pode reservar quartos

## ✅ Correções Aplicadas:

### **1. Código Atualizado:**
- ✅ `useAuth.tsx` - Adicionados logs detalhados
- ✅ `AppSidebar.tsx` - Funcionário agora vê "Quartos" (pode reservar)

### **2. Agora funcionário pode:**
- ✅ Ver quartos disponíveis
- ✅ Fazer reservas
- ✅ Ver reservas ativas
- ✅ Ver reservas futuras

### **3. Admin tem acesso a:**
- ✅ Quartos (gerenciar + reservar)
- ✅ Reservas
- ✅ Futuras
- ✅ Preços (exclusivo admin)
- ✅ Estatísticas (exclusivo admin)

---

## 🔍 **Passo 1: Verificar o Problema**

No **SQL Editor** do Supabase, execute:

```sql
-- Ver usuários e roles atuais
SELECT 
    u.id,
    u.email,
    ur.role,
    CASE 
        WHEN ur.role = 'admin' THEN '👑 Admin'
        WHEN ur.role = 'funcionario' THEN '👤 Funcionário'
        ELSE '❌ SEM ROLE'
    END as status
FROM auth.users u
LEFT JOIN public.user_roles ur ON ur.user_id = u.id
ORDER BY u.created_at DESC;
```

**O que procurar:**
- Se aparecer `❌ SEM ROLE` → Usuário sem permissão!
- Se admin aparecer como `funcionario` → Precisa corrigir!

---

## 🔧 **Passo 2: Corrigir Role de Admin**

### **Método 1: Tornar usuário específico em ADMIN**

```sql
-- 1. Copie o ID do usuário da query acima
-- 2. Cole aqui e execute:

DO $$ 
DECLARE
    target_user_id UUID := 'COLE_O_USER_ID_AQUI'; -- ← IMPORTANTE!
BEGIN
    -- Deletar role antiga
    DELETE FROM public.user_roles WHERE user_id = target_user_id;
    
    -- Adicionar role de admin
    INSERT INTO public.user_roles (user_id, role)
    VALUES (target_user_id, 'admin');
    
    -- Atualizar perfil
    INSERT INTO public.profiles (id, email, nome)
    SELECT id, email, 'Administrador'
    FROM auth.users
    WHERE id = target_user_id
    ON CONFLICT (id) DO UPDATE 
    SET nome = 'Administrador';
    
    RAISE NOTICE '✅ Usuário transformado em ADMIN!';
END $$;
```

### **Método 2: Transformar por email**

```sql
-- Mais fácil - usa email ao invés de ID
DO $$ 
DECLARE
    admin_email TEXT := 'seuemail@exemplo.com'; -- ← Mude aqui
    target_user_id UUID;
BEGIN
    -- Buscar ID pelo email
    SELECT id INTO target_user_id
    FROM auth.users
    WHERE email = admin_email;
    
    IF target_user_id IS NULL THEN
        RAISE EXCEPTION 'Email não encontrado!';
    END IF;
    
    -- Deletar role antiga
    DELETE FROM public.user_roles WHERE user_id = target_user_id;
    
    -- Adicionar role de admin
    INSERT INTO public.user_roles (user_id, role)
    VALUES (target_user_id, 'admin');
    
    RAISE NOTICE '✅ % agora é ADMIN!', admin_email;
END $$;
```

---

## 🧪 **Passo 3: Testar**

1. **Recarregue a página** (F5)
2. **Abra o Console** (F12)
3. **Procure por:**
   ```
   🔍 Buscando role para user_id: ...
   📋 Role encontrada: { role: 'admin' }
   ✅ UserRole definido como: admin
   ```

4. **Verifique a sidebar:**
   - ✅ Admin deve ver: Quartos, Reservas, Futuras, **Preços**, **Estatísticas**
   - ✅ Funcionário deve ver: Quartos, Reservas, Futuras

---

## 🎯 **Diferenças entre Admin e Funcionário:**

| Funcionalidade | Admin | Funcionário |
|----------------|-------|-------------|
| Ver quartos | ✅ | ✅ |
| Reservar quartos | ✅ | ✅ |
| Ver reservas | ✅ | ✅ |
| Completar check-out | ✅ | ✅ |
| Ver reservas futuras | ✅ | ✅ |
| **Adicionar quartos** | ✅ | ❌ |
| **Editar preços** | ✅ | ❌ |
| **Ver estatísticas** | ✅ | ❌ |
| **Dashboard completo** | ✅ | ❌ |

---

## 🐛 **Troubleshooting:**

### **Console mostra: "⚠️ Nenhuma role encontrada"**

Execute:
```sql
-- Adicionar role manualmente
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'
FROM auth.users
WHERE email = 'seuemail@exemplo.com'
ON CONFLICT DO NOTHING;
```

### **Ainda não aparece como admin na sidebar**

1. Limpe o cache do navegador (Ctrl+Shift+R)
2. Faça logout e login de novo
3. Verifique o console (F12) se aparece os logs

### **Erro "user_roles does not exist"**

Execute a migration que cria a tabela:
```sql
-- Recriar tabela user_roles
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'funcionario')),
  UNIQUE (user_id, role)
);
```

---

## ✅ **Checklist Final:**

- [ ] SQL executado para verificar roles
- [ ] Usuário admin tem role = 'admin'
- [ ] Código atualizado (já feito automaticamente)
- [ ] Página recarregada (F5)
- [ ] Console verificado (logs aparecem)
- [ ] Sidebar mostra opções corretas
- [ ] Funcionário consegue reservar quartos
- [ ] Admin vê Preços e Estatísticas

---

## 🎊 **Pronto!**

Agora:
- ✅ Admin vê todas as funcionalidades
- ✅ Funcionário pode reservar quartos
- ✅ Logs ajudam a debugar problemas

Execute o SQL acima e recarregue a página! Me avisa o resultado! 🚀
