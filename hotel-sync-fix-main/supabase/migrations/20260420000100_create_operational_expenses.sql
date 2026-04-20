-- Tabela usada pela página de Despesas Operacionais
CREATE TABLE IF NOT EXISTS public.operational_expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  description text NOT NULL,
  value numeric(12,2) NOT NULL CHECK (value >= 0),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_operational_expenses_created_at
  ON public.operational_expenses (created_at DESC);

ALTER TABLE public.operational_expenses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated can view operational expenses" ON public.operational_expenses;
DROP POLICY IF EXISTS "Staff can manage operational expenses" ON public.operational_expenses;

CREATE POLICY "Authenticated can view operational expenses"
  ON public.operational_expenses FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Staff can manage operational expenses"
  ON public.operational_expenses FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.user_roles
      WHERE user_id = auth.uid()
        AND role IN ('admin', 'funcionario')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.user_roles
      WHERE user_id = auth.uid()
        AND role IN ('admin', 'funcionario')
    )
  );
