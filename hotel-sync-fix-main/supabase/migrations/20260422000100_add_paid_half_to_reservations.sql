-- Adiciona suporte a meio pagamento nas reservas
ALTER TABLE public.reservations
ADD COLUMN IF NOT EXISTS paid_half boolean NOT NULL DEFAULT false;
