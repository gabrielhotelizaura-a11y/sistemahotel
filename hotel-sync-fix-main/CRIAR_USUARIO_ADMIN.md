# 👤 Criar Primeiro Usuário Admin

## 🚀 Passos Finais (2 minutos)

### **Opção A: Via Dashboard (Mais Fácil)** ⭐

1. **No Supabase Dashboard:**
   - Vá em **Authentication** (lado esquerdo)
   - Clique em **Users**
   - Clique em **"Add user"** → **"Create new user"**

2. **Preencha:**
   ```
   Email: admin@hotel.com
   Password: [escolha uma senha forte]
   Auto Confirm Email: ✅ MARQUE ISSO (importante!)
   ```

3. **Clique em "Create user"**

4. **Copie o User ID** que apareceu (algo como `123e4567-e89b-12d3-a456-426614174000`)

5. **Vá no SQL Editor** e cole isso (substitua USER_ID):

```sql
-- Substitua USER_ID_AQUI pelo ID que você copiou
DO $$ 
DECLARE
    user_id_var UUID := 'USER_ID_AQUI'; -- ← COLE O ID AQUI
BEGIN
    -- Adicionar role de admin
    INSERT INTO public.user_roles (user_id, role)
    VALUES (user_id_var, 'admin')
    ON CONFLICT DO NOTHING;
    
    -- Criar perfil
    INSERT INTO public.profiles (id, email, nome)
    VALUES (user_id_var, 'admin@hotel.com', 'Administrador')
    ON CONFLICT (id) DO UPDATE 
    SET email = EXCLUDED.email, nome = EXCLUDED.nome;
    
    RAISE NOTICE 'Usuário admin criado com sucesso!';
END $$;
```

6. **Clique em RUN**

7. **✅ Pronto!** Agora você pode fazer login!

---

### **Opção B: Tudo via SQL (Automático)**

Se preferir fazer tudo via SQL de uma vez:

```sql
-- ATENÇÃO: Substitua a senha antes de executar!
DO $$ 
DECLARE
    new_user_id UUID;
    user_email TEXT := 'admin@hotel.com';
    user_password TEXT := 'SuaSenhaForte123!'; -- ← MUDE AQUI
BEGIN
    -- Criar usuário no auth.users
    INSERT INTO auth.users (
        instance_id,
        id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        confirmation_sent_at,
        confirmation_token,
        recovery_token,
        email_change_token_new,
        email_change,
        created_at,
        updated_at,
        raw_app_meta_data,
        raw_user_meta_data,
        is_super_admin,
        is_sso_user
    )
    VALUES (
        '00000000-0000-0000-0000-000000000000',
        gen_random_uuid(),
        'authenticated',
        'authenticated',
        user_email,
        crypt(user_password, gen_salt('bf')),
        NOW(),
        NOW(),
        '',
        '',
        '',
        '',
        NOW(),
        NOW(),
        '{"provider":"email","providers":["email"]}',
        '{}',
        FALSE,
        FALSE
    )
    RETURNING id INTO new_user_id;

    -- Adicionar role de admin
    INSERT INTO public.user_roles (user_id, role)
    VALUES (new_user_id, 'admin');
    
    -- Criar perfil
    INSERT INTO public.profiles (id, email, nome)
    VALUES (new_user_id, user_email, 'Administrador');
    
    RAISE NOTICE 'Usuário admin criado com ID: %', new_user_id;
END $$;
```

⚠️ **IMPORTANTE:** Mude a senha `SuaSenhaForte123!` antes de executar!

---

## 🧪 **Testar Agora:**

1. **Inicie o servidor:**
   ```bash
   bun run dev
   ```

2. **Abra:** http://localhost:5173

3. **Faça login com:**
   ```
   Email: admin@hotel.com
   Senha: [a senha que você escolheu]
   ```

4. **✅ Se aparecer o Dashboard, funcionou!** 🎉

---

## 🐛 **Se der erro de login:**

### **Erro: "Invalid login credentials"**

Verifique se:
1. ✅ Marcou "Auto Confirm Email" ao criar usuário
2. ✅ Usou a senha correta
3. ✅ O usuário aparece em Authentication → Users

### **Erro: "User not authorized"**

Execute este SQL para verificar/corrigir:

```sql
-- Ver usuário criado
SELECT id, email, email_confirmed_at 
FROM auth.users 
WHERE email = 'admin@hotel.com';

-- Ver se tem role de admin
SELECT ur.*, u.email 
FROM user_roles ur 
JOIN auth.users u ON u.id = ur.user_id
WHERE u.email = 'admin@hotel.com';

-- Ver perfil
SELECT * FROM profiles 
WHERE email = 'admin@hotel.com';

-- Se não tiver role, adicione:
INSERT INTO user_roles (user_id, role)
SELECT id, 'admin' 
FROM auth.users 
WHERE email = 'admin@hotel.com'
ON CONFLICT DO NOTHING;
```

---

## ✅ **Checklist Final:**

- [ ] Migrations rodadas (5 migrations)
- [ ] Usuário admin criado
- [ ] Email confirmado (Auto Confirm marcado)
- [ ] Role "admin" adicionada
- [ ] Perfil criado
- [ ] Servidor rodando (`bun run dev`)
- [ ] Login funcionando
- [ ] Dashboard aparecendo

---

## 🎊 **Está pronto!**

Depois disso, você pode:
- ✅ Adicionar quartos
- ✅ Criar reservas
- ✅ Gerenciar hóspedes
- ✅ Ver estatísticas

**Qualquer erro, me avisa!** 😊
