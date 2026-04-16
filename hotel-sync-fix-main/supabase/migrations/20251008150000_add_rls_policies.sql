-- Enable Row Level Security on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Authenticated users can view guests" ON guests;
DROP POLICY IF EXISTS "Admin and funcionario can manage guests" ON guests;
DROP POLICY IF EXISTS "Everyone can view available rooms" ON rooms;
DROP POLICY IF EXISTS "Admin can manage rooms" ON rooms;
DROP POLICY IF EXISTS "Staff can manage rooms" ON rooms;
DROP POLICY IF EXISTS "Authenticated users can view reservations" ON reservations;
DROP POLICY IF EXISTS "Admin and funcionario can manage reservations" ON reservations;
DROP POLICY IF EXISTS "Authenticated users can view expenses" ON expenses;
DROP POLICY IF EXISTS "Admin and funcionario can manage expenses" ON expenses;
DROP POLICY IF EXISTS "Users can view their own role" ON user_roles;
DROP POLICY IF EXISTS "Only admins can modify roles" ON user_roles;
DROP POLICY IF EXISTS "Service role can manage user roles" ON user_roles;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Guests policies
CREATE POLICY "Authenticated users can view guests"
  ON guests FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admin and funcionario can manage guests"
  ON guests FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'funcionario')
    )
  );

-- Rooms policies
CREATE POLICY "Everyone can view available rooms"
  ON rooms FOR SELECT
  USING (status = 'available' OR auth.role() = 'authenticated');

CREATE POLICY "Staff can manage rooms"
  ON rooms FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'funcionario')
    )
  );

-- Reservations policies
CREATE POLICY "Authenticated users can view reservations"
  ON reservations FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admin and funcionario can manage reservations"
  ON reservations FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'funcionario')
    )
  );

-- Expenses policies
CREATE POLICY "Authenticated users can view expenses"
  ON expenses FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admin and funcionario can manage expenses"
  ON expenses FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'funcionario')
    )
  );

-- User roles policies
CREATE POLICY "Users can view their own role"
  ON user_roles FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Service role can manage user roles"
  ON user_roles FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Create function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = is_admin.user_id
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to check if user is staff (admin or funcionario)
CREATE OR REPLACE FUNCTION is_staff(user_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = is_staff.user_id
    AND role IN ('admin', 'funcionario')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_reservations_status ON reservations(status);
CREATE INDEX IF NOT EXISTS idx_reservations_dates ON reservations(check_in, check_out);
CREATE INDEX IF NOT EXISTS idx_rooms_status ON rooms(status);
CREATE INDEX IF NOT EXISTS idx_guests_email ON guests(email);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
