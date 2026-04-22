import { useReservations } from '@/hooks/useReservations';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Calendar, User, DoorOpen, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { parseDateSafe } from '@/lib/dateUtils';

type ReservationItem = any;

function groupReservationsByDay(items: ReservationItem[]) {
  const groups = items.reduce((acc, reservation) => {
    const key = format(parseDateSafe(reservation.check_in), 'yyyy-MM-dd');
    if (!acc[key]) acc[key] = [];
    acc[key].push(reservation);
    return acc;
  }, {} as Record<string, ReservationItem[]>);

  return (Object.entries(groups) as [string, ReservationItem[]][])
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([dateKey, reservations]) => ({
      dateKey,
      dateLabel: format(parseDateSafe(dateKey), "dd 'de' MMMM 'de' yyyy", { locale: ptBR }),
      reservations,
    }));
}

export default function FutureReservations() {
  const { reservations, loading, cancelReservation, togglePaymentStatus, toggleHalfPaymentStatus } = useReservations();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const futureReservations = reservations.filter((reservation) => {
    if (reservation.status === 'future') return true;
    if (reservation.status !== 'active') return false;

    const checkOutDate = parseDateSafe(reservation.check_out);
    checkOutDate.setHours(0, 0, 0, 0);

    return checkOutDate > today;
  });
  const groupedFutureReservations = groupReservationsByDay(futureReservations);

  if (loading) {
    return <div className="flex justify-center p-8">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Reservas Futuras</h1>
        <p className="text-muted-foreground">Visualize e gerencie as próximas reservas e as ativas com período futuro</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {futureReservations.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg text-muted-foreground">Nenhuma reserva futura agendada</p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Próximas Reservas ({futureReservations.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {groupedFutureReservations.map((group) => (
                <div key={group.dateKey} className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <h3 className="font-semibold capitalize">{group.dateLabel}</h3>
                    <Badge variant="secondary">{group.reservations.length}</Badge>
                  </div>

                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Quarto</TableHead>
                        <TableHead>Hóspede</TableHead>
                        <TableHead>Check-in</TableHead>
                        <TableHead>Check-out</TableHead>
                        <TableHead>Pessoas</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {group.reservations.map((reservation) => (
                        <TableRow key={reservation.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <DoorOpen className="h-4 w-4" />
                              {reservation.room?.number}
                              <Badge variant="outline">{reservation.room?.type}</Badge>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4" />
                              <div>
                                <div className="font-medium">{reservation.guest?.name}</div>
                                <div className="text-sm text-muted-foreground">{reservation.guest?.email}</div>
                                {reservation.guest?.phone && (
                                  <div className="text-sm text-muted-foreground">{reservation.guest?.phone}</div>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {format(parseDateSafe(reservation.check_in), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                          </TableCell>
                          <TableCell>
                            {format(parseDateSafe(reservation.check_out), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                          </TableCell>
                          <TableCell>{reservation.num_guests}</TableCell>
                          <TableCell className="font-semibold text-primary">
                            R$ {reservation.total_price.toFixed(2)}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex flex-wrap justify-end gap-2">
                              <Button
                                size="sm"
                                variant={reservation.paid ? 'default' : 'outline'}
                                onClick={() => togglePaymentStatus(reservation.id, reservation.paid)}
                                className={reservation.paid ? 'bg-green-600 hover:bg-green-700' : ''}
                              >
                                {reservation.paid ? '✓ Pago' : 'Marcar como Pago'}
                              </Button>
                              <Button
                                size="sm"
                                variant={reservation.paid_half ? 'default' : 'outline'}
                                onClick={() => toggleHalfPaymentStatus(reservation.id, reservation.paid_half || false)}
                                className={reservation.paid_half ? 'bg-amber-500 hover:bg-amber-600 text-black' : ''}
                              >
                                {reservation.paid_half ? '✓ Metade paga' : 'Metade do pagamento'}
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => cancelReservation(reservation.id, reservation.room_id)}
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Cancelar
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
