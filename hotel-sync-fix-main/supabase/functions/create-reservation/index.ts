// ⚠️ NOTA: Este arquivo pode mostrar erros vermelhos no VS Code.
// Isso é NORMAL! As Edge Functions rodam no Deno, não no Node.js.
// Para remover os erros, instale a extensão "Deno for VS Code".
// Veja: supabase/functions/README_ERRORS.md

// Edge Function to validate and create reservations with additional business logic
// @ts-ignore: Deno imports
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
// @ts-ignore: Deno imports
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CreateReservationRequest {
  room_id: string;
  guest_data: {
    name: string;
    email: string;
    phone?: string;
    cpf?: string;
  };
  check_in: string;
  check_out: string;
  num_guests: number;
  total_price: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    // Verify user is authenticated and has proper role
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('Missing authorization header')
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token)

    if (authError || !user) {
      throw new Error('Unauthorized')
    }

    // Check user role
    const { data: roleData } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    if (!roleData || !['admin', 'funcionario'].includes(roleData.role)) {
      throw new Error('Insufficient permissions')
    }

    const requestData: CreateReservationRequest = await req.json()

    // Validate dates
    const checkIn = new Date(requestData.check_in)
    const checkOut = new Date(requestData.check_out)

    if (checkOut <= checkIn) {
      throw new Error('Check-out must be after check-in')
    }

    // Check room availability
    const { data: existingReservations } = await supabaseClient
      .from('reservations')
      .select('id')
      .eq('room_id', requestData.room_id)
      .not('status', 'in', '(cancelled,completed)')
      .or(
        `and(check_in.lte.${requestData.check_in},check_out.gt.${requestData.check_in}),` +
        `and(check_in.lt.${requestData.check_out},check_out.gte.${requestData.check_out}),` +
        `and(check_in.gte.${requestData.check_in},check_out.lte.${requestData.check_out})`
      )

    if (existingReservations && existingReservations.length > 0) {
      throw new Error('Room is not available for selected dates')
    }

    // Create or get guest
    let guestId: string

    const { data: existingGuest } = await supabaseClient
      .from('guests')
      .select('id')
      .eq('email', requestData.guest_data.email)
      .single()

    if (existingGuest) {
      guestId = existingGuest.id

      // Update guest data if provided
      await supabaseClient
        .from('guests')
        .update(requestData.guest_data)
        .eq('id', guestId)
    } else {
      const { data: newGuest, error: guestError } = await supabaseClient
        .from('guests')
        .insert(requestData.guest_data)
        .select()
        .single()

      if (guestError) throw guestError
      guestId = newGuest.id
    }

    // Determine reservation status
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    checkIn.setHours(0, 0, 0, 0)

    const status = checkIn > today ? 'future' : 'active'

    // Create reservation
    const { data: reservation, error: reservationError } = await supabaseClient
      .from('reservations')
      .insert({
        room_id: requestData.room_id,
        guest_id: guestId,
        check_in: requestData.check_in,
        check_out: requestData.check_out,
        num_guests: requestData.num_guests,
        total_price: requestData.total_price,
        status: status,
        created_by: user.id,
      })
      .select()
      .single()

    if (reservationError) throw reservationError

    // Update room status if active reservation
    if (status === 'active') {
      await supabaseClient
        .from('rooms')
        .update({ status: 'occupied' })
        .eq('id', requestData.room_id)
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: reservation,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 201,
      },
    )

  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})
