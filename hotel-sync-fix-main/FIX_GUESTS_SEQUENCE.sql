-- Verificar a sequência do ID da tabela guests
SELECT pg_get_serial_sequence('public.guests', 'id') as sequence_name;

-- Ver o próximo valor da sequência
SELECT nextval(pg_get_serial_sequence('public.guests', 'id'));

-- Ver o maior ID atual na tabela
SELECT MAX(id) FROM public.guests;

-- Resetar a sequência para o valor correto (maior ID + 1)
SELECT setval(pg_get_serial_sequence('public.guests', 'id'), (SELECT COALESCE(MAX(id), 0) + 1 FROM public.guests), false);
