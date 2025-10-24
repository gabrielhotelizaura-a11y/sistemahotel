-- 🏨 ADICIONAR QUARTOS - EXEMPLO E TEMPLATE

-- 📝 EXEMPLO: Quarto 501
INSERT INTO public.rooms (room_number, type, floor, price, amenities, status)
VALUES (
  '501',                          -- Número do quarto
  'standard',                     -- Tipo: standard, deluxe, suite
  5,                             -- Andar
  149.00,                        -- Preço por noite
  ARRAY['Ar Condicionado', 'TV', 'WiFi'],  -- Comodidades (pode adicionar mais)
  'available'                    -- Status: available, occupied, maintenance
);

-- ✨ TEMPLATE: Adicione os outros 14 quartos aqui
-- Copie e cole essa estrutura mudando os valores:

INSERT INTO public.rooms (room_number, type, floor, price, amenities, status)
VALUES 
  -- Quartos do 5º andar (501-505)
  ('502', 'standard', 5, 149.00, ARRAY['Ar Condicionado', 'TV', 'WiFi'], 'available'),
  ('503', 'standard', 5, 149.00, ARRAY['Ar Condicionado', 'TV', 'WiFi'], 'available'),
  ('504', 'deluxe', 5, 199.00, ARRAY['Ar Condicionado', 'TV', 'WiFi', 'Frigobar'], 'available'),
  ('505', 'suite', 5, 299.00, ARRAY['Ar Condicionado', 'TV', 'WiFi', 'Frigobar', 'Banheira'], 'available'),
  
  -- Quartos do 6º andar (601-605)
  ('601', 'standard', 6, 149.00, ARRAY['Ar Condicionado', 'TV', 'WiFi'], 'available'),
  ('602', 'standard', 6, 149.00, ARRAY['Ar Condicionado', 'TV', 'WiFi'], 'available'),
  ('603', 'standard', 6, 149.00, ARRAY['Ar Condicionado', 'TV', 'WiFi'], 'available'),
  ('604', 'deluxe', 6, 199.00, ARRAY['Ar Condicionado', 'TV', 'WiFi', 'Frigobar'], 'available'),
  ('605', 'suite', 6, 299.00, ARRAY['Ar Condicionado', 'TV', 'WiFi', 'Frigobar', 'Banheira'], 'available'),
  
  -- Quartos do 7º andar (701-705)
  ('701', 'standard', 7, 149.00, ARRAY['Ar Condicionado', 'TV', 'WiFi'], 'available'),
  ('702', 'standard', 7, 149.00, ARRAY['Ar Condicionado', 'TV', 'WiFi'], 'available'),
  ('703', 'deluxe', 7, 199.00, ARRAY['Ar Condicionado', 'TV', 'WiFi', 'Frigobar'], 'available'),
  ('704', 'deluxe', 7, 199.00, ARRAY['Ar Condicionado', 'TV', 'WiFi', 'Frigobar'], 'available'),
  ('705', 'suite', 7, 299.00, ARRAY['Ar Condicionado', 'TV', 'WiFi', 'Frigobar', 'Banheira', 'Varanda'], 'available');

-- 📊 Verificar quantos quartos foram adicionados
SELECT 
  COUNT(*) as total_quartos,
  type,
  COUNT(*) as quantidade_por_tipo
FROM public.rooms
GROUP BY type
ORDER BY type;

-- 📋 Ver todos os quartos ordenados por número
SELECT 
  room_number,
  type,
  floor,
  price,
  amenities,
  status
FROM public.rooms
ORDER BY room_number;
