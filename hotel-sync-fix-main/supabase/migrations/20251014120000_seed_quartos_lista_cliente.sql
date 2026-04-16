-- Seed de quartos solicitado pelo cliente
-- Lista:
-- 1
-- 5 ar
-- 7
-- 8
-- 9
-- 10
-- 11
-- 12
-- 13
-- 14
-- 23 ar
-- 24
-- 25
-- 26 ar
-- 27 ar
-- 28 ar
-- 29 ar
-- 30 ar

-- Convenção adotada:
-- - Quartos com "ar": amenities incluem "Ar-condicionado"
-- - Demais quartos: sem ar-condicionado
-- - type padrão: Standard
-- - capacity: 2
-- - beds: 1
-- - price: 180 (sem ar) / 220 (com ar)

INSERT INTO public.rooms (number, type, capacity, beds, price, amenities, status)
VALUES
  ('1',  'Standard', 2, 1, 180.00, '["Wi-Fi", "TV"]'::jsonb, 'available'),
  ('5',  'Standard', 2, 1, 220.00, '["Ar-condicionado", "Wi-Fi", "TV"]'::jsonb, 'available'),
  ('7',  'Standard', 2, 1, 180.00, '["Wi-Fi", "TV"]'::jsonb, 'available'),
  ('8',  'Standard', 2, 1, 180.00, '["Wi-Fi", "TV"]'::jsonb, 'available'),
  ('9',  'Standard', 2, 1, 180.00, '["Wi-Fi", "TV"]'::jsonb, 'available'),
  ('10', 'Standard', 2, 1, 180.00, '["Wi-Fi", "TV"]'::jsonb, 'available'),
  ('11', 'Standard', 2, 1, 180.00, '["Wi-Fi", "TV"]'::jsonb, 'available'),
  ('12', 'Standard', 2, 1, 180.00, '["Wi-Fi", "TV"]'::jsonb, 'available'),
  ('13', 'Standard', 2, 1, 180.00, '["Wi-Fi", "TV"]'::jsonb, 'available'),
  ('14', 'Standard', 2, 1, 180.00, '["Wi-Fi", "TV"]'::jsonb, 'available'),
  ('23', 'Standard', 2, 1, 220.00, '["Ar-condicionado", "Wi-Fi", "TV"]'::jsonb, 'available'),
  ('24', 'Standard', 2, 1, 180.00, '["Wi-Fi", "TV"]'::jsonb, 'available'),
  ('25', 'Standard', 2, 1, 180.00, '["Wi-Fi", "TV"]'::jsonb, 'available'),
  ('26', 'Standard', 2, 1, 220.00, '["Ar-condicionado", "Wi-Fi", "TV"]'::jsonb, 'available'),
  ('27', 'Standard', 2, 1, 220.00, '["Ar-condicionado", "Wi-Fi", "TV"]'::jsonb, 'available'),
  ('28', 'Standard', 2, 1, 220.00, '["Ar-condicionado", "Wi-Fi", "TV"]'::jsonb, 'available'),
  ('29', 'Standard', 2, 1, 220.00, '["Ar-condicionado", "Wi-Fi", "TV"]'::jsonb, 'available'),
  ('30', 'Standard', 2, 1, 220.00, '["Ar-condicionado", "Wi-Fi", "TV"]'::jsonb, 'available')
ON CONFLICT (number)
DO UPDATE SET
  type = EXCLUDED.type,
  capacity = EXCLUDED.capacity,
  beds = EXCLUDED.beds,
  price = EXCLUDED.price,
  amenities = EXCLUDED.amenities;
