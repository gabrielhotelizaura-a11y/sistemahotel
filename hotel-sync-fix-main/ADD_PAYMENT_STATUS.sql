-- Adicionar campo de pagamento na tabela reservations
ALTER TABLE public.reservations 
ADD COLUMN IF NOT EXISTS paid BOOLEAN DEFAULT false;

-- Criar índice para buscar reservas não pagas rapidamente
CREATE INDEX IF NOT EXISTS idx_reservations_paid 
ON public.reservations(paid);

-- Atualizar reservas antigas como não pagas
UPDATE public.reservations 
SET paid = false 
WHERE paid IS NULL;

-- Verificar se funcionou
SELECT 
    id, 
    status, 
    paid,
    total_price 
FROM public.reservations 
ORDER BY created_at DESC 
LIMIT 5;
