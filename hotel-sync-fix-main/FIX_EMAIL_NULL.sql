-- PASSO 1: Tornar o email opcional (remover NOT NULL)
ALTER TABLE public.guests ALTER COLUMN email DROP NOT NULL;

-- PASSO 2: Atualizar emails vazios existentes para NULL
UPDATE public.guests SET email = NULL WHERE email = '';

-- PASSO 3: Verificar se funcionou
SELECT column_name, is_nullable, data_type 
FROM information_schema.columns 
WHERE table_name = 'guests' AND column_name = 'email';
