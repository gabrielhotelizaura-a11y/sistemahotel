-- Tornar o campo email opcional (permitir NULL)
ALTER TABLE public.guests 
ALTER COLUMN email DROP NOT NULL;

-- Remover a constraint UNIQUE do email (se existir)
-- Isso permite ter múltiplos guests sem email (NULL)
ALTER TABLE public.guests 
DROP CONSTRAINT IF EXISTS guests_email_key;

-- Criar um índice parcial para emails únicos (apenas quando não for NULL)
CREATE UNIQUE INDEX IF NOT EXISTS guests_email_unique_idx 
ON public.guests (email) 
WHERE email IS NOT NULL;
