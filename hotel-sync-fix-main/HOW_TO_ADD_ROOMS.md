# 🏨 Como Adicionar Mais Quartos

Existem **3 formas** de adicionar quartos no sistema:

---

## ✅ **Forma 1: Via Interface do Sistema (Será adicionada)**

### Status: 🚧 **EM DESENVOLVIMENTO**

Vou adicionar um botão "Adicionar Quarto" na página `/dashboard/rooms` para admins.

**Como funcionará:**
1. Login como admin
2. Ir em **Quartos**
3. Clicar em **"+ Novo Quarto"**
4. Preencher o formulário:
   - Número do quarto
   - Tipo (Standard, Deluxe, Suite, etc)
   - Capacidade
   - Número de camas
   - Preço por noite
   - Comodidades (Wi-Fi, TV, Ar-condicionado, etc)
5. Salvar

---

## ✅ **Forma 2: Via SQL no Supabase (Recomendado AGORA)**

### 📍 **Acesse:**
```
https://supabase.com/dashboard
→ Seu Projeto
→ SQL Editor
→ New Query
```

### 📝 **Cole e execute este SQL:**

```sql
-- Adicionar um único quarto
INSERT INTO rooms (number, type, capacity, beds, price, amenities, status, description)
VALUES (
  '101',                                    -- Número do quarto
  'Standard',                               -- Tipo
  2,                                        -- Capacidade (pessoas)
  1,                                        -- Número de camas
  150.00,                                   -- Preço por noite
  ARRAY['Wi-Fi', 'TV', 'Ar-condicionado'], -- Comodidades
  'available',                              -- Status
  'Quarto standard com vista para o jardim' -- Descrição (opcional)
);

-- Adicionar múltiplos quartos de uma vez
INSERT INTO rooms (number, type, capacity, beds, price, amenities, status)
VALUES 
  ('102', 'Standard', 2, 1, 150.00, ARRAY['Wi-Fi', 'TV', 'Ar-condicionado'], 'available'),
  ('103', 'Standard', 2, 1, 150.00, ARRAY['Wi-Fi', 'TV', 'Ar-condicionado'], 'available'),
  ('201', 'Deluxe', 3, 2, 250.00, ARRAY['Wi-Fi', 'TV', 'Ar-condicionado', 'Frigobar'], 'available'),
  ('202', 'Deluxe', 3, 2, 250.00, ARRAY['Wi-Fi', 'TV', 'Ar-condicionado', 'Frigobar'], 'available'),
  ('301', 'Suite', 4, 2, 450.00, ARRAY['Wi-Fi', 'TV', 'Ar-condicionado', 'Frigobar', 'Varanda'], 'available');
```

### 📊 **Tipos de Quarto Sugeridos:**
- `Standard` - R$ 100-200
- `Deluxe` - R$ 200-350
- `Suite` - R$ 350-600
- `Premium` - R$ 600+

### 🎯 **Status Disponíveis:**
- `available` - Disponível
- `occupied` - Ocupado
- `maintenance` - Em manutenção
- `cleaning` - Em limpeza

### 🏷️ **Comodidades Comuns:**
- Wi-Fi
- TV
- Ar-condicionado
- Frigobar
- Varanda
- Banheira
- Cofre
- Vista para o mar
- Serviço de quarto

---

## ✅ **Forma 3: Via Table Editor no Supabase (Visual)**

### 📍 **Acesse:**
```
https://supabase.com/dashboard
→ Seu Projeto  
→ Table Editor
→ rooms
```

### 📝 **Passos:**

1. **Clique em "+ Insert row"** (botão verde no topo)

2. **Preencha os campos:**

   | Campo | Exemplo | Obrigatório |
   |-------|---------|-------------|
   | `number` | "101" | ✅ Sim |
   | `type` | "Standard" | ✅ Sim |
   | `capacity` | 2 | ✅ Sim |
   | `beds` | 1 | ✅ Sim |
   | `price` | 150.00 | ✅ Sim |
   | `amenities` | ["Wi-Fi", "TV"] | ✅ Sim |
   | `status` | "available" | ✅ Sim |
   | `description` | "Quarto confortável" | ❌ Não |

3. **Para o campo `amenities` (array):**
   ```json
   ["Wi-Fi", "TV", "Ar-condicionado"]
   ```
   Digite exatamente assim, com as aspas e vírgulas.

