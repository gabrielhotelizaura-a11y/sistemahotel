import { useState } from 'react';
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
import { Trash2, DollarSign, Plus } from 'lucide-react';
import { useExpenses } from '@/hooks/useExpenses';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
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

export default function Expenses() {
    const { expenses, loading, createExpense, deleteExpense } = useExpenses();
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [description, setDescription] = useState('');
    const [value, setValue] = useState('');

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

    const totalExpenses = expenses.reduce((sum, exp) => sum + exp.value, 0);

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold">Despesas do Mês</h1>
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
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <h1 className="text-2xl md:text-3xl font-bold">Despesas do Mês</h1>
                <Badge variant="outline" className="text-base md:text-lg px-3 md:px-4 py-1.5 md:py-2">
                    <DollarSign className="h-4 w-4 mr-1" />
                    Total: R$ {totalExpenses.toFixed(2)}
                </Badge>
            </div>

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
                    {expenses.length === 0 ? (
                        <p className="text-muted-foreground text-center py-8">
                            Nenhuma despesa registrada neste mês
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
                                        {expenses.map((expense) => (
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
                                {expenses.map((expense) => (
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
