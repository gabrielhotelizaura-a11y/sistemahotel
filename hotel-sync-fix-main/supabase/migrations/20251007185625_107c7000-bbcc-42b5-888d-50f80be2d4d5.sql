-- Criar enum para roles de usuários
CREATE TYPE public.app_role AS ENUM ('admin', 'funcionario');

-- Criar tabela de perfis de usuários
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  nome TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Criar tabela de roles de usuários
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

-- Criar tabela de quartos
CREATE TABLE public.rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  number TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL,
  capacity INT NOT NULL,
  beds INT NOT NULL,
  price NUMERIC(10, 2) NOT NULL,
  amenities JSONB DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'available',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Criar tabela de hóspedes
CREATE TABLE public.guests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  cpf TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Criar tabela de reservas
CREATE TABLE public.reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES public.rooms(id) ON DELETE CASCADE NOT NULL,
  guest_id UUID REFERENCES public.guests(id) ON DELETE CASCADE NOT NULL,
  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  num_guests INT NOT NULL,
  status TEXT NOT NULL DEFAULT 'future',
  total_price NUMERIC(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Criar tabela de despesas
CREATE TABLE public.expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_id UUID REFERENCES public.guests(id) ON DELETE CASCADE NOT NULL,
  reservation_id UUID REFERENCES public.reservations(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  value NUMERIC(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

-- Função para verificar role do usuário (security definer para evitar recursão)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Função para obter role do usuário
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS app_role
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role
  FROM public.user_roles
  WHERE user_id = _user_id
  LIMIT 1
$$;

-- RLS Policies para profiles
CREATE POLICY "Usuários podem ver todos os perfis"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuários podem atualizar próprio perfil"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- RLS Policies para user_roles
CREATE POLICY "Usuários podem ver própria role"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins podem gerenciar roles"
  ON public.user_roles FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies para rooms
CREATE POLICY "Todos usuários autenticados podem ver quartos"
  ON public.rooms FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Apenas admins podem modificar quartos"
  ON public.rooms FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies para guests
CREATE POLICY "Todos usuários autenticados podem ver hóspedes"
  ON public.guests FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Todos usuários autenticados podem criar hóspedes"
  ON public.guests FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Todos usuários autenticados podem atualizar hóspedes"
  ON public.guests FOR UPDATE
  TO authenticated
  USING (true);

-- RLS Policies para reservations
CREATE POLICY "Todos usuários autenticados podem ver reservas"
  ON public.reservations FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Todos usuários autenticados podem criar reservas"
  ON public.reservations FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Todos usuários autenticados podem atualizar reservas"
  ON public.reservations FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Apenas admins podem deletar reservas"
  ON public.reservations FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies para expenses
CREATE POLICY "Todos usuários autenticados podem ver despesas"
  ON public.expenses FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Todos usuários autenticados podem criar despesas"
  ON public.expenses FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Trigger para criar perfil automaticamente ao criar usuário
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, nome)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'nome', new.email)
  );
  RETURN new;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Inserir dados dos quartos
INSERT INTO public.rooms (number, type, capacity, beds, price, amenities, status) VALUES
('101', 'Casal', 2, 1, 120.00, '["wifi", "tv"]'::jsonb, 'available'),
('102', 'Casal', 2, 1, 120.00, '["wifi", "tv"]'::jsonb, 'available'),
('103', 'Solteiro', 1, 1, 100.00, '["wifi", "tv"]'::jsonb, 'available'),
('104', 'Solteiro', 1, 1, 100.00, '["wifi", "tv"]'::jsonb, 'available'),
('201', 'Casal com AR', 2, 1, 149.00, '["wifi", "tv", "ar-condicionado"]'::jsonb, 'available'),
('202', 'Triplo', 3, 2, 100.00, '["wifi", "tv"]'::jsonb, 'available'),
('203', 'Casal com AR', 2, 1, 149.00, '["wifi", "tv", "ar-condicionado"]'::jsonb, 'available'),
('204', 'Solteiro', 1, 1, 100.00, '["wifi", "tv"]'::jsonb, 'available'),
('205', 'Casal', 2, 1, 120.00, '["wifi", "tv"]'::jsonb, 'available'),
('206', 'Solteiro', 1, 1, 100.00, '["wifi", "tv"]'::jsonb, 'available'),
('207', 'Solteiro', 1, 1, 100.00, '["wifi", "tv"]'::jsonb, 'available'),
('208', 'Casal', 2, 1, 120.00, '["wifi", "tv"]'::jsonb, 'available'),
('209', 'Solteiro', 1, 1, 100.00, '["wifi", "tv"]'::jsonb, 'available'),
('210', 'Casal', 2, 1, 120.00, '["wifi", "tv"]'::jsonb, 'available'),
('301', 'Casal com AR', 2, 1, 149.00, '["wifi", "tv", "ar-condicionado"]'::jsonb, 'available'),
('302', 'Triplo', 3, 2, 100.00, '["wifi", "tv"]'::jsonb, 'available'),
('303', 'Casal com AR', 2, 1, 149.00, '["wifi", "tv", "ar-condicionado"]'::jsonb, 'available'),
('304', 'Solteiro', 1, 1, 100.00, '["wifi", "tv"]'::jsonb, 'available'),
('305', 'Casal', 2, 1, 120.00, '["wifi", "tv"]'::jsonb, 'available'),
('306', 'Solteiro', 1, 1, 100.00, '["wifi", "tv"]'::jsonb, 'available'),
('307', 'Solteiro', 1, 1, 100.00, '["wifi", "tv"]'::jsonb, 'available'),
('308', 'Casal', 2, 1, 120.00, '["wifi", "tv"]'::jsonb, 'available'),
('309', 'Casal', 2, 1, 120.00, '["wifi", "tv"]'::jsonb, 'available'),
('310', 'Casal', 2, 1, 120.00, '["wifi", "tv"]'::jsonb, 'available'),
('401', 'Casal', 2, 1, 120.00, '["wifi", "tv"]'::jsonb, 'available'),
('402', 'Triplo', 3, 2, 100.00, '["wifi", "tv"]'::jsonb, 'available'),
('403', 'Casal', 2, 1, 120.00, '["wifi", "tv"]'::jsonb, 'available'),
('404', 'Solteiro', 1, 1, 100.00, '["wifi", "tv"]'::jsonb, 'available'),
('405', 'Casal', 2, 1, 120.00, '["wifi", "tv"]'::jsonb, 'available'),
('406', 'Solteiro', 1, 1, 100.00, '["wifi", "tv"]'::jsonb, 'available'),
('407', 'Solteiro', 1, 1, 100.00, '["wifi", "tv"]'::jsonb, 'available'),
('408', 'Casal', 2, 1, 120.00, '["wifi", "tv"]'::jsonb, 'available'),
('409', 'Casal', 2, 1, 120.00, '["wifi", "tv"]'::jsonb, 'available'),
('410', 'Casal', 2, 1, 120.00, '["wifi", "tv"]'::jsonb, 'available');