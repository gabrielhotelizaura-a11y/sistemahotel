import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Room } from '@/types/hotel';
import { toast } from 'sonner';

export function useRooms() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRooms();

    // Subscribe to realtime changes
    const channel = supabase
      .channel('rooms-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'rooms'
        },
        () => {
          console.log('🔔 Quarto atualizado - recarregando lista...');
          fetchRooms();
        }
      )
      .subscribe();

    // ⏰ Auto-refresh a cada 10 segundos para garantir sincronia
    const intervalId = setInterval(() => {
      fetchRooms();
    }, 10 * 1000); // 10 segundos

    return () => {
      supabase.removeChannel(channel);
      clearInterval(intervalId);
    };
  }, []);

  const fetchRooms = async () => {
    try {
      const { data, error } = await supabase
        .from('rooms')
        .select('*');

      if (error) throw error;
      
      // Ordenar numericamente pelos números dos quartos
      const sortedData = (data || []).sort((a, b) => {
        const numA = parseInt(a.number) || 0;
        const numB = parseInt(b.number) || 0;
        return numA - numB;
      });
      
      setRooms(sortedData.map(room => ({
        ...room,
        amenities: (room.amenities as any) || [],
        status: room.status as any
      })));
    } catch (error) {
      console.error('Error fetching rooms:', error);
      toast.error('Erro ao carregar quartos');
    } finally {
      setLoading(false);
    }
  };

  const updateRoomPrice = async (roomId: string, newPrice: number) => {
    try {
      const { error } = await supabase
        .from('rooms')
        .update({ price: newPrice })
        .eq('id', roomId);

      if (error) throw error;
      toast.success('Preço atualizado com sucesso!');
    } catch (error) {
      console.error('Error updating room price:', error);
      toast.error('Erro ao atualizar preço');
    }
  };

  const updateRoomStatus = async (roomId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('rooms')
        .update({ status })
        .eq('id', roomId);

      if (error) throw error;
      toast.success('Status atualizado com sucesso!');
    } catch (error) {
      console.error('Error updating room status:', error);
      toast.error('Erro ao atualizar status');
    }
  };

  return {
    rooms,
    loading,
    updateRoomPrice,
    updateRoomStatus,
    refetch: fetchRooms,
  };
}
