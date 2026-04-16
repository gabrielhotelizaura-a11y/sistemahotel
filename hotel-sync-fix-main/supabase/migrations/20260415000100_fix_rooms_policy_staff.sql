-- Corrige policy de rooms para permitir operações por admin e funcionario
DROP POLICY IF EXISTS "Admin can manage rooms" ON public.rooms;
DROP POLICY IF EXISTS "Staff can manage rooms" ON public.rooms;

CREATE POLICY "Staff can manage rooms"
  ON public.rooms FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.user_roles
      WHERE user_id = auth.uid()
        AND role IN ('admin', 'funcionario')
    )
  );