4. **Clique em "Save"**

5. **Repita** para adicionar mais quartos

---

## 🎯 **Exemplo Completo de Hotel**

### Para criar um hotel pequeno (10 quartos):

```sql
-- Andar 1 - Standard (4 quartos)
INSERT INTO rooms (number, type, capacity, beds, price, amenities, status)
VALUES 
  ('101', 'Standard', 2, 1, 120.00, ARRAY['Wi-Fi', 'TV', 'Ar-condicionado'], 'available'),
  ('102', 'Standard', 2, 1, 120.00, ARRAY['Wi-Fi', 'TV', 'Ar-condicionado'], 'available'),
  ('103', 'Standard', 2, 1, 120.00, ARRAY['Wi-Fi', 'TV', 'Ar-condicionado'], 'available'),
  ('104', 'Standard', 3, 2, 150.00, ARRAY['Wi-Fi', 'TV', 'Ar-condicionado'], 'available'),

-- Andar 2 - Deluxe (4 quartos)
  ('201', 'Deluxe', 3, 2, 220.00, ARRAY['Wi-Fi', 'TV', 'Ar-condicionado', 'Frigobar'], 'available'),
  ('202', 'Deluxe', 3, 2, 220.00, ARRAY['Wi-Fi', 'TV', 'Ar-condicionado', 'Frigobar'], 'available'),
  ('203', 'Deluxe', 3, 2, 220.00, ARRAY['Wi-Fi', 'TV', 'Ar-condicionado', 'Frigobar'], 'available'),
  ('204', 'Deluxe', 4, 2, 250.00, ARRAY['Wi-Fi', 'TV', 'Ar-condicionado', 'Frigobar', 'Varanda'], 'available'),

-- Andar 3 - Suites (2 quartos)
  ('301', 'Suite', 4, 2, 400.00, ARRAY['Wi-Fi', 'TV', 'Ar-condicionado', 'Frigobar', 'Varanda', 'Banheira'], 'available'),
  ('302', 'Suite Premium', 5, 3, 600.00, ARRAY['Wi-Fi', 'TV', 'Ar-condicionado', 'Frigobar', 'Varanda', 'Banheira', 'Vista para o mar'], 'available');
```

---

## 🔧 **Editar Quartos Existentes**

### Via SQL:
```sql
-- Atualizar preço
UPDATE rooms 
SET price = 180.00 
WHERE number = '101';

-- Atualizar status
UPDATE rooms 
SET status = 'maintenance' 
WHERE number = '102';

-- Adicionar comodidade
UPDATE rooms 
SET amenities = array_append(amenities, 'Cofre')
WHERE number = '201';

-- Atualizar múltiplos campos
UPDATE rooms 
SET 
  price = 200.00,
  type = 'Deluxe',
  amenities = ARRAY['Wi-Fi', 'TV', 'Ar-condicionado', 'Frigobar']
WHERE number = '103';
```

### Via Table Editor:
1. Vá em **Table Editor → rooms**
2. Clique na célula que quer editar
3. Altere o valor
4. Pressione Enter ou clique fora

---

## 🗑️ **Deletar Quartos**

### ⚠️ **CUIDADO:** Só delete quartos que nunca tiveram reservas!

### Via SQL:
```sql
-- Ver se tem reservas associadas
SELECT * FROM reservations WHERE room_id = 'id-do-quarto';

-- Se NÃO tiver reservas, pode deletar:
DELETE FROM rooms WHERE id = 'id-do-quarto';

-- Ou por número:
DELETE FROM rooms WHERE number = '101';
```

### Via Table Editor:
1. Selecione a linha do quarto
2. Clique no ícone de lixeira 🗑️
3. Confirme

---

## 📊 **Ver Todos os Quartos**

```sql
-- Lista simples
SELECT number, type, price, status FROM rooms ORDER BY number;

-- Com mais detalhes
SELECT 
  number,
  type,
  capacity || ' pessoa(s)' as capacity,
  beds || ' cama(s)' as beds,
  'R$ ' || price::text as price,
  status,
  array_length(amenities, 1) || ' comodidades' as amenities_count
FROM rooms 
ORDER BY number;

-- Quartos disponíveis
SELECT * FROM rooms WHERE status = 'available';

-- Quartos por tipo
SELECT type, COUNT(*) as total, AVG(price) as avg_price
FROM rooms
GROUP BY type
ORDER BY avg_price DESC;
```

