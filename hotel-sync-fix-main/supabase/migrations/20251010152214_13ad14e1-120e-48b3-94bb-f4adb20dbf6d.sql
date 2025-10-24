-- Remover política antiga que exige autenticação
DROP POLICY IF EXISTS "Todos usuários autenticados podem ver quartos" ON public.rooms;

-- Criar nova política permitindo leitura pública dos quartos
CREATE POLICY "Todos podem ver quartos disponíveis" 
ON public.rooms 
FOR SELECT 
USING (true);

-- Manter a política de admin para modificações
-- (já existe: "Apenas admins podem modificar quartos")