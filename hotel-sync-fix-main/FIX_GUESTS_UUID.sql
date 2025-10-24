-- Ver a estrutura atual da tabela guests
SELECT 
    column_name,
    data_type,
    column_default,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'guests' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- Corrigir a coluna ID para gerar UUID automaticamente
ALTER TABLE public.guests 
ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- Verificar se funcionou
SELECT column_name, column_default 
FROM information_schema.columns 
WHERE table_name = 'guests' 
  AND column_name = 'id';
