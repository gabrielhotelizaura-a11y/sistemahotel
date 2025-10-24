import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Reservation, Guest } from '@/types/hotel';
import { toast } from 'sonner';
import { getTodayDateString } from '@/lib/dateUtils';

export function useReservations() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReservations();

    // Subscribe to realtime changes
    const channel = supabase
      .channel('reservations-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'reservations'
        },
        () => {
          fetchReservations();
        }
      )
      .subscribe();

    // ⏰ Verificar automaticamente a cada 30 segundos (mais frequente)
    const intervalId = setInterval(() => {
      console.log('⏰ [AUTO-CHECK] Verificando reservas...');
      fetchReservations();
    }, 30 * 1000); // 30 segundos

    return () => {
      supabase.removeChannel(channel);
      clearInterval(intervalId);
    };
  }, []);

  const fetchReservations = async () => {
    try {
      const { data, error } = await supabase
        .from('reservations')
        .select(`
          *,
          room:rooms(*),
          guest:guests(*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Ativar reservas futuras que chegaram no dia do check-in
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      for (const reservation of data || []) {
        if (reservation.status === 'future') {
          // Corrigir problema de fuso horário ao comparar datas
          const [year, month, day] = reservation.check_in.split('T')[0].split('-').map(Number);
          const checkInDate = new Date(year, month - 1, day);
          checkInDate.setHours(0, 0, 0, 0);

          if (checkInDate <= today) {
            // Ativar reserva e marcar quarto como ocupado
            await supabase
              .from('reservations')
              .update({ status: 'active' })
              .eq('id', reservation.id);

            await supabase
              .from('rooms')
              .update({ status: 'occupied' })
              .eq('id', reservation.room_id);
          }
        }
      }

      // Buscar dados atualizados
      const { data: updatedData, error: updateError } = await supabase
        .from('reservations')
        .select(`
          *,
          room:rooms(*),
          guest:guests(*)
        `)
        .order('created_at', { ascending: false });

      if (updateError) throw updateError;

      setReservations((updatedData || []).map(res => ({
        ...res,
        room: res.room ? {
          ...res.room,
          amenities: (res.room.amenities as any) || [],
          status: res.room.status as any
        } : undefined,
        status: res.status as any,
        paid: (res as any).paid || false
      })));
    } catch (error) {
      console.error('Error fetching reservations:', error);
      toast.error('Erro ao carregar reservas');
    } finally {
      setLoading(false);
    }
  };

  const createReservation = async (
    roomId: string,
    guestData: Omit<Guest, 'id' | 'created_at'>,
    checkIn: string,
    checkOut: string,
    numGuests: number,
    totalPrice: number
  ) => {
    try {
      console.log('🏨 createReservation chamado com:', {
        roomId,
        guestData,
        checkIn,
        checkOut,
        numGuests,
        totalPrice
      });

      // Verificar se é reserva futura ou atual
      // Corrigir problema de fuso horário: usar apenas a data sem conversão UTC
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Criar data do check-in no fuso horário local (evita problema UTC)
      const [checkInYear, checkInMonth, checkInDay] = checkIn.split('-').map(Number);
      const checkInDate = new Date(checkInYear, checkInMonth - 1, checkInDay);
      checkInDate.setHours(0, 0, 0, 0);

      // ✅ CORRIGIDO: Reserva para HOJE deve ser 'active', só futuro se for DEPOIS de hoje
      const isFutureReservation = checkInDate > today; // Se for MAIOR que hoje = futuro
      const reservationStatus = isFutureReservation ? 'future' : 'active'; // Hoje ou passado = active

      console.log('════════════════════════════════════════');
      console.log('📅 DIAGNÓSTICO DA RESERVA:');
      console.log('🕐 Data de HOJE:', today.toLocaleDateString('pt-BR'), '(sem hora)');
      console.log('📆 Data do CHECK-IN:', checkInDate.toLocaleDateString('pt-BR'), '(sem hora)');
      console.log('❓ Check-in > Hoje?', checkInDate > today);
      console.log('❓ Check-in === Hoje?', checkInDate.getTime() === today.getTime());
      console.log('❓ Check-in < Hoje?', checkInDate < today);
      console.log('🎯 É FUTURA?', isFutureReservation);
      console.log('📋 STATUS FINAL:', reservationStatus);
      console.log('🚪 Quarto vai ficar OCUPADO?', !isFutureReservation ? 'SIM ✅' : 'NÃO ❌');
      console.log('════════════════════════════════════════');

      // Criar novo guest (não buscar existente para evitar conflitos)
      let guestId: string;

      const guestDataToSave = {
        name: guestData.name,
        email: guestData.email || null,
        phone: guestData.phone || null,
        cpf: guestData.cpf || null
      };

      console.log('➕ Criando novo guest...', guestDataToSave);

      const { data: newGuest, error: guestError } = await supabase
        .from('guests')
        .insert(guestDataToSave)
        .select()
        .single();

      if (guestError) {
        console.error('❌ Erro ao criar guest:', guestError);
        console.error('❌ Detalhes completos do erro:', JSON.stringify(guestError, null, 2));
        throw guestError;
      }

      guestId = newGuest.id;
      console.log('✅ Novo guest criado com ID:', guestId);

      // Create reservation
      // Formatar datas corretamente para evitar problema de fuso horário
      // O PostgreSQL espera DATE no formato YYYY-MM-DD, mas precisa ser explícito
      const reservationData = {
        room_id: roomId,
        guest_id: guestId,
        check_in: checkIn, // Já está no formato correto YYYY-MM-DD
        check_out: checkOut, // Já está no formato correto YYYY-MM-DD
        num_guests: numGuests,
        total_price: totalPrice,
        status: reservationStatus
      };

      console.log('📝 Criando reserva com dados:', reservationData);
      console.log('📅 Check-in enviado:', checkIn);
      console.log('📅 Check-out enviado:', checkOut);
      console.log('📅 Timezone do navegador:', Intl.DateTimeFormat().resolvedOptions().timeZone);

      const { data: insertedData, error: reservationError } = await supabase
        .from('reservations')
        .insert(reservationData)
        .select();

      if (reservationError) {
        console.error('❌ Erro ao criar reserva:', reservationError);
        throw reservationError;
      }

      console.log('✅ Reserva criada no banco!');
      console.log('📅 Dados salvos:', insertedData);
      if (insertedData && insertedData[0]) {
        console.log('📅 Check-in salvo no banco:', insertedData[0].check_in);
        console.log('📅 Check-out salvo no banco:', insertedData[0].check_out);
      }

      // Só atualizar status do quarto para ocupado se for reserva atual
      if (!isFutureReservation) {
        console.log('🚪 Atualizando status do quarto para occupied...');
        const { error: roomError } = await supabase
          .from('rooms')
          .update({ status: 'occupied' })
          .eq('id', roomId);

        if (roomError) {
          console.error('❌ Erro ao atualizar status do quarto:', roomError);
          throw roomError;
        }
        console.log('✅ Status do quarto atualizado!');

        // ⚡ FORÇAR atualização imediata via broadcast
        await supabase.channel('rooms-changes').send({
          type: 'broadcast',
          event: 'room-updated',
          payload: { roomId, status: 'occupied' }
        });
      } else {
        console.log('⏭️ Reserva futura - não atualizando status do quarto');
      }

      const message = isFutureReservation
        ? 'Reserva futura criada com sucesso!'
        : 'Reserva criada com sucesso!';
      console.log('🎉 Sucesso:', message);
      toast.success(message);

      // ⚡ Atualizar IMEDIATAMENTE sem esperar realtime
      await fetchReservations();
    } catch (error: any) {
      console.error('❌ ERRO COMPLETO ao criar reserva:', error);
      console.error('❌ Error message:', error.message);
      console.error('❌ Error details:', error.details);
      console.error('❌ Error hint:', error.hint);
      toast.error('Erro ao criar reserva: ' + (error.message || 'Erro desconhecido'));
      throw error;
    }
  };

  const cancelReservation = async (reservationId: string, roomId: string) => {
    try {
      console.log('🚫 Cancelando reserva:', { reservationId, roomId });

      const { error: updateError } = await supabase
        .from('reservations')
        .update({ status: 'cancelled' })
        .eq('id', reservationId);

      if (updateError) {
        console.error('❌ Erro ao atualizar status da reserva:', updateError);
        throw updateError;
      }
      console.log('✅ Status da reserva atualizado para cancelled');

      // Update room status back to available
      console.log('🚪 Atualizando status do quarto para available...');
      const { error: roomError } = await supabase
        .from('rooms')
        .update({ status: 'available' })
        .eq('id', roomId);

      if (roomError) {
        console.error('❌ Erro ao atualizar status do quarto:', roomError);
        throw roomError;
      }
      console.log('✅ Status do quarto atualizado para available');

      toast.success('Reserva cancelada com sucesso!');
      fetchReservations();
    } catch (error: any) {
      console.error('❌ ERRO ao cancelar reserva:', error);
      console.error('❌ Error message:', error.message);
      toast.error('Erro ao cancelar reserva: ' + (error.message || 'Erro desconhecido'));
    }
  };

  const completeReservation = async (reservationId: string, roomId: string) => {
    try {
      console.log('✅ Completando reserva (Check-out):', { reservationId, roomId });

      const { error: updateError } = await supabase
        .from('reservations')
        .update({ status: 'completed' })
        .eq('id', reservationId);

      if (updateError) {
        console.error('❌ Erro ao atualizar status da reserva:', updateError);
        throw updateError;
      }
      console.log('✅ Status da reserva atualizado para completed');

      // 🔍 Verificar se existe reserva futura para HOJE neste quarto
      const todayStr = getTodayDateString();

      console.log('🔍 Verificando reservas futuras para hoje:', todayStr);

      const { data: futureReservations, error: futureError } = await supabase
        .from('reservations')
        .select('*')
        .eq('room_id', roomId)
        .eq('status', 'future')
        .gte('check_in', todayStr)
        .lte('check_in', todayStr)
        .order('created_at', { ascending: true })
        .limit(1);

      if (futureError) {
        console.error('❌ Erro ao buscar reservas futuras:', futureError);
      }

      if (futureReservations && futureReservations.length > 0) {
        // 🎯 Existe reserva futura para hoje! Ativar automaticamente
        const nextReservation = futureReservations[0];
        console.log('🎯 Reserva futura encontrada! Ativando automaticamente:', nextReservation.id);

        // Ativar a reserva futura
        const { error: activateError } = await supabase
          .from('reservations')
          .update({ status: 'active' })
          .eq('id', nextReservation.id);

        if (activateError) {
          console.error('❌ Erro ao ativar reserva futura:', activateError);
          throw activateError;
        }

        // Manter quarto como ocupado
        const { error: occupyError } = await supabase
          .from('rooms')
          .update({ status: 'occupied' })
          .eq('id', roomId);

        if (occupyError) {
          console.error('❌ Erro ao marcar quarto como ocupado:', occupyError);
          throw occupyError;
        }

        console.log('✅ Reserva futura ativada automaticamente!');
        toast.success('Check-out realizado! Próxima reserva ativada automaticamente.');
      } else {
        // Nenhuma reserva futura para hoje - liberar quarto
        console.log('🚪 Nenhuma reserva futura encontrada. Liberando quarto...');
        const { error: roomError } = await supabase
          .from('rooms')
          .update({ status: 'available' })
          .eq('id', roomId);

        if (roomError) {
          console.error('❌ Erro ao liberar quarto:', roomError);
          throw roomError;
        }
        console.log('✅ Quarto liberado com sucesso!');
        toast.success('Check-out realizado com sucesso!');
      }

      console.log('🎉 Check-out concluído!');
      fetchReservations();
    } catch (error: any) {
      console.error('❌ ERRO ao completar reserva:', error);
      console.error('❌ Error message:', error.message);
      console.error('❌ Error details:', error.details);
      console.error('❌ Error code:', error.code);
      toast.error('Erro ao finalizar reserva: ' + (error.message || 'Erro desconhecido'));
    }
  };

  const togglePaymentStatus = async (reservationId: string, currentStatus: boolean) => {
    try {
      const newStatus = !currentStatus;
      console.log(`💰 Alterando status de pagamento para: ${newStatus ? 'PAGO' : 'NÃO PAGO'}`);

      const { error } = await supabase
        .from('reservations')
        .update({ paid: newStatus } as any)
        .eq('id', reservationId);

      if (error) {
        console.error('❌ Erro do Supabase:', error);
        throw error;
      }

      toast.success(newStatus ? 'Reserva marcada como paga!' : 'Pagamento desmarcado');
      fetchReservations();
    } catch (error: any) {
      console.error('❌ Erro ao atualizar status de pagamento:', error);
      const errorMsg = error?.message || 'Erro desconhecido';
      toast.error(`Erro ao atualizar pagamento: ${errorMsg}`);

      // Se for erro de coluna inexistente, avisa o usuário
      if (errorMsg.includes('column') || errorMsg.includes('paid')) {
        toast.error('Execute o SQL ADD_PAYMENT_STATUS.sql no Supabase primeiro!');
      }
    }
  };

  const updateReservation = async (
    reservationId: string,
    guestName: string,
    numGuests: number,
    checkIn: string,
    checkOut: string,
    roomId: string,
    oldRoomId: string
  ) => {
    try {
      console.log(`✏️ Editando reserva ${reservationId}...`);

      // 1. Buscar o guest_id da reserva
      const { data: reservation, error: fetchError } = await supabase
        .from('reservations')
        .select('guest_id')
        .eq('id', reservationId)
        .single();

      if (fetchError) throw fetchError;

      // 2. Atualizar o nome do hóspede
      const { error: guestError } = await supabase
        .from('guests')
        .update({ name: guestName })
        .eq('id', reservation.guest_id);

      if (guestError) throw guestError;

      // 3. Buscar informações do quarto para calcular novo preço
      const { data: room, error: roomError } = await supabase
        .from('rooms')
        .select('price')
        .eq('id', roomId)
        .single();

      if (roomError) throw roomError;

      // 4. Calcular novo total
      const nights = Math.ceil(
        (new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24)
      );
      const totalPrice = room.price * nights * numGuests;

      // 5. Atualizar a reserva
      const { error: updateError } = await supabase
        .from('reservations')
        .update({
          room_id: roomId,
          num_guests: numGuests,
          check_in: checkIn,
          check_out: checkOut,
          total_price: totalPrice,
        })
        .eq('id', reservationId);

      if (updateError) throw updateError;

      // 6. Se mudou de quarto, atualizar disponibilidade dos quartos
      if (roomId !== oldRoomId) {
        // Liberar quarto antigo
        const { error: oldRoomError } = await supabase
          .from('rooms')
          .update({ status: 'available' })
          .eq('id', oldRoomId);

        if (oldRoomError) throw oldRoomError;

        // Ocupar novo quarto
        const { error: newRoomError } = await supabase
          .from('rooms')
          .update({ status: 'occupied' })
          .eq('id', roomId);

        if (newRoomError) throw newRoomError;
      }

      toast.success('Reserva atualizada com sucesso!');
      fetchReservations();
      return true;
    } catch (error: any) {
      console.error('❌ Erro ao atualizar reserva:', error);
      toast.error('Erro ao atualizar reserva: ' + (error.message || 'Erro desconhecido'));
      return false;
    }
  };

  return {
    reservations,
    loading,
    createReservation,
    cancelReservation,
    completeReservation,
    togglePaymentStatus,
    updateReservation,
    refetch: fetchReservations,
  };
}
