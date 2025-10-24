# Supabase Functions

Este diretório contém as Edge Functions do Supabase para o Sistema Hoteleiro.

## Funções Disponíveis

### 1. health-check
Verifica o status de saúde da aplicação e dos serviços.

**Endpoint:** `/functions/v1/health-check`

**Método:** GET

**Resposta:**
```json
{
  "status": "healthy",
  "timestamp": "2025-10-08T15:00:00.000Z",
  "version": "1.0.0",
  "services": {
    "database": true,
    "auth": true
  }
}
```

### 2. create-reservation
Cria uma nova reserva com validações de negócio e verificação de disponibilidade.

**Endpoint:** `/functions/v1/create-reservation`

**Método:** POST

**Headers:**
- `Authorization: Bearer <token>`
- `Content-Type: application/json`

**Body:**
```json
{
  "room_id": "uuid",
  "guest_data": {
    "name": "Nome do Hóspede",
    "email": "email@example.com",
    "phone": "(11) 98765-4321",
    "cpf": "123.456.789-00"
  },
  "check_in": "2025-10-10",
  "check_out": "2025-10-15",
  "num_guests": 2,
  "total_price": 500.00
}
```

## Como Desenvolver Localmente

1. Instale o Supabase CLI:
```bash
npm install -g supabase
```

2. Inicie o Supabase localmente:
```bash
supabase start
```

3. Sirva as funções localmente:
```bash
supabase functions serve
```

4. Teste as funções:
```bash
curl http://localhost:54321/functions/v1/health-check
```

## Como Fazer Deploy

1. Faça login no Supabase:
```bash
supabase login
```

2. Link com seu projeto:
```bash
supabase link --project-ref your-project-ref
```

3. Deploy das funções:
```bash
supabase functions deploy health-check
supabase functions deploy create-reservation
```

## Variáveis de Ambiente

As Edge Functions têm acesso automático a:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (apenas no backend)

Para adicionar mais variáveis:
```bash
supabase secrets set MY_SECRET=value
```

## Permissões

As funções seguem as políticas RLS (Row Level Security) do banco de dados. Certifique-se de que as políticas estão configuradas corretamente nas migrations.
