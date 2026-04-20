import { useState } from 'react';
import { useReservations } from '@/hooks/useReservations';
import { useRooms } from '@/hooks/useRooms';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Calendar, User, DoorOpen, CheckCircle, XCircle, Edit, Clock4 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { parseDateSafe } from '@/lib/dateUtils';

export default function Reservations() {
  const { reservations, loading, completeReservation, cancelReservation, togglePaymentStatus, updateReservation } = useReservations();
  const { rooms } = useRooms();

  const [editingReservation, setEditingReservation] = useState<any>(null);
  const [editName, setEditName] = useState('');
  const [editNumGuests, setEditNumGuests] = useState('');
  const [editCheckIn, setEditCheckIn] = useState('');
  const [editCheckOut, setEditCheckOut] = useState('');
  const [editRoomId, setEditRoomId] = useState('');
  const [isEditOpen, setIsEditOpen] = useState(false);

  const handleOpenEdit = (reservation: any) => {
    setEditingReservation(reservation);
    setEditName(reservation.guest?.name || '');
    setEditNumGuests(reservation.num_guests.toString());
    setEditCheckIn(format(parseDateSafe(reservation.check_in), 'yyyy-MM-dd'));
    setEditCheckOut(format(parseDateSafe(reservation.check_out), 'yyyy-MM-dd'));
    setEditRoomId(reservation.room_id);
    setIsEditOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingReservation || !editName.trim() || !editNumGuests || !editCheckIn || !editCheckOut || !editRoomId) {
      return;
    }

    const success = await updateReservation(
      editingReservation.id,
      editName.trim(),
      parseInt(editNumGuests),
      editCheckIn,
      editCheckOut,
      editRoomId,
      editingReservation.room_id
    );

    if (success) {
      setIsEditOpen(false);
      setEditingReservation(null);
    }
  };

  const activeReservations = reservations.filter((r) => r.status === 'active');
  const futureReservations = reservations.filter((r) => r.status === 'future');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'future': return 'bg-blue-500';
      case 'completed': return 'bg-gray-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Ativa';
      case 'future': return 'Futura';
      case 'completed': return 'Concluída';
      case 'cancelled': return 'Cancelada';
      default: return status;
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8">Carregando...</div>;
  }

  const EmptyState = ({ text }: { text: string }) => (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-12">
        <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-lg text-muted-foreground text-center">{text}</p>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Reservas</h1>
        <p className="text-muted-foreground">Ativas e futuras, separadas para facilitar a operação</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Reservas Ativas ({activeReservations.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {activeReservations.length === 0 ? (
            <EmptyState text="Nenhuma reserva ativa no momento" />
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              {activeReservations.map((reservation) => (
                <Card key={reservation.id} className="border-muted">
                  <CardContent className="p-4 space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <DoorOpen className="h-4 w-4" />
                          <p className="font-semibold">Quarto {reservation.room?.number}</p>
                          <Badge variant="outline">{reservation.room?.type}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {reservation.num_guests} hóspede(s)
                        </p>
                      </div>
                      <Badge className={getStatusColor(reservation.status)}>{getStatusText(reservation.status)}</Badge>
                    </div>

                    <div className="space-y-1 text-sm">
                      <p className="font-medium flex items-center gap-2"><User className="h-4 w-4" />{reservation.guest?.name}</p>
                      <p className="text-muted-foreground break-all">{reservation.guest?.email}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-muted-foreground">Check-in</p>
                        <p className="font-medium">{format(parseDateSafe(reservation.check_in), 'dd/MM/yyyy', { locale: ptBR })}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Check-out</p>
                        <p className="font-medium">{format(parseDateSafe(reservation.check_out), 'dd/MM/yyyy', { locale: ptBR })}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <p className="text-lg font-bold text-primary">R$ {reservation.total_price.toFixed(2)}</p>
                      <Button
                        size="sm"
                        variant={reservation.paid ? 'default' : 'outline'}
                        onClick={() => togglePaymentStatus(reservation.id, reservation.paid)}
                        className={reservation.paid ? 'bg-green-600 hover:bg-green-700' : ''}
                      >
                        {reservation.paid ? '✓ Pago' : 'Marcar como Pago'}
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <Button size="sm" variant="secondary" onClick={() => handleOpenEdit(reservation)}>
                        <Edit className="h-4 w-4 mr-1" />
                        Editar
                      </Button>
                      <Button size="sm" onClick={() => completeReservation(reservation.id, reservation.room_id)}>
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Check-out
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => cancelReservation(reservation.id, reservation.room_id)}>
                        <XCircle className="h-4 w-4 mr-1" />
                        Cancelar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock4 className="h-5 w-5" />
            Reservas Futuras ({futureReservations.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {futureReservations.length === 0 ? (
            <EmptyState text="Nenhuma reserva futura agendada" />
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              {futureReservations.map((reservation) => (
                <Card key={reservation.id} className="border-muted">
                  <CardContent className="p-4 space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <DoorOpen className="h-4 w-4" />
                          <p className="font-semibold">Quarto {reservation.room?.number}</p>
                          <Badge variant="outline">{reservation.room?.type}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {reservation.num_guests} hóspede(s)
                        </p>
                      </div>
                      <Badge className={getStatusColor(reservation.status)}>{getStatusText(reservation.status)}</Badge>
                    </div>

                    <div className="space-y-1 text-sm">
                      <p className="font-medium flex items-center gap-2"><User className="h-4 w-4" />{reservation.guest?.name}</p>
                      <p className="text-muted-foreground break-all">{reservation.guest?.email}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-muted-foreground">Check-in</p>
                        <p className="font-medium">{format(parseDateSafe(reservation.check_in), 'dd/MM/yyyy', { locale: ptBR })}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Check-out</p>
                        <p className="font-medium">{format(parseDateSafe(reservation.check_out), 'dd/MM/yyyy', { locale: ptBR })}</p>
                      </div>
                    </div>

                    <p className="text-lg font-bold text-primary">R$ {reservation.total_price.toFixed(2)}</p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <Button size="sm" variant="secondary" onClick={() => handleOpenEdit(reservation)}>
                        <Edit className="h-4 w-4 mr-1" />
                        Editar
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => cancelReservation(reservation.id, reservation.room_id)}>
                        <XCircle className="h-4 w-4 mr-1" />
                        Cancelar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog de Edição */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Editar Reserva</DialogTitle>
            <DialogDescription>
              Altere os dados da reserva. O valor será recalculado automaticamente.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Nome do Hóspede</Label>
              <Input
                id="edit-name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Nome completo"
              />
            </div>
            <div>
              <Label htmlFor="edit-room">Quarto</Label>
              <Select value={editRoomId} onValueChange={setEditRoomId}>
                <SelectTrigger id="edit-room">
                  <SelectValue placeholder="Selecione o quarto" />
                </SelectTrigger>
                <SelectContent>
                  {rooms
                    .filter(r => r.status === 'available' || r.id === editingReservation?.room_id)
                    .map((room) => (
                      <SelectItem key={room.id} value={room.id}>
                        Quarto {room.number} - {room.type} (R$ {room.price}/noite)
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit-guests">Número de Pessoas</Label>
              <Input
                id="edit-guests"
                type="number"
                min="1"
                value={editNumGuests}
                onChange={(e) => setEditNumGuests(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-checkin">Check-in</Label>
                <Input
                  id="edit-checkin"
                  type="date"
                  value={editCheckIn}
                  onChange={(e) => setEditCheckIn(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="edit-checkout">Check-out</Label>
                <Input
                  id="edit-checkout"
                  type="date"
                  value={editCheckOut}
                  onChange={(e) => setEditCheckOut(e.target.value)}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveEdit}>Salvar Alterações</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
