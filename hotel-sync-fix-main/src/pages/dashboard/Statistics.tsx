import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TrendingUp, DollarSign, Calendar, Percent, Users, History, Search, FileDown } from 'lucide-react';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { parseDateSafe } from '@/lib/dateUtils';
import { toast } from 'sonner';
import { exportStatisticsPdf } from '@/lib/pdfExport';

export default function Statistics() {
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(0); // 0 = mês atual, 1 = mês passado, etc
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalReservations: 0,
    occupancyRate: 0,
    averageStay: 0,
    roomTypeStats: [] as { type: string; count: number; revenue: number }[],
  });
  const [completedReservations, setCompletedReservations] = useState<any[]>([]);

  useEffect(() => {
    fetchStatistics();
  }, [selectedMonth]);

  const fetchStatistics = async () => {
    try {
      setLoading(true);

      // Calcular o mês selecionado
      const targetDate = subMonths(new Date(), selectedMonth);
      const monthStart = format(startOfMonth(targetDate), 'yyyy-MM-dd');
      const monthEnd = format(endOfMonth(targetDate), 'yyyy-MM-dd');

      console.log(`📊 Buscando estatísticas de ${monthStart} até ${monthEnd}`);

      // Buscar TODAS as reservas do mês (para estatísticas gerais)
      const { data: allReservations, error: allReservationsError } = await supabase
        .from('reservations')
        .select(`
          *,
          room:rooms(*)
        `)
        .gte('created_at', monthStart)
        .lte('created_at', monthEnd)
        .neq('status', 'cancelled'); // Excluir canceladas

      if (allReservationsError) throw allReservationsError;

      // Buscar apenas reservas COMPLETADAS para calcular receita
      const { data: completedForRevenue, error: completedRevenueError } = await supabase
        .from('reservations')
        .select(`
          total_price,
          room:rooms(type)
        `)
        .eq('status', 'completed')
        .gte('check_out', monthStart)
        .lte('check_out', monthEnd);

      if (completedRevenueError) throw completedRevenueError;

      // Calcular estatísticas
      // RECEITA: Apenas de reservas COMPLETADAS (check-out confirmado)
      const totalRevenue = completedForRevenue?.reduce((sum, r) => sum + Number(r.total_price), 0) || 0;
      // TOTAL DE RESERVAS: Todas exceto canceladas
      const totalReservations = allReservations?.length || 0;

      // Calcular dias médios de estadia (usando todas as reservas exceto canceladas)
      const totalDays = allReservations?.reduce((sum, r) => {
        const days = Math.ceil(
          (parseDateSafe(r.check_out).getTime() - parseDateSafe(r.check_in).getTime()) / (1000 * 60 * 60 * 24)
        );
        return sum + days;
      }, 0) || 0;
      const averageStay = totalReservations > 0 ? totalDays / totalReservations : 0;

      // Buscar total de quartos
      const { data: rooms, error: roomsError } = await supabase
        .from('rooms')
        .select('*');

      if (roomsError) throw roomsError;

      const totalRooms = rooms?.length || 0;
      const occupiedRooms = allReservations?.filter(r => r.status === 'active').length || 0;
      const occupancyRate = totalRooms > 0 ? (occupiedRooms / totalRooms) * 100 : 0;

      // Estatísticas por tipo de quarto (apenas reservas completadas para receita)
      const typeStats = completedForRevenue?.reduce((acc, r: any) => {
        const roomType = r.room?.type || 'Desconhecido';
        if (!acc[roomType]) {
          acc[roomType] = { type: roomType, count: 0, revenue: 0 };
        }
        acc[roomType].count++;
        acc[roomType].revenue += Number(r.total_price);
        return acc;
      }, {} as Record<string, { type: string; count: number; revenue: number }>);

      const roomTypeStats = Object.values(typeStats || {});

      // Buscar histórico de reservas concluídas DO MÊS SELECIONADO
      const { data: completed, error: completedError } = await supabase
        .from('reservations')
        .select(`
          *,
          room:rooms(*),
          guest:guests(*)
        `)
        .eq('status', 'completed')
        .gte('check_out', monthStart)
        .lte('check_out', monthEnd)
        .order('check_out', { ascending: false });

      if (completedError) throw completedError;

      setStats({
        totalRevenue,
        totalReservations,
        occupancyRate,
        averageStay,
        roomTypeStats,
      });
      setCompletedReservations(completed || []);
    } catch (error) {
      console.error('Error fetching statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8">Carregando estatísticas...</div>;
  }

  // Gerar lista de meses para o seletor (últimos 12 meses)
  const monthOptions = Array.from({ length: 12 }, (_, i) => {
    const date = subMonths(new Date(), i);
    return {
      value: i,
      label: format(date, "MMMM 'de' yyyy", { locale: ptBR }),
    };
  });

  const selectedMonthLabel = monthOptions.find(m => m.value === selectedMonth)?.label || '';

  // Filtrar reservas por nome do hóspede
  const filteredReservations = completedReservations.filter((reservation) => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return reservation.guest?.name?.toLowerCase().includes(searchLower);
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Estatísticas do Mês</h1>
          <p className="text-muted-foreground capitalize">{selectedMonthLabel}</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Select
            value={selectedMonth.toString()}
            onValueChange={(value) => setSelectedMonth(parseInt(value))}
          >
            <SelectTrigger className="w-full sm:w-[280px]">
              <SelectValue placeholder="Selecione o mês" />
            </SelectTrigger>
            <SelectContent>
              {monthOptions.map((option) => (
                <SelectItem key={option.value} value={option.value.toString()}>
                  <span className="capitalize">{option.label}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            onClick={() =>
              exportStatisticsPdf({
                monthLabel: selectedMonthLabel,
                totalRevenue: stats.totalRevenue,
                totalReservations: stats.totalReservations,
                occupancyRate: stats.occupancyRate,
                averageStay: stats.averageStay,
                completedReservations: filteredReservations.map((reservation) => ({
                  room: `${reservation.room?.number || '-'} - ${reservation.room?.type || '-'}`,
                  guest: reservation.guest?.name || '-',
                  checkIn: format(parseDateSafe(reservation.check_in), 'dd/MM/yyyy'),
                  checkOut: format(parseDateSafe(reservation.check_out), 'dd/MM/yyyy'),
                  total: Number(reservation.total_price),
                })),
              })
            }
            disabled={filteredReservations.length === 0 && stats.totalReservations === 0}
          >
            <FileDown className="h-4 w-4 mr-2" />
            Exportar PDF
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              R$ {stats.totalRevenue.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Total arrecadado no mês
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total de Reservas</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalReservations}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Reservas realizadas no mês
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Ocupação</CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.occupancyRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              Ocupação atual do hotel
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Estadia Média</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageStay.toFixed(1)} dias</div>
            <p className="text-xs text-muted-foreground mt-1">
              Duração média das reservas
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Estatísticas por Tipo de Quarto
          </CardTitle>
        </CardHeader>
        <CardContent>
          {stats.roomTypeStats.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Nenhuma reserva no mês atual
            </p>
          ) : (
            <div className="space-y-4">
              {stats.roomTypeStats.map((stat, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div>
                    <h3 className="font-semibold">{stat.type}</h3>
                    <p className="text-sm text-muted-foreground">
                      {stat.count} reserva{stat.count !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary">
                      R$ {stat.revenue.toFixed(2)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Receita gerada
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Histórico de Reservas Concluídas
          </CardTitle>
        </CardHeader>
        <CardContent>
          {completedReservations.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Nenhuma reserva concluída
            </p>
          ) : (
            <>
              {/* Campo de Pesquisa */}
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Buscar por nome do hóspede..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                {searchTerm && (
                  <p className="text-sm text-muted-foreground mt-2">
                    {filteredReservations.length} resultado{filteredReservations.length !== 1 ? 's' : ''} encontrado{filteredReservations.length !== 1 ? 's' : ''}
                  </p>
                )}
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Quarto</TableHead>
                      <TableHead>Hóspede</TableHead>
                      <TableHead>Check-in</TableHead>
                      <TableHead>Check-out</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredReservations.map((reservation) => (
                      <TableRow key={reservation.id}>
                        <TableCell className="font-medium">
                          {reservation.room?.number} - {reservation.room?.type}
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{reservation.guest?.name}</div>
                            <div className="text-sm text-muted-foreground">{reservation.guest?.email}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {format(parseDateSafe(reservation.check_in), 'dd/MM/yyyy')}
                        </TableCell>
                        <TableCell>
                          {format(parseDateSafe(reservation.check_out), 'dd/MM/yyyy')}
                        </TableCell>
                        <TableCell className="font-semibold text-primary">
                          R$ {Number(reservation.total_price).toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">Concluída</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={async () => {
                              if (confirm(`Tem certeza que deseja deletar permanentemente a reserva de ${reservation.guest?.name}?\n\nIsso vai remover:\n- A reserva\n- Todas as despesas relacionadas\n- Os dados do hóspede`)) {
                                try {
                                  console.log('🗑️ Iniciando deleção da reserva:', reservation.id);

                                  // 1. Deletar despesas relacionadas à reserva
                                  const { error: expensesError } = await supabase
                                    .from('expenses')
                                    .delete()
                                    .eq('reservation_id', reservation.id);

                                  if (expensesError) {
                                    console.error('Erro ao deletar despesas:', expensesError);
                                    throw expensesError;
                                  }
                                  console.log('✅ Despesas deletadas');

                                  // 2. Deletar a reserva
                                  const { error: reservationError } = await supabase
                                    .from('reservations')
                                    .delete()
                                    .eq('id', reservation.id);

                                  if (reservationError) {
                                    console.error('Erro ao deletar reserva:', reservationError);
                                    throw reservationError;
                                  }
                                  console.log('✅ Reserva deletada');

                                  // 3. Deletar o guest (opcional - pode ter outras reservas)
                                  const { error: guestError } = await supabase
                                    .from('guests')
                                    .delete()
                                    .eq('id', reservation.guest_id);

                                  if (guestError) {
                                    console.warn('⚠️ Não foi possível deletar o guest (pode ter outras reservas):', guestError);
                                    // Não lançar erro aqui, pois o guest pode estar sendo usado em outras reservas
                                  }

                                  toast.success('Reserva e dados relacionados deletados com sucesso!');
                                  fetchStatistics();
                                } catch (error) {
                                  console.error('❌ Erro ao deletar reserva:', error);
                                  toast.error('Erro ao deletar reserva');
                                }
                              }
                            }}
                          >
                            Deletar
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
