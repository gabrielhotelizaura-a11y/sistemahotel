-- RPCs para gestão de usuários por administradores

CREATE OR REPLACE FUNCTION public.list_users_with_roles()
RETURNS TABLE (
  user_id uuid,
  email text,
  nome text,
  role public.app_role,
  created_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Usuário não autenticado';
  END IF;

  IF NOT public.has_role(auth.uid(), 'admin'::public.app_role) THEN
    RAISE EXCEPTION 'Apenas admins podem listar usuários';
  END IF;

  RETURN QUERY
  SELECT
    u.id,
    u.email::text,
    COALESCE(
      p.nome,
      (u.raw_user_meta_data ->> 'nome')::text,
      split_part(u.email::text, '@', 1)
    ) AS nome,
    COALESCE(ur.role, 'funcionario'::public.app_role) AS role,
    u.created_at
  FROM auth.users u
  LEFT JOIN public.user_roles ur ON ur.user_id = u.id
  LEFT JOIN public.profiles p ON p.id = u.id
  ORDER BY u.created_at DESC;
END;
$$;

CREATE OR REPLACE FUNCTION public.set_user_role(
  p_target_user_id uuid,
  p_new_role public.app_role
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Usuário não autenticado';
  END IF;

  IF NOT public.has_role(auth.uid(), 'admin'::public.app_role) THEN
    RAISE EXCEPTION 'Apenas admins podem alterar permissões';
  END IF;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (p_target_user_id, p_new_role)
  ON CONFLICT (user_id)
  DO UPDATE SET role = EXCLUDED.role;
END;
$$;

REVOKE ALL ON FUNCTION public.list_users_with_roles() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.set_user_role(uuid, public.app_role) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.list_users_with_roles() TO authenticated;
GRANT EXECUTE ON FUNCTION public.set_user_role(uuid, public.app_role) TO authenticated;
