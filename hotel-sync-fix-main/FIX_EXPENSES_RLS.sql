-- 🔓 DESABILITAR RLS NA TABELA EXPENSES

-- Desabilitar RLS
ALTER TABLE public.expenses DISABLE ROW LEVEL SECURITY;

-- Dropar todas as políticas existentes (se houver)
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE schemaname = 'public' AND tablename = 'expenses'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON public.expenses';
    END LOOP;
END $$;

-- Verificar se foi desabilitado
SELECT 
  tablename,
  rowsecurity as rls_ativo,
  CASE 
    WHEN rowsecurity THEN '🔒 RLS ATIVO (vai dar erro)'
    ELSE '✅ RLS DESATIVADO (ok)'
  END as status
FROM pg_tables
WHERE schemaname = 'public' AND tablename = 'expenses';

-- Testar insert na tabela (com dados de exemplo)
-- Substitua os IDs por IDs reais do seu banco
/*
INSERT INTO public.expenses (guest_id, reservation_id, description, value)
VALUES (
  'id-do-guest-aqui',
  'id-da-reserva-aqui',
  'Teste',
  10.00
);
*/

-- Ver todas as despesas
SELECT * FROM public.expenses ORDER BY created_at DESC;
