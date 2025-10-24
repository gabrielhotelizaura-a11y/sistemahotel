import { useReservations } from '@/hooks/useReservations';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Calendar, User, DoorOpen, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { parseDateSafe } from '@/lib/dateUtils';

export default function FutureReservations() {
  const { reservations, loading, cancelReservation } = useReservations();

  const futureReservations = reservations.filter(r => r.status === 'future');

  if (loading) {
    return <div className="flex justify-center p-8">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Reservas Futuras</h1>
        <p className="text-muted-foreground">Visualize e gerencie as próximas reservas</p>
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
                Próximas Reservas
              </CardTitle>
            </CardHeader>
            <CardContent>
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
                  {futureReservations.map((reservation) => (
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
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => cancelReservation(reservation.id, reservation.room_id)}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Cancelar
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
