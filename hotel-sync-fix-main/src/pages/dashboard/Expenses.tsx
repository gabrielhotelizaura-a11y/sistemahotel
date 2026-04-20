import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Trash2, DollarSign, Plus, FileDown } from 'lucide-react';
import { useExpenses } from '@/hooks/useExpenses';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { exportExpensesPdf } from '@/lib/pdfExport';

export default function Expenses() {
    const { expenses, loading, createExpense, deleteExpense } = useExpenses();
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [description, setDescription] = useState('');
    const [value, setValue] = useState('');
    const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));

    const monthSummaries = useMemo(() => {
        const map = new Map<string, { key: string; label: string; total: number; count: number }>();

        expenses.forEach((expense) => {
            const date = new Date(expense.created_at);
            const key = format(date, 'yyyy-MM');
            const label = format(date, "MMMM 'de' yyyy", { locale: ptBR });

            const current = map.get(key) || { key, label, total: 0, count: 0 };
            current.total += expense.value;
            current.count += 1;
            map.set(key, current);
        });

        return Array.from(map.values()).sort((a, b) => b.key.localeCompare(a.key));
    }, [expenses]);

    useEffect(() => {
        if (monthSummaries.length > 0 && !monthSummaries.some((m) => m.key === selectedMonth)) {
            setSelectedMonth(monthSummaries[0].key);
        }
    }, [monthSummaries, selectedMonth]);

    const filteredExpenses = useMemo(() => {
        return expenses.filter((expense) => format(new Date(expense.created_at), 'yyyy-MM') === selectedMonth);
    }, [expenses, selectedMonth]);

    const handleAddExpense = async () => {
        if (!description.trim() || !value) {
            return;
        }

        const numValue = parseFloat(value);
        if (isNaN(numValue) || numValue <= 0) {
            return;
        }

        const success = await createExpense(description.trim(), numValue);
        if (success) {
            setDescription('');
            setValue('');
            setIsAddOpen(false);
        }
    };

    const totalExpenses = filteredExpenses.reduce((sum, exp) => sum + exp.value, 0);
    const selectedMonthLabel = monthSummaries.find((m) => m.key === selectedMonth)?.label || '-';

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold">Despesas por Mês</h1>
                </div>
                <Card>
                    <CardContent className="p-6">
                        <p className="text-muted-foreground">Carregando despesas...</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-4 md:space-y-6">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold">Despesas por Mês</h1>
                    <p className="text-muted-foreground capitalize">{selectedMonthLabel}</p>
                </div>
                <div className="flex flex-col sm:flex-row w-full lg:w-auto gap-2">
                    <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                        <SelectTrigger className="w-full sm:w-[240px]">
                            <SelectValue placeholder="Selecione o mês" />
                        </SelectTrigger>
                        <SelectContent>
                            {monthSummaries.map((month) => (
                                <SelectItem key={month.key} value={month.key}>
                                    <span className="capitalize">{month.label}</span>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Button
                        variant="outline"
                        onClick={() =>
                            exportExpensesPdf(
                                selectedMonthLabel,
                                totalExpenses,
                                filteredExpenses.map((expense) => ({
                                    date: format(new Date(expense.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR }),
                                    description: expense.description,
                                    value: expense.value,
                                }))
                            )
                        }
                        disabled={filteredExpenses.length === 0}
                        className="w-full sm:w-auto"
                    >
                        <FileDown className="h-4 w-4 mr-2" />
                        Exportar PDF
                    </Button>
                    <Badge variant="outline" className="text-base md:text-lg px-3 md:px-4 py-1.5 md:py-2 justify-center">
                        <DollarSign className="h-4 w-4 mr-1" />
                        Total: R$ {totalExpenses.toFixed(2)}
                    </Badge>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Resumo mensal</CardTitle>
                </CardHeader>
                <CardContent>
                    {monthSummaries.length === 0 ? (
                        <p className="text-muted-foreground">Nenhuma despesa cadastrada.</p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                            {monthSummaries.map((month) => (
                                <div key={month.key} className="rounded-md border p-3">
                                    <p className="text-sm text-muted-foreground capitalize">{month.label}</p>
                                    <p className="text-lg font-semibold">R$ {month.total.toFixed(2)}</p>
                                    <p className="text-xs text-muted-foreground">{month.count} despesa(s)</p>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0">
                    <CardTitle className="flex-1">Despesas Operacionais</CardTitle>
                    <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                        <DialogTrigger asChild>
                            <Button className="w-full sm:w-auto">
                                <Plus className="h-4 w-4 mr-2" />
                                Adicionar Despesa
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px] w-[95vw] max-w-[95vw] sm:w-full">
                            <DialogHeader>
                                <DialogTitle>Nova Despesa</DialogTitle>
                                <DialogDescription>
                                    Adicione uma despesa operacional (salários, contas, etc)
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="description">Descrição</Label>
                                    <Input
                                        id="description"
                                        placeholder="Ex: Salário funcionário..."
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="value">Valor (R$)</Label>
                                    <Input
                                        id="value"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        placeholder="0.00"
                                        value={value}
                                        onChange={(e) => setValue(e.target.value)}
                                    />
                                </div>
                            </div>
                            <DialogFooter className="flex-col sm:flex-row gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() => setIsAddOpen(false)}
                                    className="w-full sm:w-auto"
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    onClick={handleAddExpense}
                                    className="w-full sm:w-auto"
                                >
                                    Adicionar
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </CardHeader>
                <CardContent>
                    {filteredExpenses.length === 0 ? (
                        <p className="text-muted-foreground text-center py-8">
                            Nenhuma despesa registrada para o mês selecionado
                        </p>
                    ) : (
                        <>
                            {/* Visualização Desktop - Tabela */}
                            <div className="hidden md:block overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Data</TableHead>
                                            <TableHead>Descrição</TableHead>
                                            <TableHead className="text-right">Valor</TableHead>
                                            <TableHead className="text-right">Ações</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredExpenses.map((expense) => (
                                            <TableRow key={expense.id}>
                                                <TableCell className="whitespace-nowrap">
                                                    {format(new Date(expense.created_at), 'dd/MM/yyyy HH:mm', {
                                                        locale: ptBR,
                                                    })}
                                                </TableCell>
                                                <TableCell className="font-medium">{expense.description}</TableCell>
                                                <TableCell className="text-right font-medium">
                                                    R$ {expense.value.toFixed(2)}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <Button
                                                                variant="destructive"
                                                                size="sm"
                                                                className="h-8 w-8 p-0"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                    Tem certeza que deseja deletar esta despesa?
                                                                    <br />
                                                                    <strong>{expense.description}</strong> - R${' '}
                                                                    {expense.value.toFixed(2)}
                                                                    <br />
                                                                    Esta ação não pode ser desfeita.
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                                <AlertDialogAction
                                                                    onClick={() => deleteExpense(expense.id)}
                                                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                                >
                                                                    Deletar
                                                                </AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>

                            {/* Visualização Mobile - Cards */}
                            <div className="md:hidden space-y-3">
                                {filteredExpenses.map((expense) => (
                                    <Card key={expense.id} className="p-4">
                                        <div className="flex justify-between items-start gap-3">
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm text-muted-foreground mb-1">
                                                    {format(new Date(expense.created_at), 'dd/MM/yyyy HH:mm', {
                                                        locale: ptBR,
                                                    })}
                                                </p>
                                                <p className="font-medium text-base mb-2 break-words">
                                                    {expense.description}
                                                </p>
                                                <p className="text-lg font-bold text-primary">
                                                    R$ {expense.value.toFixed(2)}
                                                </p>
                                            </div>
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        className="h-9 w-9 p-0 flex-shrink-0"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent className="w-[95vw] max-w-[95vw] sm:max-w-lg">
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            Tem certeza que deseja deletar esta despesa?
                                                            <br />
                                                            <strong>{expense.description}</strong> - R${' '}
                                                            {expense.value.toFixed(2)}
                                                            <br />
                                                            Esta ação não pode ser desfeita.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                                                        <AlertDialogCancel className="w-full sm:w-auto">
                                                            Cancelar
                                                        </AlertDialogCancel>
                                                        <AlertDialogAction
                                                            onClick={() => deleteExpense(expense.id)}
                                                            className="w-full sm:w-auto bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                        >
                                                            Deletar
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
