import { useState } from 'react';
import { useRooms } from '@/hooks/useRooms';
import { useReservations } from '@/hooks/useReservations';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DoorOpen, Wifi, Tv, Wind, Info } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { parseDateSafe, getTodayDateString } from '@/lib/dateUtils';

export default function Rooms() {
  const { rooms, loading, refetch } = useRooms();
  const { createReservation } = useReservations();
  const [selectedRoom, setSelectedRoom] = useState<any>(null);
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [guestCpf, setGuestCpf] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [numGuests, setNumGuests] = useState(1);

  const [reservationDetails, setReservationDetails] = useState<any>(null);
  const [expense, setExpense] = useState('');
  const [expenseDescription, setExpenseDescription] = useState('');
  const [discount, setDiscount] = useState('');

  // 🔍 Estado da pesquisa
  const [searchTerm, setSearchTerm] = useState('');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-500';
      case 'occupied': return 'bg-red-500';
      case 'maintenance': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'available': return 'Disponível';
      case 'occupied': return 'Ocupado';
      case 'maintenance': return 'Manutenção';
      default: return status;
    }
  };

  const getAmenityIcon = (amenity: string) => {
    switch (amenity.toLowerCase()) {
      case 'wifi': return <Wifi className="h-4 w-4" />;
      case 'tv': return <Tv className="h-4 w-4" />;
      case 'ar-condicionado': return <Wind className="h-4 w-4" />;
      default: return null;
    }
  };

  const handleReservation = async () => {
    console.log('🔍 DEBUG: Iniciando reserva...', {
      selectedRoom,
      guestName,
      guestEmail,
      checkIn,
      checkOut,
      numGuests
    });

    if (!selectedRoom || !guestName || !checkIn || !checkOut) {
      toast.error('Preencha todos os campos obrigatórios (Nome, Check-in e Check-out)');
      console.error('❌ Campos obrigatórios faltando');
      return;
    }

    // Corrigir problema de fuso horário no cálculo de dias
    const [checkInYear, checkInMonth, checkInDay] = checkIn.split('-').map(Number);
    const [checkOutYear, checkOutMonth, checkOutDay] = checkOut.split('-').map(Number);
    const checkInDate = new Date(checkInYear, checkInMonth - 1, checkInDay);
    const checkOutDate = new Date(checkOutYear, checkOutMonth - 1, checkOutDay);
    const days = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
    const totalPrice = days * selectedRoom.price * numGuests;

    console.log('💰 Cálculo de preço:', { days, pricePerNight: selectedRoom.price, numGuests, totalPrice });

    try {
      console.log('📤 Enviando reserva para createReservation...');
      await createReservation(
        selectedRoom.id,
        {
          name: guestName,
          email: guestEmail || '',  // Email opcional
          phone: guestPhone || null,
          cpf: guestCpf || null
        },
        checkIn,
        checkOut,
        numGuests,
        totalPrice
      );

      console.log('✅ Reserva criada com sucesso!');

      // ⚡ FORÇAR atualização imediata da lista de quartos
      console.log('🔄 Atualizando lista de quartos...');
      await refetch();

      // Reset form
      setSelectedRoom(null);
      setGuestName('');
      setGuestEmail('');
      setGuestPhone('');
      setGuestCpf('');
      setCheckIn('');
      setCheckOut('');
      setNumGuests(1);
    } catch (error) {
      console.error('❌ ERRO ao criar reserva:', error);
      // Error handled in hook
    }
  };

  const loadReservationDetails = async (roomId: string) => {
    try {
      console.log('🔍 Carregando detalhes da reserva para room_id:', roomId);

      const { data, error } = await supabase
        .from('reservations')
        .select(`
          *,
          guest:guests(*)
        `)
        .eq('room_id', roomId)
        .eq('status', 'active')
        .maybeSingle();

      console.log('📥 Resultado da query:', { data, error });

      if (error) {
        console.error('❌ Erro na query:', error);
        throw error;
      }

      if (!data) {
        console.warn('⚠️ Nenhuma reserva ativa encontrada para este quarto');
        toast.error('Nenhuma reserva ativa encontrada para este quarto');
        return;
      }

      // Buscar despesas
      const { data: expenses } = await supabase
        .from('expenses')
        .select('*')
        .eq('reservation_id', data.id)
        .order('created_at', { ascending: false });

      console.log('✅ Detalhes carregados:', data);
      setReservationDetails({ ...data, expenses: expenses || [] });
    } catch (error: any) {
      console.error('❌ ERRO ao carregar detalhes da reserva:', error);
      console.error('❌ Error message:', error.message);
      toast.error('Erro ao carregar detalhes da reserva: ' + (error.message || 'Erro desconhecido'));
    }
  };

  const handleAddExpense = async () => {
    if (!expense || !expenseDescription || !reservationDetails) {
      toast.error('Preencha a descrição e o valor da despesa');
      return;
    }

    try {
      const expenseValue = parseFloat(expense);

      console.log('💰 Adicionando despesa:', {
        description: expenseDescription,
        current_total: reservationDetails.total_price,
        expense_value: expenseValue,
        new_total: reservationDetails.total_price + expenseValue
      });

      // 1. Adicionar a despesa na tabela expenses
      const { error: expenseError } = await supabase
        .from('expenses')
        .insert({
          guest_id: reservationDetails.guest_id,
          reservation_id: reservationDetails.id,
          description: expenseDescription,
          value: expenseValue
        });

      if (expenseError) {
        console.error('❌ Erro ao inserir despesa:', expenseError);
        throw expenseError;
      }
      console.log('✅ Despesa inserida na tabela expenses');

      // 2. Atualizar o total_price da reserva (SOMAR a despesa)
      const newTotal = reservationDetails.total_price + expenseValue;

      const { error: updateError } = await supabase
        .from('reservations')
        .update({ total_price: newTotal })
        .eq('id', reservationDetails.id);

      if (updateError) {
        console.error('❌ Erro ao atualizar total da reserva:', updateError);
        throw updateError;
      }
      console.log('✅ Total da reserva atualizado:', newTotal);

      toast.success(`Despesa "${expenseDescription}" de R$ ${expenseValue.toFixed(2)} adicionada!`);
      setExpense('');
      setExpenseDescription('');

      // Recarregar detalhes para atualizar lista de despesas
      await loadReservationDetails(reservationDetails.room_id);
    } catch (error: any) {
      console.error('❌ ERRO ao adicionar despesa:', error);
      toast.error('Erro ao adicionar despesa: ' + (error.message || 'Erro desconhecido'));
    }
  };

  const handleAddDiscount = async () => {
    if (!discount || !reservationDetails) return;

    try {
      const discountValue = parseFloat(discount);
      const newTotal = reservationDetails.total_price - discountValue;

      const { error } = await supabase
        .from('reservations')
        .update({ total_price: newTotal })
        .eq('id', reservationDetails.id);

      if (error) throw error;
      toast.success('Desconto aplicado com sucesso!');
      setDiscount('');
      setReservationDetails({ ...reservationDetails, total_price: newTotal });
    } catch (error) {
      console.error('Error applying discount:', error);
      toast.error('Erro ao aplicar desconto');
    }
  };

  // 🔍 Filtrar quartos pela pesquisa
  const filteredRooms = rooms.filter((room) => {
    if (!searchTerm) return true; // Mostra todos se não tiver busca

    const searchLower = searchTerm.toLowerCase();

    // Buscar pelo número do quarto
    const matchesRoomNumber = room.number?.toLowerCase().includes(searchLower);

    // Buscar pelo tipo do quarto
    const matchesRoomType = room.type?.toLowerCase().includes(searchLower);

    return matchesRoomNumber || matchesRoomType;
  });

  if (loading) {
    return <div className="flex justify-center p-8">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Quartos</h1>
        <p className="text-muted-foreground">Gerencie e reserve quartos do hotel</p>
      </div>

      {/* 🔍 Barra de Pesquisa */}
      <div className="flex flex-col sm:flex-row gap-2">
        <Input
          placeholder="🔍 Buscar por número ou tipo (Ex: 201, Casal, Triplo...)"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 max-w-2xl"
        />
        {searchTerm && (
          <Button
            variant="outline"
            onClick={() => setSearchTerm('')}
          >
            Limpar
          </Button>
        )}
      </div>

      {/* Contador de resultados */}
      {searchTerm && (
        <p className="text-sm text-muted-foreground">
          {filteredRooms.length} {filteredRooms.length === 1 ? 'quarto encontrado' : 'quartos encontrados'}
        </p>
      )}

      {/* Mensagem quando não encontrar nada */}
      {filteredRooms.length === 0 && searchTerm && (
        <Card className="p-8">
          <div className="text-center">
            <p className="text-muted-foreground">
              Nenhum quarto encontrado para "{searchTerm}"
            </p>
            <Button
              variant="link"
              onClick={() => setSearchTerm('')}
              className="mt-2"
            >
              Limpar pesquisa
            </Button>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredRooms.map((room) => (
          <Card key={room.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DoorOpen className="h-5 w-5 text-primary" />
                  <CardTitle>Quarto {room.number}</CardTitle>
                </div>
                <Badge className={getStatusColor(room.status)}>
                  {getStatusText(room.status)}
                </Badge>
              </div>
              <CardDescription>{room.type}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-4 text-sm">
                <span>{room.capacity} pessoa(s)</span>
                <span>{room.beds} cama(s)</span>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {room.amenities.map((amenity, index) => (
                  <div key={index} className="flex items-center gap-1 text-xs bg-muted px-2 py-1 rounded">
                    {getAmenityIcon(amenity)}
                    <span>{amenity}</span>
                  </div>
                ))}
              </div>

              <div className="text-2xl font-bold text-primary">
                R$ {room.price.toFixed(2)}
                <span className="text-sm font-normal text-muted-foreground">/noite</span>
              </div>

              {room.status === 'available' && (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="w-full" onClick={() => setSelectedRoom(room)}>
                      Reservar
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Reservar Quarto {room.number}</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-6 py-4">
                      {/* ✅ Responsivo: 1 coluna no mobile, 2 no desktop */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="name">Nome do Hóspede *</Label>
                          <Input
                            id="name"
                            value={guestName}
                            onChange={(e) => setGuestName(e.target.value)}
                            placeholder="Nome completo"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email (opcional)</Label>
                          <Input
                            id="email"
                            type="email"
                            value={guestEmail}
                            onChange={(e) => setGuestEmail(e.target.value)}
                            placeholder="email@exemplo.com"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="phone">Telefone (opcional)</Label>
                          <Input
                            id="phone"
                            value={guestPhone}
                            onChange={(e) => setGuestPhone(e.target.value)}
                            placeholder="(00) 00000-0000"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="cpf">CPF (opcional)</Label>
                          <Input
                            id="cpf"
                            value={guestCpf}
                            onChange={(e) => setGuestCpf(e.target.value)}
                            placeholder="000.000.000-00"
                          />
                        </div>
                      </div>

                      {/* ✅ Responsivo: 1 coluna no mobile, 3 no desktop */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="checkin">Check-in *</Label>
                          <Input
                            id="checkin"
                            type="date"
                            value={checkIn}
                            onChange={(e) => setCheckIn(e.target.value)}
                            min={getTodayDateString()}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="checkout">Check-out *</Label>
                          <Input
                            id="checkout"
                            type="date"
                            value={checkOut}
                            onChange={(e) => setCheckOut(e.target.value)}
                            min={checkIn || getTodayDateString()}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="guests">Hóspedes *</Label>
                          <Input
                            id="guests"
                            type="number"
                            min={1}
                            max={room.capacity}
                            value={numGuests}
                            onChange={(e) => setNumGuests(parseInt(e.target.value))}
                          />
                        </div>
                      </div>

                      {checkIn && checkOut && (
                        <div className="p-4 bg-muted rounded-lg">
                          <div className="flex justify-between items-center">
                            <span>Total:</span>
                            <span className="text-2xl font-bold text-primary">
                              R$ {(() => {
                                // Corrigir problema de fuso horário
                                const [checkInYear, checkInMonth, checkInDay] = checkIn.split('-').map(Number);
                                const [checkOutYear, checkOutMonth, checkOutDay] = checkOut.split('-').map(Number);
                                const checkInDate = new Date(checkInYear, checkInMonth - 1, checkInDay);
                                const checkOutDate = new Date(checkOutYear, checkOutMonth - 1, checkOutDay);
                                const days = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
                                return (days * room.price).toFixed(2);
                              })()}
                            </span>
                          </div>
                        </div>
                      )}

                      <Button onClick={handleReservation} className="w-full">
                        Confirmar Reserva
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              )}

              {room.status === 'occupied' && (
                <div className="space-y-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        className="w-full"
                        variant="secondary"
                        onClick={() => loadReservationDetails(room.id)}
                      >
                        <Info className="h-4 w-4 mr-2" />
                        Detalhes
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Detalhes da Reserva - Quarto {room.number}</DialogTitle>
                      </DialogHeader>
                      {reservationDetails && (
                        <div className="space-y-6 py-4">
                          <div className="space-y-2">
                            <h3 className="font-semibold">Hóspede</h3>
                            <div className="p-4 bg-muted rounded-lg space-y-1">
                              <p><strong>Nome:</strong> {reservationDetails.guest?.name}</p>
                              {reservationDetails.guest?.email && (
                                <p><strong>Email:</strong> {reservationDetails.guest?.email}</p>
                              )}
                              {reservationDetails.guest?.phone && (
                                <p><strong>Telefone:</strong> {reservationDetails.guest?.phone}</p>
                              )}
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm text-muted-foreground">Check-in</p>
                              <p className="font-semibold">
                                {format(parseDateSafe(reservationDetails.check_in), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Check-out</p>
                              <p className="font-semibold">
                                {format(parseDateSafe(reservationDetails.check_out), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                              </p>
                            </div>
                          </div>

                          <div className="p-4 bg-muted rounded-lg">
                            <p className="text-sm text-muted-foreground">Total Atual</p>
                            <p className="text-2xl font-bold text-primary">
                              R$ {reservationDetails.total_price.toFixed(2)}
                            </p>

                            {reservationDetails.expenses && reservationDetails.expenses.length > 0 && (
                              <div className="mt-4 pt-4 border-t border-border">
                                <p className="text-sm font-semibold mb-2">Consumos:</p>
                                {reservationDetails.expenses.map((exp: any) => (
                                  <div key={exp.id} className="flex justify-between text-sm mb-1">
                                    <span>{exp.description}</span>
                                    <span>R$ {exp.value.toFixed(2)}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="expense">Adicionar Despesa</Label>
                              <div className="space-y-2">
                                <Input
                                  id="expense-description"
                                  value={expenseDescription}
                                  onChange={(e) => setExpenseDescription(e.target.value)}
                                  placeholder="Ex: Frigobar, Restaurante, Lavanderia..."
                                />
                                <div className="flex gap-2">
                                  <Input
                                    id="expense"
                                    type="number"
                                    step="0.01"
                                    value={expense}
                                    onChange={(e) => setExpense(e.target.value)}
                                    placeholder="Valor (R$)"
                                  />
                                  <Button onClick={handleAddExpense} size="sm">
                                    Adicionar
                                  </Button>
                                </div>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="discount">Aplicar Desconto</Label>
                              <div className="flex gap-2">
                                <Input
                                  id="discount"
                                  type="number"
                                  step="0.01"
                                  value={discount}
                                  onChange={(e) => setDiscount(e.target.value)}
                                  placeholder="Valor do desconto"
                                />
                                <Button onClick={handleAddDiscount} size="sm" variant="secondary">
                                  Aplicar
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
