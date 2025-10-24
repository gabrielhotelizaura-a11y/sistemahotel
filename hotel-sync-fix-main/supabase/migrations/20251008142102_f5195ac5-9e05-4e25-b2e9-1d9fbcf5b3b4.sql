-- Criar trigger para inserir role automaticamente quando um usuário se cadastra
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Inserir role padrão 'funcionario' para novo usuário
  INSERT INTO public.user_roles (user_id, role)
  VALUES (new.id, 'funcionario');
  RETURN new;
END;
$$;

-- Criar trigger que executa após inserir um novo usuário em auth.users
CREATE TRIGGER on_auth_user_created_role
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_role();