---

## 🎓 **Dicas Importantes**

### ✅ **DO (Faça):**
- Use números de quarto únicos
- Defina preços realistas
- Adicione comodidades relevantes
- Mantenha o status atualizado
- Use descrições claras

### ❌ **DON'T (Não Faça):**
- Não use números duplicados
- Não delete quartos com histórico de reservas
- Não esqueça de definir o status
- Não deixe campos obrigatórios vazios

---

## 🚀 **Próximos Passos**

Depois de adicionar os quartos:

1. ✅ Verifique na interface: `/dashboard/rooms`
2. ✅ Teste criar uma reserva
3. ✅ Configure os preços em `/dashboard/prices` (se existir)
4. ✅ Veja as estatísticas em `/dashboard/statistics`

---

## 🆘 **Problemas Comuns**

### Erro: "duplicate key value violates unique constraint"
**Solução:** O número do quarto já existe. Use outro número.

### Erro: "invalid input syntax for type json"
**Solução:** O array de amenities está mal formatado. Use:
```sql
ARRAY['Wi-Fi', 'TV']  -- Correto
```

### Quarto não aparece na interface
**Solução:** 
1. Verifique se salvou no banco
2. Recarregue a página (`F5`)
3. Limpe o cache do React Query

---

## 📝 **Script Pronto para Copiar**

Cole este script completo no SQL Editor:

```sql
-- Hotel de Exemplo (10 quartos)
INSERT INTO rooms (number, type, capacity, beds, price, amenities, status, description)
VALUES 
  -- Andares Standard
  ('101', 'Standard', 2, 1, 120.00, ARRAY['Wi-Fi', 'TV', 'Ar-condicionado'], 'available', 'Quarto standard com cama de casal'),
  ('102', 'Standard', 2, 1, 120.00, ARRAY['Wi-Fi', 'TV', 'Ar-condicionado'], 'available', 'Quarto standard com cama de casal'),
  ('103', 'Standard Twin', 2, 2, 130.00, ARRAY['Wi-Fi', 'TV', 'Ar-condicionado'], 'available', 'Quarto standard com 2 camas de solteiro'),
  ('104', 'Standard Family', 4, 2, 180.00, ARRAY['Wi-Fi', 'TV', 'Ar-condicionado'], 'available', 'Quarto standard para família'),
  
  -- Andar Deluxe
  ('201', 'Deluxe', 2, 1, 220.00, ARRAY['Wi-Fi', 'TV', 'Ar-condicionado', 'Frigobar'], 'available', 'Quarto deluxe com frigobar'),
  ('202', 'Deluxe', 2, 1, 220.00, ARRAY['Wi-Fi', 'TV', 'Ar-condicionado', 'Frigobar'], 'available', 'Quarto deluxe com frigobar'),
  ('203', 'Deluxe Plus', 3, 2, 250.00, ARRAY['Wi-Fi', 'TV', 'Ar-condicionado', 'Frigobar', 'Varanda'], 'available', 'Quarto deluxe com varanda'),
  ('204', 'Deluxe Plus', 3, 2, 250.00, ARRAY['Wi-Fi', 'TV', 'Ar-condicionado', 'Frigobar', 'Varanda'], 'available', 'Quarto deluxe com varanda'),
  
  -- Suites Premium
  ('301', 'Suite', 4, 2, 400.00, ARRAY['Wi-Fi', 'TV', 'Ar-condicionado', 'Frigobar', 'Varanda', 'Banheira'], 'available', 'Suite luxuosa com banheira'),
  ('302', 'Suite Premium', 5, 3, 600.00, ARRAY['Wi-Fi', 'TV', 'Ar-condicionado', 'Frigobar', 'Varanda', 'Banheira', 'Vista para o mar', 'Serviço de quarto'], 'available', 'Suite premium com vista para o mar');

-- Verificar quartos criados
SELECT number, type, price, status FROM rooms ORDER BY number;
```

---

**Pronto!** Agora você já sabe todas as formas de adicionar quartos! 🏨

**Qual forma você prefere usar agora?**
1. SQL no Supabase (mais rápido)
2. Table Editor (mais visual)
3. Esperar eu adicionar o botão na interface (mais profissional)
