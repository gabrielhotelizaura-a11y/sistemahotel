-- Create a function to validate reservation dates and availability
CREATE OR REPLACE FUNCTION validate_reservation()
RETURNS TRIGGER AS $$
DECLARE
  overlapping_count INT;
BEGIN
  -- Check if check_out is after check_in
  IF NEW.check_out <= NEW.check_in THEN
    RAISE EXCEPTION 'Check-out deve ser após check-in';
  END IF;

  -- Check if room is available for the dates (excluding cancelled reservations)
  SELECT COUNT(*) INTO overlapping_count
  FROM reservations
  WHERE room_id = NEW.room_id
    AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
    AND status NOT IN ('cancelled', 'completed')
    AND (
      (check_in <= NEW.check_in AND check_out > NEW.check_in)
      OR (check_in < NEW.check_out AND check_out >= NEW.check_out)
      OR (check_in >= NEW.check_in AND check_out <= NEW.check_out)
    );

  IF overlapping_count > 0 THEN
    RAISE EXCEPTION 'Quarto já está reservado para este período';
  END IF;

  -- Set created_by if not set
  IF NEW.created_by IS NULL THEN
    NEW.created_by := auth.uid();
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for reservation validation
DROP TRIGGER IF EXISTS validate_reservation_trigger ON reservations;
CREATE TRIGGER validate_reservation_trigger
  BEFORE INSERT OR UPDATE ON reservations
  FOR EACH ROW
  EXECUTE FUNCTION validate_reservation();

-- Create function to auto-update room status based on reservations
CREATE OR REPLACE FUNCTION update_room_status_on_reservation()
RETURNS TRIGGER AS $$
BEGIN
  -- When a reservation becomes active, mark room as occupied
  IF NEW.status = 'active' AND (OLD IS NULL OR OLD.status != 'active') THEN
    UPDATE rooms SET status = 'occupied' WHERE id = NEW.room_id;
  END IF;

  -- When a reservation is completed or cancelled, check if room should be available
  IF NEW.status IN ('completed', 'cancelled') AND (OLD IS NULL OR OLD.status NOT IN ('completed', 'cancelled')) THEN
    -- Only set to available if there are no other active reservations
    IF NOT EXISTS (
      SELECT 1 FROM reservations
      WHERE room_id = NEW.room_id
        AND status = 'active'
        AND id != NEW.id
    ) THEN
      UPDATE rooms SET status = 'available' WHERE id = NEW.room_id;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for room status update
DROP TRIGGER IF EXISTS update_room_status_trigger ON reservations;
CREATE TRIGGER update_room_status_trigger
  AFTER INSERT OR UPDATE ON reservations
  FOR EACH ROW
  EXECUTE FUNCTION update_room_status_on_reservation();

-- Create function to auto-activate future reservations
CREATE OR REPLACE FUNCTION activate_future_reservations()
RETURNS void AS $$
BEGIN
  -- Update reservations that should become active today
  UPDATE reservations
  SET status = 'active'
  WHERE status = 'future'
    AND check_in::date <= CURRENT_DATE;

  -- Update room status for newly activated reservations
  UPDATE rooms
  SET status = 'occupied'
  WHERE id IN (
    SELECT DISTINCT room_id
    FROM reservations
    WHERE status = 'active'
  );
END;
$$ LANGUAGE plpgsql;

-- Create a scheduled job to run the activation function
-- Note: This requires pg_cron extension
-- If not available, you can call this function from your application or use Supabase Edge Functions

-- Add updated_at column if not exists and create trigger
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reservations' AND column_name = 'updated_at') THEN
    ALTER TABLE reservations ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rooms' AND column_name = 'updated_at') THEN
    ALTER TABLE rooms ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'guests' AND column_name = 'updated_at') THEN
    ALTER TABLE guests ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  END IF;
END$$;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_reservations_updated_at ON reservations;
CREATE TRIGGER update_reservations_updated_at
  BEFORE UPDATE ON reservations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_rooms_updated_at ON rooms;
CREATE TRIGGER update_rooms_updated_at
  BEFORE UPDATE ON rooms
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_guests_updated_at ON guests;
CREATE TRIGGER update_guests_updated_at
  BEFORE UPDATE ON guests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
