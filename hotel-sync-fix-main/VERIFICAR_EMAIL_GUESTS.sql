-- Verificar se a coluna email permite NULL
SELECT 
    column_name,
    is_nullable,
    column_default,
    data_type
FROM information_schema.columns
WHERE table_name = 'guests' 
  AND table_schema = 'public'
  AND column_name = 'email';

-- Ver todas as constraints da tabela guests
SELECT
    con.conname AS constraint_name,
    con.contype AS constraint_type,
    CASE con.contype
        WHEN 'c' THEN 'CHECK'
        WHEN 'f' THEN 'FOREIGN KEY'
        WHEN 'p' THEN 'PRIMARY KEY'
        WHEN 'u' THEN 'UNIQUE'
        WHEN 't' THEN 'TRIGGER'
        WHEN 'x' THEN 'EXCLUSION'
    END AS constraint_description
FROM pg_constraint con
JOIN pg_class rel ON rel.oid = con.conrelid
JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
WHERE rel.relname = 'guests'
  AND nsp.nspname = 'public';
