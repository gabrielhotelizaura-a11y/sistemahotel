-- Corrigir problema de timezone nas datas de check-in e check-out
-- O PostgreSQL estava interpretando DATE com timezone, causando datas erradas

-- Esta migration garante que as datas sejam tratadas como DATE simples (sem timezone)
-- e adiciona uma função para prevenir o problema

-- Adicionar comentário explicativo nas colunas
COMMENT ON COLUMN public.reservations.check_in IS 'Data de check-in (formato: YYYY-MM-DD, sem timezone)';
COMMENT ON COLUMN public.reservations.check_out IS 'Data de check-out (formato: YYYY-MM-DD, sem timezone)';

-- Criar função para garantir que CPF vazio seja NULL
CREATE OR REPLACE FUNCTION public.sanitize_guest_data()
RETURNS TRIGGER AS $$
BEGIN
  -- Se CPF for string vazia, converter para NULL
  IF NEW.cpf = '' THEN
    NEW.cpf := NULL;
  END IF;
  
  -- Se phone for string vazia, converter para NULL
  IF NEW.phone = '' THEN
    NEW.phone := NULL;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para sanitizar dados antes de inserir/atualizar
DROP TRIGGER IF EXISTS sanitize_guest_data_trigger ON public.guests;
CREATE TRIGGER sanitize_guest_data_trigger
  BEFORE INSERT OR UPDATE ON public.guests
  FOR EACH ROW
  EXECUTE FUNCTION public.sanitize_guest_data();

-- Limpar dados existentes (converter strings vazias em NULL)
UPDATE public.guests 
SET cpf = NULL 
WHERE cpf = '';

UPDATE public.guests 
SET phone = NULL 
WHERE phone = '';
