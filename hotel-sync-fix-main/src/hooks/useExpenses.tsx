import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface OperationalExpense {
    id: string;
    description: string;
    value: number;
    created_at: string;
}

export function useExpenses() {
    const [expenses, setExpenses] = useState<OperationalExpense[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchExpenses = async () => {
        try {
            console.log('📊 Buscando despesas operacionais...');
            setLoading(true);

            const { data, error } = await supabase
                .from('operational_expenses' as any)
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            console.log(`✅ ${data?.length || 0} despesas operacionais encontradas`);
            setExpenses((data as any) || []);
        } catch (error: any) {
            console.error('❌ Erro ao buscar despesas:', error);
            toast.error('Erro ao carregar despesas');
        } finally {
            setLoading(false);
        }
    };

    const createExpense = async (description: string, value: number) => {
        try {
            console.log(`💰 Criando despesa: ${description} - R$ ${value}`);

            const { data, error } = await supabase
                .from('operational_expenses' as any)
                .insert({
                    description,
                    value,
                })
                .select();

            if (error) {
                console.error('❌ Erro do Supabase:', error);
                throw error;
            }

            console.log('✅ Despesa criada:', data);
            toast.success('Despesa adicionada com sucesso!');
            fetchExpenses();
            return true;
        } catch (error: any) {
            console.error('❌ Erro ao criar despesa:', error);
            const errorMsg = error?.message || error?.error_description || 'Erro desconhecido';
            toast.error(`Erro ao adicionar despesa: ${errorMsg}`);

            // Verifica se é erro de RLS
            if (errorMsg.includes('row-level security') || errorMsg.includes('RLS') || errorMsg.includes('policy')) {
                toast.error('⚠️ Problema de permissão! Veja o console para mais detalhes.');
                console.error('🔒 Erro de RLS. Execute este SQL no Supabase:');
                console.error(`
-- Desabilitar RLS na tabela operational_expenses
ALTER TABLE public.operational_expenses DISABLE ROW LEVEL SECURITY;
        `);
            }

            return false;
        }
    };

    const deleteExpense = async (expenseId: string) => {
        try {
            console.log(`🗑️ Deletando despesa ${expenseId}...`);

            const { error } = await supabase
                .from('operational_expenses' as any)
                .delete()
                .eq('id', expenseId);

            if (error) throw error;

            toast.success('Despesa deletada com sucesso!');
            fetchExpenses();
        } catch (error: any) {
            console.error('❌ Erro ao deletar despesa:', error);
            toast.error('Erro ao deletar despesa');
        }
    };

    useEffect(() => {
        fetchExpenses();

        // Atualiza a cada 30 segundos
        const interval = setInterval(fetchExpenses, 30000);
        return () => clearInterval(interval);
    }, []);

    return {
        expenses,
        loading,
        createExpense,
        deleteExpense,
        refetch: fetchExpenses,
    };
}
